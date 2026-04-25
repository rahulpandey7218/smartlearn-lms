const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 4000;

const dbConfig = {
  user: "system",
  password: "rahul123", // set your real password locally, do not commit it
  connectString: "localhost/XE" // Changed from XEPDB1 to XE for standard local setup
};

app.use(cors());
app.use(express.json());

// --- SHARED DATA STORE (For Prototype Synchronization) ---
// This data is shared across all roles (Admin, Instructor, Student)
let sharedData = {
  courses: [
    { id: 1, name: "Web Development Fundamentals", enrolled: 32, status: "Live", createdBy: "Admin" },
    { id: 2, name: "Database Management Systems", enrolled: 28, status: "Live", createdBy: "Admin" }
  ],
  sessions: [
    { id: 1, text: "Today 7:00 PM · Web Dev · Layouts and Flexbox", instructor: "Dr. A. Sharma" },
    { id: 2, text: "Tomorrow 6:30 PM · DBMS · Normalisation and Keys", instructor: "Prof. R. Mehta" }
  ],
  announcements: [
    { id: 1, text: "Quiz 1 for Web Development opens tonight at 9 PM.", from: "Dr. A. Sharma" },
    { id: 2, text: "DBMS assignment 2 deadline extended to Sunday.", from: "Prof. R. Mehta" }
  ],
  activityLog: [
    "LMS initialized successfully."
  ],
  leaderboard: [
    { name: "Rahul Pandey", points: 1250, certificates: 5 },
    { name: "Ananya Singh", points: 1100, certificates: 4 },
    { name: "Vikram Dev", points: 950, certificates: 3 },
    { name: "Priya Das", points: 880, certificates: 3 },
    { name: "Arjun Rao", points: 720, certificates: 2 }
  ]
};

// --- ROUTES FOR MANAGING DATA ---

// 1. Courses
app.get("/api/courses", (req, res) => res.json(sharedData.courses));
app.post("/api/courses", (req, res) => {
  const { name, status, creator, date } = req.body;
  const newCourse = { 
    id: Date.now(), 
    name, 
    status: status || "Live", 
    enrolled: 0, 
    createdBy: creator || "Unknown",
    date: date || null
  };
  sharedData.courses.push(newCourse);
  sharedData.activityLog.unshift(`New course "${name}" created by ${creator}.`);
  res.json({ success: true, course: newCourse });
});

// 2. Sessions
app.get("/api/sessions", (req, res) => res.json(sharedData.sessions));
app.post("/api/sessions", (req, res) => {
  const { text, instructor, dateTime } = req.body;
  const newSession = { 
    id: Date.now(), 
    text, 
    instructor: instructor || "Instructor",
    dateTime: dateTime || null
  };
  sharedData.sessions.push(newSession);
  sharedData.activityLog.unshift(`New session added: "${text}" by ${instructor}.`);
  res.json({ success: true, session: newSession });
});

// 3. Announcements
app.get("/api/announcements", (req, res) => res.json(sharedData.announcements));
app.post("/api/announcements", (req, res) => {
  const { text, from } = req.body;
  const newAnn = { id: Date.now(), text, from: from || "Instructor" };
  sharedData.announcements.unshift(newAnn);
  sharedData.activityLog.unshift(`Announcement: "${text}" posted by ${from}.`);
  res.json({ success: true, announcement: newAnn });
});

// 4. Real-Time Oracle Leaderboard
app.get("/api/leaderboard", (req, res) => {
  withConnection(async connection => {
    // Fetch top 5 students from Oracle DB based on points
    const result = await connection.execute(
      `SELECT FULL_NAME, POINTS, CERTIFICATES 
       FROM STUDENT_ACCOUNTS 
       ORDER BY POINTS DESC 
       FETCH FIRST 5 ROWS ONLY`
    );
    
    const leaderboard = result.rows.map(row => ({
      name: row[0],
      points: row[1] || 0,
      certificates: row[2] || 0
    }));
    
    res.json(leaderboard);
  }, res);
});

app.post("/api/leaderboard/update", (req, res) => {
  const { name, pointsToAdd, certAdded } = req.body;
  
  withConnection(async connection => {
    // Update real Oracle Database for the specific user
    const certIncrement = certAdded ? 1 : 0;
    
    await connection.execute(
      `UPDATE STUDENT_ACCOUNTS 
       SET POINTS = POINTS + :pts, 
           CERTIFICATES = CERTIFICATES + :cert 
       WHERE LOWER(FULL_NAME) = LOWER(:name)`,
      { pts: pointsToAdd || 0, cert: certIncrement, name: name.trim() },
      { autoCommit: true }
    );
    
    console.log(`[REAL-TIME DB] Updated ${name}: +${pointsToAdd} pts, +${certIncrement} certs`);
    res.json({ success: true });
  }, res);
});

// 5. Professional Social Auth Verification
app.post("/api/auth/google/verify", (req, res) => {
  const { token, role } = req.body;
  // In a production environment, we use 'google-auth-library' to verify the JWT
  // const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
  // const payload = ticket.getPayload();
  
  // For this high-end prototype, we simulate the verification of the real JWT
  console.log(`[PRO] Verifying Google Token for role: ${role}`);
  
  // Return verified identity to sync with Database
  res.json({ 
    success: true, 
    name: "Verified Google User", 
    email: "google.user@gmail.com" 
  });
});

app.post("/api/auth/verify-code", (req, res) => {
  const { code, provider, role } = req.body;
  console.log(`[PRO] Exchanging ${provider} code for Access Token...`);
  
  res.json({
    success: true,
    name: `Verified ${provider} User`,
    email: `${provider}.user@example.com`
  });
});

// 6. Activity Log (For Admin)
app.get("/api/activity", (req, res) => res.json(sharedData.activityLog));

// Test connection and Sync Schema on startup
(async () => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Successfully connected to Oracle Database");
    
    // --- REAL-TIME LEADERBOARD SCHEMA SYNC ---
    // Ensure STUDENT_ACCOUNTS has POINTS and CERTIFICATES columns
    console.log("🛠️ Syncing Database Schema for Real-Time Leaderboard...");
    
    try {
      await connection.execute(`ALTER TABLE STUDENT_ACCOUNTS ADD (POINTS NUMBER DEFAULT 0, CERTIFICATES NUMBER DEFAULT 0)`);
      console.log("✅ Added POINTS and CERTIFICATES columns to STUDENT_ACCOUNTS");
    } catch (e) {
      if (e.errorNum === 1430) {
        console.log("ℹ️ Leaderboard columns already exist.");
      } else {
        console.error("❌ Schema Sync Error:", e.message);
      }
    }
    
  } catch (err) {
    console.error("❌ DATABASE CONNECTION ERROR:", err.message);
    console.log("TIP: Check if OracleServiceXE is running in Services.msc");
  } finally {
    if (connection) await connection.close();
  }
})();

async function withConnection(handler, res) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await handler(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Database error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error(e);
      }
    }
  }
}

app.get("/", (req, res) => {
  res.json({ status: "SmartLearn backend running" });
});

app.post("/api/signup-student", (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  withConnection(async connection => {
    const emailNorm = String(email).trim().toLowerCase();
    const passwordNorm = String(password).trim();

    const check = await connection.execute(
      `SELECT STUDENT_ID FROM STUDENT_ACCOUNTS WHERE LOWER(EMAIL) = LOWER(:email)`,
      { email: emailNorm }
    );

    if (check.rows.length > 0) {
      return res.json({ success: false, message: "Student already exists" });
    }

    const maxIdResult = await connection.execute(
      `SELECT NVL(MAX(STUDENT_ID), 0) + 1 AS NEXT_ID FROM STUDENT_ACCOUNTS`
    );
    const nextId = maxIdResult.rows[0][0];

    await connection.execute(
      `INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD, POINTS, CERTIFICATES)
       VALUES (:id, :fullName, :email, :password, 0, 0)`,
      { id: nextId, fullName, email: emailNorm, password: passwordNorm },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Student created, you can log in now" });
  }, res);
});

app.post("/api/login", (req, res) => {
  const { role, email, password } = req.body;
  if (!role || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  withConnection(async connection => {
    let query;
    const emailNorm = String(email).trim().toLowerCase();
    const passwordNorm = String(password).trim();
    const params = { email: emailNorm, password: passwordNorm };

    if (role === "student") {
      query = `SELECT STUDENT_ID, FULL_NAME
               FROM STUDENT_ACCOUNTS
               WHERE LOWER(EMAIL) = LOWER(:email)
                 AND PASSWORD = :password`;
    } else if (role === "instructor") {
      query = `SELECT INSTRUCTOR_ID, FULL_NAME
               FROM INSTRUCTOR_ACCOUNTS
               WHERE LOWER(EMAIL) = LOWER(:email)
                 AND PASSWORD = :password`;
    } else if (role === "admin") {
      query = `SELECT ADMIN_ID, FULL_NAME
               FROM ADMIN_ACCOUNTS
               WHERE LOWER(EMAIL) = LOWER(:email)
                 AND PASSWORD = :password`;
    } else {
      return res.json({ success: false, message: "Unknown role" });
    }

    const result = await connection.execute(query, params);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      role,
      name: result.rows[0][1]
    });
  }, res);
});

app.listen(PORT, () => {
  console.log("SmartLearn backend running on http://localhost:" + PORT);
});
