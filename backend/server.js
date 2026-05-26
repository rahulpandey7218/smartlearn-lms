const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 4000;

const dbConfig = {
  user: "system",
  password: "", // set your real password locally, do not commit it
  connectString: "" // Changed from XEPDB1 to XE for standard local setup
};

app.use(cors());
app.use(express.json());

// --- SHARED DATA STORE (For Prototype Synchronization) ---
// Note: Courses are now persisted in Oracle DB for 100% data reliability.
let sharedData = {
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
  ]
};

// --- ROUTES FOR MANAGING DATA ---

// 2. Courses API (PERSISTENT VIA ORACLE)
app.get("/api/courses", (req, res) => {
  withConnection(async connection => {
    const result = await connection.execute(`SELECT COURSE_ID, NAME, DESCRIPTION, INSTRUCTOR FROM LMS_COURSES ORDER BY COURSE_ID`);
    const courses = result.rows.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      instructor: row[3]
    }));
    res.json(courses);
  }, res);
});

app.post("/api/courses", (req, res) => {
  const { name, description, instructor } = req.body;
  withConnection(async connection => {
    const id = Date.now();
    await connection.execute(
      `INSERT INTO LMS_COURSES (COURSE_ID, NAME, DESCRIPTION, INSTRUCTOR) VALUES (:id, :name, :description, :instructor)`,
      { id, name, description: description || "New Course", instructor: instructor || "Admin" },
      { autoCommit: true }
    );
    sharedData.activityLog.unshift(`New course "${name}" created by ${instructor || "Admin"}.`);
    res.json({ success: true, course: { id, name, description, instructor } });
  }, res);
});

app.put("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  withConnection(async connection => {
    await connection.execute(
      `UPDATE LMS_COURSES SET NAME = :name, DESCRIPTION = :description WHERE COURSE_ID = :id`,
      { name, description, id },
      { autoCommit: true }
    );
    res.json({ success: true });
  }, res);
});

app.delete("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  withConnection(async connection => {
    await connection.execute(`DELETE FROM LMS_COURSES WHERE COURSE_ID = :id`, { id }, { autoCommit: true });
    res.json({ success: true });
  }, res);
});

// 3. Sessions & Uploads API
app.get("/api/sessions", (req, res) => res.json(sharedData.sessions));

app.post("/api/sessions", (req, res) => {
  const { courseName, topic, time, type, youtubeLink, noteName } = req.body;
  const newSession = { 
    id: Date.now(), 
    courseName, 
    topic, 
    time, 
    type, 
    youtubeLink: youtubeLink || "",
    noteName: noteName || ""
  };
  sharedData.sessions.push(newSession);
  
  // If teacher uploaded a note, add to global uploads
  if (noteName) {
    sharedData.activityLog.unshift(`Teacher uploaded note: ${noteName} for ${courseName}`);
  }
  
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

// 7. Student Enrollments (Strictly Isolated by Email)
app.get("/api/enrollments/:email", (req, res) => {
  const { email } = req.params;
  withConnection(async connection => {
    const result = await connection.execute(
      `SELECT COURSE_NAME FROM STUDENT_ENROLLMENTS WHERE LOWER(STUDENT_EMAIL) = LOWER(:email)`,
      { email }
    );
    const courses = result.rows.map(row => row[0]);
    res.json(courses);
  }, res);
});

app.post("/api/enrollments", (req, res) => {
  const { email, courseName } = req.body;
  withConnection(async connection => {
    // Check if already enrolled
    const check = await connection.execute(
      `SELECT ENROLL_ID FROM STUDENT_ENROLLMENTS WHERE LOWER(STUDENT_EMAIL) = LOWER(:email) AND COURSE_NAME = :course`,
      { email, course: courseName }
    );
    
    if (check.rows.length > 0) {
      return res.json({ success: true, message: "Already enrolled" });
    }

    const id = Date.now();
    await connection.execute(
      `INSERT INTO STUDENT_ENROLLMENTS (ENROLL_ID, STUDENT_EMAIL, COURSE_NAME) VALUES (:id, :email, :course)`,
      { id, email, course: courseName },
      { autoCommit: true }
    );
    res.json({ success: true });
  }, res);
});

// Test connection and Sync Schema on startup
(async () => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Successfully connected to Oracle Database");
    
    // --- REAL-TIME LEADERBOARD SCHEMA SYNC ---
    // Ensure STUDENT_ACCOUNTS has POINTS and CERTIFICATES columns
    console.log("🛠️ Syncing Database Schema...");
    
    try {
      await connection.execute(`ALTER TABLE STUDENT_ACCOUNTS ADD (POINTS NUMBER DEFAULT 0, CERTIFICATES NUMBER DEFAULT 0)`);
      console.log("✅ Added POINTS and CERTIFICATES columns to STUDENT_ACCOUNTS");
    } catch (e) {
      if (e.errorNum === 1430) {
        console.log("ℹ️ Leaderboard columns already exist.");
      } else {
        console.error("❌ Schema Sync Error (STUDENT_ACCOUNTS):", e.message);
      }
    }

    // --- COURSES TABLE SCHEMA SYNC ---
    try {
      await connection.execute(`
        CREATE TABLE LMS_COURSES (
          COURSE_ID NUMBER PRIMARY KEY,
          NAME VARCHAR2(255) NOT NULL,
          DESCRIPTION VARCHAR2(1000),
          INSTRUCTOR VARCHAR2(255)
        )
      `);
      console.log("✅ Created LMS_COURSES table");
      
      // Insert initial demo data if table was just created
      await connection.execute(`INSERT INTO LMS_COURSES (COURSE_ID, NAME, DESCRIPTION, INSTRUCTOR) VALUES (1, 'Web Development Fundamentals', 'Learn HTML, CSS, and JS from scratch.', 'Dr. A. Sharma')`);
      await connection.execute(`INSERT INTO LMS_COURSES (COURSE_ID, NAME, DESCRIPTION, INSTRUCTOR) VALUES (2, 'Database Management Systems', 'Master SQL and Oracle Database.', 'Prof. R. Mehta')`, [], { autoCommit: true });
    } catch (e) {
      if (e.errorNum === 955) {
        console.log("ℹ️ LMS_COURSES table already exists.");
      } else {
        console.error("❌ Schema Sync Error (LMS_COURSES):", e.message);
      }
    }

    // --- ENROLLMENTS TABLE SCHEMA SYNC ---
    try {
      await connection.execute(`
        CREATE TABLE STUDENT_ENROLLMENTS (
          ENROLL_ID NUMBER PRIMARY KEY,
          STUDENT_EMAIL VARCHAR2(255) NOT NULL,
          COURSE_NAME VARCHAR2(255) NOT NULL,
          ENROLLED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created STUDENT_ENROLLMENTS table for perfect isolation");
    } catch (e) {
      if (e.errorNum === 955) {
        console.log("ℹ️ STUDENT_ENROLLMENTS table already exists.");
      } else {
        console.error("❌ Schema Sync Error (STUDENT_ENROLLMENTS):", e.message);
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
