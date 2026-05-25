# 🎓 SmartLearn: AI-Powered Enterprise LMS

**SmartLearn** is a professional, high-end Learning Management System (LMS) engineered to transform traditional education into a dynamic, AI-driven experience. Built with a robust full-stack architecture and real-time Oracle Database integration, it provides a personalized, secure, and industry-standard learning journey.


## 🌟 Core Innovations

### 🧠 AI-Driven Topic Analysis & Roadmap Engine
Unlike static platforms, SmartLearn uses a custom **AI Topic Analysis Engine** in [learningPath.js](file:///c:/Users/user/OneDrive/Desktop/web%20project(pbl)/web%20Pbl%20project/js/learningPath.js). It dynamically analyzes course keywords to generate:
- **Technical Blueprints:** In-depth technical analysis for every sub-topic.
- **Dynamic Roadmaps:** Customized learning paths that adapt based on the course subject.
- **Smart Sequence Logic:** Eliminates generic labeling, providing strictly technical context.

### 🎥 High-Fidelity Mastery Video Suggester
Integrates a specialized **YouTube Subject Matcher**. It replaces generic "Intro" videos with expert-level mastery tutorials (e.g., advanced Python patterns, DBMS normalization, DSA optimization) by mapping course metadata to high-quality educational IDs.

### 🗄️ Real-Time Oracle Database Sync
Powered by the `oracledb` driver, the platform features:
- **Persistent Storage:** All student, instructor, and admin accounts are stored in high-performance Oracle tables.
- **Live Leaderboard:** A real-time competitive ranking system that fetches top performers directly from the database based on points and certifications.
- **CRUD Synchronization:** Course management (Create, Update, Delete) reflects instantly across all user roles via a standardized Port 4000 API.

### 📝 AI Quiz & Professional PDF Certification
A sophisticated assessment engine that:
- Generates subject-specific randomized quizzes.
- Implements strict **75% Threshold Logic** for passing.
- Issues authentic, downloadable **PDF Certificates** using `html2pdf.js` for successful students.

### 🛡️ Enterprise-Grade Security & Isolation
- **Multi-User Isolation:** Uses custom `getUserKey` session logic to ensure User A never sees User B's progress, notes, or mastered topics.
- **Role-Based Access Control (RBAC):** Strict dashboard protection ensures only authorized users can access Admin or Instructor panels.

---

## 🛠️ Technical Stack

- **Frontend:** HTML5, CSS3 (Modern Glassmorphism UI), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js (RESTful API Design).
- **Database:** Oracle Database 21c/XE (via `oracledb`).
- **Libraries:** 
  - `html2pdf.js`: Client-side document generation.
  - `cors`: Secure cross-origin resource sharing.
  - `express.json`: Efficient payload handling.

---

## 🏗️ Project Architecture

```text
[Frontend: Student/Admin/Instructor] 
      |
      | (REST API Calls - Port 4000)
      v
[Backend: Node.js/Express Server] 
      |
      | (oracledb Driver)
      v
[Database: Oracle SQL Engine]
      |
      +-- STUDENT_ACCOUNTS (Points, Certs, Credentials)
      +-- INSTRUCTOR_ACCOUNTS (Departments, Lectures)
      +-- ADMIN_ACCOUNTS (System Control)
```

---

## 🚀 Installation & Deployment

### 1. Database Initialization
1. Ensure **Oracle Service XE** is running.
2. Execute the schema scripts found in [DB_QUERIES_README.txt](file:///c:/Users/user/OneDrive/Desktop/web%20project(pbl)/web%20Pbl%20project/DB_QUERIES_README.txt).
3. Update the `dbConfig` in `backend/server.js` with your local credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup
Simply open `index.html` using a **Live Server** (VS Code extension) to ensure proper API communication.

---

## 👥 Project Team & Contributions

| Member | Role | Key Contribution |
| :--- | :--- | :--- |
| **Rahul Pandey** | Lead Developer | Oracle DB Architecture & Backend Logic |
| **Ananya Singh** | AI Engineer | Dynamic Path Logic & YouTube Engine |
| **Vikram Dev** | Full Stack Dev | Dashboard CRUD & Role Management |
| **Priya Das** | UI/UX Developer | AI Quiz System & PDF Generation |
| **Arjun Rao** | Frontend Lead | File Management & User Isolation |

---

## 📜 GitHub Push Instructions

To update the final code to your repository:
1. `git add .`
2. `git commit -m "Final: Professional AI LMS SmartLearn with Oracle DB Sync"`
3. `git push origin main`

---

## 🔮 Future Roadmap
- [ ] Integration of real-time video conferencing for live lectures.
- [ ] AI Chatbot for 24/7 student doubt resolution.
- [ ] Advanced instructor analytics dashboard with progress heatmaps.

---
**Developed with ❤️ for the Web  Project.**
