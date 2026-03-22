SmartLearn LMS – Database Queries (Oracle SQL*)
===============================================

Use these queries in SQL*Plus while connected as the SYSTEM user
to create and manage login data for the project.

------------------------------------------------------------
1. Create tables
------------------------------------------------------------

-- 1.1 Student accounts
CREATE TABLE STUDENT_ACCOUNTS (
  STUDENT_ID NUMBER PRIMARY KEY,
  FULL_NAME  VARCHAR2(100) NOT NULL,
  EMAIL      VARCHAR2(150) NOT NULL UNIQUE,
  PASSWORD   VARCHAR2(60)  NOT NULL,
  CREATED_AT DATE DEFAULT SYSDATE
);

-- 1.2 Instructor accounts
CREATE TABLE INSTRUCTOR_ACCOUNTS (
  INSTRUCTOR_ID NUMBER PRIMARY KEY,
  FULL_NAME     VARCHAR2(100) NOT NULL,
  EMAIL         VARCHAR2(150) NOT NULL UNIQUE,
  PASSWORD      VARCHAR2(60)  NOT NULL,
  DEPARTMENT    VARCHAR2(80),
  CREATED_AT    DATE DEFAULT SYSDATE
);

-- 1.3 Admin accounts
CREATE TABLE ADMIN_ACCOUNTS (
  ADMIN_ID   NUMBER PRIMARY KEY,
  FULL_NAME  VARCHAR2(100) NOT NULL,
  EMAIL      VARCHAR2(150) NOT NULL UNIQUE,
  PASSWORD   VARCHAR2(60)  NOT NULL,
  CREATED_AT DATE DEFAULT SYSDATE
);

-- 1.4 (Optional) Login history
CREATE TABLE LOGIN_HISTORY (
  LOGIN_ID    NUMBER PRIMARY KEY,
  USER_ROLE   VARCHAR2(20)  NOT NULL,  -- 'STUDENT', 'INSTRUCTOR', 'ADMIN'
  USER_EMAIL  VARCHAR2(150) NOT NULL,
  LOGIN_TIME  DATE          DEFAULT SYSDATE,
  LOGOUT_TIME DATE
);

------------------------------------------------------------
2. Insert initial demo data
------------------------------------------------------------

-- 2.1 Students (two sample rows)
INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD)
VALUES (1, 'Rahul Kumar', 'rahul@example.com', 'Rahul@123');

INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD)
VALUES (2, 'Ananya Singh', 'ananya@example.com', 'Ananya@123');

-- 2.2 Demo student used in UI text
INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD)
VALUES (3, 'Demo Student', 'student@smartlearn.in', 'Student@123');

-- 2.3 Instructors (two sample rows)
INSERT INTO INSTRUCTOR_ACCOUNTS (INSTRUCTOR_ID, FULL_NAME, EMAIL, PASSWORD, DEPARTMENT)
VALUES (1, 'Dr. A. Sharma', 'instructor@smartlearn.in', 'Instructor@123', 'Web Development');

INSERT INTO INSTRUCTOR_ACCOUNTS (INSTRUCTOR_ID, FULL_NAME, EMAIL, PASSWORD, DEPARTMENT)
VALUES (2, 'Prof. R. Mehta', 'mehta@smartlearn.in', 'Mehta@123', 'Database Systems');

-- 2.4 Admin (single powerful admin)
INSERT INTO ADMIN_ACCOUNTS (ADMIN_ID, FULL_NAME, EMAIL, PASSWORD)
VALUES (1, 'System Administrator', 'admin@smartlearn.in', 'Admin@123');

COMMIT;

------------------------------------------------------------
3. Update passwords for demo accounts (if needed)
------------------------------------------------------------

-- Ensure passwords match the values expected by the web UI
UPDATE STUDENT_ACCOUNTS
SET PASSWORD = 'Student@123'
WHERE LOWER(EMAIL) = LOWER('student@smartlearn.in');

UPDATE INSTRUCTOR_ACCOUNTS
SET PASSWORD = 'Instructor@123'
WHERE LOWER(EMAIL) = LOWER('instructor@smartlearn.in');

UPDATE ADMIN_ACCOUNTS
SET PASSWORD = 'Admin@123'
WHERE LOWER(EMAIL) = LOWER('admin@smartlearn.in');

COMMIT;

------------------------------------------------------------
4. Insert a new student manually from SQL*Plus
------------------------------------------------------------

-- 4.1 Find next free STUDENT_ID
SELECT NVL(MAX(STUDENT_ID), 0) + 1 AS NEXT_ID
FROM STUDENT_ACCOUNTS;

-- 4.2 Use that NEXT_ID in the INSERT (example uses 4)
INSERT INTO STUDENT_ACCOUNTS (STUDENT_ID, FULL_NAME, EMAIL, PASSWORD)
VALUES (
  4,                        -- replace 4 with NEXT_ID from previous query
  'Rahul Demo',
  'rahuldemo@example.com',
  'Rahul@123'
);

COMMIT;

------------------------------------------------------------
5. Check data in each table
------------------------------------------------------------

-- 5.1 All students
COLUMN STUDENT_ID FORMAT 9999;
COLUMN FULL_NAME  FORMAT A20;
COLUMN EMAIL      FORMAT A30;
COLUMN PASSWORD   FORMAT A15;

SELECT STUDENT_ID, FULL_NAME, EMAIL, PASSWORD
FROM STUDENT_ACCOUNTS;

-- 5.2 All instructors
COLUMN INSTRUCTOR_ID FORMAT 9999;
SELECT INSTRUCTOR_ID, FULL_NAME, EMAIL, PASSWORD
FROM INSTRUCTOR_ACCOUNTS;

-- 5.3 Admin accounts
COLUMN ADMIN_ID FORMAT 9999;
SELECT ADMIN_ID, FULL_NAME, EMAIL, PASSWORD
FROM ADMIN_ACCOUNTS;

-- 5.4 Optional: login history
SELECT LOGIN_ID, USER_ROLE, USER_EMAIL, LOGIN_TIME, LOGOUT_TIME
FROM LOGIN_HISTORY;

