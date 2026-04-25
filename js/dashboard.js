const courseProgressList = document.getElementById("courseProgressList");
const plannerWeeks = document.getElementById("plannerWeeks");
const examDateInput = document.getElementById("examDate");
const weeklyHoursInput = document.getElementById("weeklyHours");
const planButton = document.getElementById("planButton");
const microGoalsList = document.getElementById("microGoalsList");
const streakValue = document.getElementById("streakValue");
const streakButton = document.getElementById("streakButton");
const announcementList = document.getElementById("announcementList");
const availableCoursesList = document.getElementById("availableCoursesList");
const leaderboardList = document.getElementById("leaderboardList");

const API_BASE = "http://localhost:4000/api";

// Helper to escape HTML tags for rendering (Fix for empty quiz options)
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

async function postData(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error(`Error posting to ${endpoint}:`, err);
    return { success: false };
  }
}

async function renderLeaderboard() {
  if (!leaderboardList) return;
  const data = await fetchData("leaderboard");
  leaderboardList.innerHTML = "";
  
  data.forEach((user, index) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.justifyContent = "space-between";
    item.style.padding = "8px 0";
    item.style.borderBottom = index < data.length - 1 ? "1px solid var(--border-subtle)" : "none";
    
    const rank = index + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
    
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: bold; color: var(--accent-strong); width: 20px;">${medal}</span>
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 500;">${user.name}</span>
          <span style="font-size: 11px; color: var(--muted);">${user.certificates} certificates</span>
        </div>
      </div>
      <div style="font-weight: bold; color: var(--accent-strong);">${user.points} pts</div>
    `;
    leaderboardList.appendChild(item);
  });
}

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return [];
  }
}

function requireRole(allowedRoles) {
  const role = window.localStorage.getItem("smartlearn-session-role");
  if (!role || allowedRoles.indexOf(role) === -1) {
    window.location.href = "login.html";
  }
}

requireRole(["student", "instructor"]);

const ENROLLED_KEY = "smartlearn-enrolled-courses";

function getEnrolledCourses() {
  const raw = window.localStorage.getItem(ENROLLED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function setEnrolledCourses(list) {
  window.localStorage.setItem(ENROLLED_KEY, JSON.stringify(list));
}

async function renderAvailableCourses() {
  if (!availableCoursesList) return;
  const courses = await fetchData("courses");
  const enrolled = getEnrolledCourses();
  
  availableCoursesList.innerHTML = "";
  courses.forEach(course => {
    const row = document.createElement("div");
    row.className = "available-course-row";
    const isEnrolled = enrolled.includes(course.name);
    
    row.innerHTML = `
      <div class="available-course-text">${course.name}</div>
      <button class="btn ${isEnrolled ? 'btn-primary' : 'btn-outline'} btn-compact">
        ${isEnrolled ? 'Go to session' : 'Join session'}
      </button>
    `;
    
    row.querySelector("button").addEventListener("click", () => {
      if (!isEnrolled) {
        enrolled.push(course.name);
        setEnrolledCourses(enrolled);
        renderCourseProgress();
        renderAvailableCourses();
      }
      window.location.href = "learning-path.html";
    });
    availableCoursesList.appendChild(row);
  });
}

async function renderCourseProgress() {
  if (!courseProgressList) return;
  const enrolled = getEnrolledCourses();
  courseProgressList.innerHTML = "";
  
  if (!enrolled.length) {
    courseProgressList.innerHTML = "<p class='dashboard-subtitle'>Join a course below to start learning.</p>";
    return;
  }

  enrolled.forEach(name => {
    const row = document.createElement("div");
    row.className = "progress-row dashboard-progress-row";
    row.style.flexDirection = "column";
    row.style.alignItems = "flex-start";
    row.style.gap = "8px";
    row.style.marginBottom = "20px";
    
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <span class="progress-label">${name}</span>
        <span class="progress-value">20%</span>
      </div>
      <div class="progress-bar" style="width: 100%;"><div class="progress-fill" style="width: 20%"></div></div>
      <div style="display: flex; gap: 8px; width: 100%; margin-top: 4px;">
        <button class="btn btn-outline btn-compact" style="font-size: 10px; flex: 1;" onclick="openLessonViewer()">Lesson</button>
        <button class="btn btn-primary btn-compact" style="font-size: 10px; flex: 1;" onclick="openQuiz('${name}')">AI Quiz</button>
      </div>
    `;
    courseProgressList.appendChild(row);
  });
}

async function renderAnnouncements() {
  if (!announcementList) return;
  const announcements = await fetchData("announcements");
  announcementList.innerHTML = "";
  if (!announcements.length) {
    announcementList.innerHTML = "<li>No announcements yet.</li>";
    return;
  }
  announcements.forEach(ann => {
    const item = document.createElement("li");
    
    // Make URLs clickable (especially for Live Class links)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedText = ann.text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" style="color: var(--accent-strong); text-decoration: underline;">Join Live Meeting</a>`;
    });
    
    item.innerHTML = `<strong>${ann.from}:</strong> ${formattedText}`;
    announcementList.appendChild(item);
  });
}

// Reuse existing functions for planner and streak
function generateStudyPlan() {
  if (!plannerWeeks || !examDateInput || !weeklyHoursInput) return;
  const dateValue = examDateInput.value;
  const hours = parseInt(weeklyHoursInput.value, 10);
  if (!dateValue || isNaN(hours)) return;
  
  plannerWeeks.innerHTML = "<div class='planner-week-card'><h3>Study Plan Generated</h3><p>Focusing on your active courses.</p></div>";
}

function updateStreakDisplay() {
  if (!streakValue) return;
  const streak = window.localStorage.getItem("smartlearn-streak") || 0;
  streakValue.textContent = `${streak} days`;
}

// Lesson Viewer Logic (Phase 3)
window.openLessonViewer = function() {
  const modal = document.getElementById("lessonModal");
  if (modal) modal.style.display = "flex";
};

window.closeLessonViewer = function() {
  const modal = document.getElementById("lessonModal");
  if (modal) modal.style.display = "none";
};

// AI-Simulated Dynamic Quiz Engine (Phase 5)
let currentQuizQuestion = 0;
let quizScore = 0;
let activeQuizSubject = "";
let activeQuizData = [];

const quizPool = {
  "Web Development": [
    { q: "Which tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>"], correct: 2 },
    { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"], correct: 1 },
    { q: "Which attribute is used for unique ID?", options: ["class", "id", "name"], correct: 1 },
    { q: "Which tag is used for a link?", options: ["<link>", "<a>", "<href>"], correct: 1 },
    { q: "How do you make a list that lists the items with numbers?", options: ["<dl>", "<ul>", "<ol>"], correct: 2 },
    { q: "Which property is used to change background color?", options: ["color", "bgcolor", "background-color"], correct: 2 },
    { q: "Which CSS property controls text size?", options: ["font-style", "text-size", "font-size"], correct: 2 },
    { q: "How do you select an element with id 'demo'?", options: [".demo", "#demo", "demo"], correct: 1 },
    { q: "What is the correct HTML for adding a background color?", options: ["<body bg='yellow'>", "<body style='background-color:yellow;'>", "<background>yellow</background>"], correct: 1 },
    { q: "Which HTML element is used to specify a footer for a document?", options: ["<bottom>", "<footer>", "<section>"], correct: 1 },
    { q: "In CSS, what is the correct option to select all p elements inside a div?", options: ["div p", "div + p", "div.p"], correct: 0 },
    { q: "Which HTML tag is used to define an internal style sheet?", options: ["<css>", "<script>", "<style>"], correct: 2 }
  ],
  "Database Management Systems": [
    { q: "What does SQL stand for?", options: ["Structured Query Language", "Strong Question Language", "Structured Question Layout"], correct: 0 },
    { q: "Which SQL statement is used to extract data?", options: ["GET", "SELECT", "EXTRACT"], correct: 1 },
    { q: "Which SQL statement is used to update data?", options: ["MODIFY", "SAVE", "UPDATE"], correct: 2 },
    { q: "Which SQL statement is used to delete data?", options: ["REMOVE", "DELETE", "COLLAPSE"], correct: 1 },
    { q: "Which SQL statement is used to insert new data?", options: ["INSERT INTO", "ADD RECORD", "INSERT NEW"], correct: 0 },
    { q: "What is the default sort order for ORDER BY?", options: ["Descending", "Ascending", "Random"], correct: 1 },
    { q: "Which SQL keyword is used to sort the result-set?", options: ["SORT BY", "ORDER BY", "ARRANGE BY"], correct: 1 },
    { q: "How can you return all the records from a table named 'Persons'?", options: ["SELECT * FROM Persons", "SELECT [all] FROM Persons", "SELECT Persons"], correct: 0 },
    { q: "Which SQL statement is used to return only different values?", options: ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT DIFFERENT"], correct: 1 },
    { q: "Which operator is used to select a range of values?", options: ["WITHIN", "BETWEEN", "RANGE"], correct: 1 },
    { q: "What is a primary key?", options: ["A key that opens all tables", "A unique identifier for a record", "A common field between tables"], correct: 1 },
    { q: "Which SQL constraint ensures that a column cannot have a NULL value?", options: ["UNIQUE", "NOT NULL", "CHECK"], correct: 1 }
  ],
  "General Computer Science": [
    { q: "Which of the following is an Operating System?", options: ["Chrome", "Windows", "Office"], correct: 1 },
    { q: "What is the brain of a computer?", options: ["RAM", "CPU", "Hard Disk"], correct: 1 },
    { q: "Which language is primarily used for Android apps?", options: ["Swift", "Kotlin/Java", "C#"], correct: 1 },
    { q: "What does HTTP stand for?", options: ["Hypertext Transfer Protocol", "High Text Transfer Process", "Hyperlink Text Trade Protocol"], correct: 0 },
    { q: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array"], correct: 1 },
    { q: "What is 1010 in decimal?", options: ["8", "10", "12"], correct: 1 },
    { q: "Which is not a programming language?", options: ["Python", "HTML", "Java"], correct: 1 },
    { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Action Module"], correct: 1 },
    { q: "Who is known as the father of computers?", options: ["Bill Gates", "Charles Babbage", "Alan Turing"], correct: 1 },
    { q: "Which device is used to connect to the internet?", options: ["Monitor", "Router/Modem", "Scanner"], correct: 1 },
    { q: "Which of these is a volatile memory?", options: ["Hard Drive", "RAM", "ROM"], correct: 1 },
    { q: "What is the main purpose of an IP address?", options: ["To store data", "To identify a device on a network", "To run programs"], correct: 1 }
  ]
};

window.openQuiz = function(subject) {
  window.closeLessonViewer();
  const modal = document.getElementById("quizModal");
  if (!modal) return;

  const modalContent = modal.querySelector(".google-modal-content");
  
  // If no subject is passed (e.g. from Nav Bar), show a Subject Selection screen
  if (!subject) {
    const enrolled = getEnrolledCourses();
    if (enrolled.length === 0) {
      alert("Please join a course first to take a quiz!");
      return;
    }
    
    modal.style.display = "flex";
    modalContent.innerHTML = `
      <div class="google-header"><span>Select Quiz Subject</span></div>
      <div style="padding: 30px; text-align: center;">
        <p style="margin-bottom: 20px; color: var(--muted);">Choose a subject to verify your knowledge:</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${enrolled.map(name => `
            <button class="btn btn-outline" style="width: 100%;" onclick="openQuiz('${name}')">${name}</button>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  activeQuizSubject = subject;
  currentQuizQuestion = 0;
  quizScore = 0;
  
  // AI Simulation: Randomly pick 10 questions from the pool
  // Use subject-specific pool, or generic CS pool if subject not found
  const pool = quizPool[subject] || quizPool["General Computer Science"];
  activeQuizData = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
  
  renderQuizQuestion();
  modal.style.display = "flex";
};

function renderQuizQuestion() {
  const modalContent = document.querySelector("#quizModal .google-modal-content");
  if (!modalContent) return;
  
  const q = activeQuizData[currentQuizQuestion];
  modalContent.innerHTML = `
    <div class="google-header" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;">
      <span>Smart AI Quiz: ${activeQuizSubject}</span>
      <button onclick="document.getElementById('quizModal').style.display='none'" style="background:none; border:none; color:white; cursor:pointer; font-size:20px;">&times;</button>
    </div>
    <div style="padding: 30px; background: var(--bg);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <span style="color: var(--accent-strong); font-size: 13px; font-weight: 700; letter-spacing: 1px;">QUESTION ${currentQuizQuestion + 1} / 10</span>
        <span style="background: var(--accent-soft); padding: 5px 12px; border-radius: 20px; font-size: 12px; color: var(--accent-strong); border: 1px solid var(--accent-strong);">CURRENT SCORE: ${quizScore}</span>
      </div>
      
      <div style="background: var(--bg-elevated); padding: 25px; border-radius: 15px; border: 1px solid var(--border-subtle); margin-bottom: 25px;">
        <p style="margin: 0; font-size: 20px; line-height: 1.5; color: var(--text);"><strong>${escapeHTML(q.q)}</strong></p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        ${q.options.map((opt, idx) => `
          <button class="btn btn-outline quiz-option-btn" 
            style="justify-content: flex-start; text-align: left; padding: 18px 25px; font-size: 16px; border-radius: 12px; transition: all 0.2s ease; border-color: var(--border-subtle); width: 100%;" 
            onclick="handleQuizAnswer(${idx})"
            onmouseover="this.style.borderColor='var(--accent-strong)'; this.style.background='var(--accent-soft)';"
            onmouseout="this.style.borderColor='var(--border-subtle)'; this.style.background='rgba(15, 23, 42, 0.7)';"
          >
            <span style="background: var(--accent-strong); color: #000; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 15px; font-weight: bold; font-size: 14px;">
              ${String.fromCharCode(65 + idx)}
            </span> 
            ${escapeHTML(opt)}
          </button>
        `).join('')}
      </div>

      <div style="margin-top: 35px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 8px;">
          <span>Progress</span>
          <span>${(currentQuizQuestion + 1) * 10}%</span>
        </div>
        <div style="height: 6px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-subtle);">
          <div style="width: ${(currentQuizQuestion + 1) * 10}%; height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-strong)); transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        </div>
      </div>
    </div>
  `;
}

window.handleQuizAnswer = function(selectedIndex) {
  if (selectedIndex === activeQuizData[currentQuizQuestion].correct) {
    quizScore++;
  }
  
  currentQuizQuestion++;
  if (currentQuizQuestion < 10) {
    renderQuizQuestion();
  } else {
    completeQuiz();
  }
};

async function completeQuiz() {
  const modal = document.getElementById("quizModal");
  if (modal) modal.style.display = "none";
  
  const percentage = (quizScore / 10) * 100;
  const name = window.localStorage.getItem("smartlearn-user-name") || "Student";
  const cleanName = name.replace("(Google)", "").replace("(Github)", "").replace("(Apple)", "").trim();

  if (percentage >= 75) {
    alert(`🎉 Brilliant! You scored ${percentage}% (${quizScore}/10).\nAI has verified your expertise in ${activeQuizSubject}.`);
    
    // Update streak and points
    const current = parseInt(window.localStorage.getItem("smartlearn-streak") || 0);
    window.localStorage.setItem("smartlearn-streak", current + 1);
    updateStreakDisplay();
    
    await postData("leaderboard/update", { 
      name: cleanName, 
      pointsToAdd: quizScore * 20, 
      certAdded: true 
    });
    
    renderLeaderboard();
    generateCertificate(activeQuizSubject); 
  } else {
    alert(`⚠️ Score: ${percentage}% (${quizScore}/10).\nAI Verification Failed: You need at least 75% to earn a certificate. Please revise and try again!`);
  }
}

// Smart Brain Feature: Digital Certificate Generator
window.generateCertificate = function(subject = "Web Development Fundamentals") {
  const modal = document.getElementById("certificateModal");
  const nameDisplay = document.getElementById("certName");
  const dateDisplay = document.getElementById("certDate");
  const subjectDisplay = document.querySelector("#certificateModal h3");
  
  if (modal) {
    const name = window.localStorage.getItem("smartlearn-user-name") || "Student";
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    if (nameDisplay) nameDisplay.textContent = name.replace("(Google)", "").replace("(Github)", "").replace("(Apple)", "").trim();
    if (dateDisplay) dateDisplay.textContent = date;
    if (subjectDisplay) subjectDisplay.textContent = subject;
    
    modal.style.display = "flex";
  }
};

window.closeCertificate = function() {
  const element = document.querySelector("#certificateModal .google-modal-content");
  const btn = element.querySelector("button");
  
  // Hide the download button from the PDF
  if (btn) btn.style.display = "none";

  const opt = {
    margin: 0,
    filename: 'SmartLearn_Certificate.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };

  // Generate real PDF
  html2pdf().set(opt).from(element).save().then(() => {
    // Show the button back
    if (btn) btn.style.display = "block";
    const modal = document.getElementById("certificateModal");
    if (modal) modal.style.display = "none";
    alert("✅ Real Certificate downloaded successfully!");
  });
};

// Initial render
renderCourseProgress();
updateStreakDisplay();
renderAnnouncements();
renderAvailableCourses();
renderLeaderboard();

if (planButton) planButton.addEventListener("click", generateStudyPlan);
if (streakButton) streakButton.addEventListener("click", () => {
  const current = parseInt(window.localStorage.getItem("smartlearn-streak") || 0);
  window.localStorage.setItem("smartlearn-streak", current + 1);
  updateStreakDisplay();
});
