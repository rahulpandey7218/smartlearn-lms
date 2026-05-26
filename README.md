# 🎓 SmartLearn: AI-Powered Enterprise LMS (Final Version)

**SmartLearn** is a professional, high-end Learning Management System (LMS) engineered to transform traditional education into a dynamic, AI-driven experience. Built with a robust full-stack architecture and 100% real-time Oracle Database persistence, it provides a personalized, secure, and industry-standard learning journey.

---

## 🌟 Core Innovations

### 🧠 Advanced AI Content Matcher & Roadmap Engine
SmartLearn uses a custom **Advanced AI Content Matcher** in [learningPath.js](file:///c:/Users/user/OneDrive/Desktop/web%20project(pbl)/web%20Pbl%20project/js/learningPath.js) that:
- **Context-Aware Analysis:** Analyzes both the course title and the admin-provided description to pick the most relevant technical content.
- **Weighted Keyword Scoring:** Ranks videos and topics based on technical depth (e.g., distinguishing between "Python Basics" and "Advanced Python Optimization").
- **Dynamic Technical Blueprints:** Generates in-depth technical analysis for every sub-topic without sequential confusion.

### 🎥 Smart YouTube Mastery Suggester
Integrates a specialized **YouTube Subject Matcher** that:
- **Authority Mapping:** Maps courses to high-quality tutorials from MIT, CS50, and elite technical educators.
- **Smart Fallback:** Ensures the video section is NEVER empty by providing a "Technical Mastery" masterclass for unknown subjects.
- **Science & Engineering Support:** Includes dedicated mastery paths for Physics, Chemistry, Math, and Engineering.

### 📖 Smart AI Library Integration
A new **Technical Library** feature that provides:
- **Wikipedia Mastery:** Direct links to full technical documentation for the active subject.
- **AI-Curated Books:** Access to professional technical guides and books on Google Books for deep theoretical learning.

### 🗄️ 100% Oracle Database Persistence & Isolation
The platform is fully synchronized with an Oracle backend:
- **LMS_COURSES:** All courses are stored in the database, ensuring they are never lost on server restart.
- **STUDENT_ENROLLMENTS:** A dedicated enrollment table ensures that Student A's course choices are 100% private and never visible to Student B.
- **Real-Time Leaderboard:** Competitive ranking fetched directly from the `STUDENT_ACCOUNTS` table based on points and certificates.

### 🛡️ Multi-User Progress Isolation
- **getUserKey Logic:** Every mastered topic, personal note, and "In-Progress" status is isolated by the user's email.
- **Persistent Status Toggles:** Students can mark topics as "Mastered" or "In Progress" directly inside the AI modal, with statuses saved permanently in the cloud.

---

## 🛠️ Technical Stack

- **Frontend:** HTML5, CSS3 (Modern Glassmorphism UI), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js (RESTful API Design).
- **Database:** Oracle Database 21c/XE (via `oracledb`).
- **Libraries:** 
  - `html2pdf.js`: Client-side document generation.
  - `cors`: Secure cross-origin resource sharing.

---

## 🏗️ Project Architecture

```text
[Frontend: Student/Admin/Instructor] 
      |
      | (Isolated API Calls - Port 4000)
      v
[Backend: Node.js/Express Server] 
      |
      | (oracledb Persistent Driver)
      v
[Database: Oracle SQL Engine]
      |
      +-- STUDENT_ACCOUNTS (Global Identity)
      +-- LMS_COURSES (Persistent Course Store)
      +-- STUDENT_ENROLLMENTS (Private Course Choices)
```

---

## 🚀 Installation & Deployment

### 1. Database Initialization
1. Ensure **Oracle Service XE** is running.
2. The schema (Accounts, Courses, Enrollments) is automatically synced on server startup.
3. Update the `dbConfig` in `backend/server.js` with your local credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup
Open `index.html` using a **Live Server** to ensure proper API communication.

---

## 👥 Project Team

- **Rahul Pandey** - Lead Developer & Oracle DB Architect
- **Ananya Singh** - AI Path Logic & Subject Engine Specialist
- **Vikram Dev** - Backend API & CRUD Management
- **Priya Das** - UI/UX & AI Quiz System Developer
- **Arjun Rao** - Frontend Integration & File Management

---

**Developed with ❤️ for the Web PBL Project.**

