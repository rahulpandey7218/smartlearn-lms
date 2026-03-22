const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 4000;

const dbConfig = {
  user: "system",
  password: "rahul123", // set your real password locally, do not commit it
  connectString: "localhost/XEPDB1"
};

app.use(cors());
app.use(express.json());

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
      `INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD)
       VALUES (:id, :fullName, :email, :password)`,
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
