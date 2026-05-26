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

// User-Specific Helper: Get unique key for the current logged-in user
function getUserKey(baseKey) {
  const email = window.localStorage.getItem("smartlearn-session-email") || "guest";
  return `${baseKey}-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

const ENROLLED_KEY = "smartlearn-enrolled-courses";

async function getEnrolledCourses() {
  const email = window.localStorage.getItem("smartlearn-session-email");
  if (!email) return [];
  const res = await fetch(`${API_BASE}/enrollments/${email}`);
  return await res.json();
}

async function setEnrolledCourses(courseName) {
  const email = window.localStorage.getItem("smartlearn-session-email");
  if (!email) return;
  await postData("enrollments", { email, courseName });
}

async function renderAvailableCourses() {
  if (!availableCoursesList) return;
  
  // Strict API Sync: Get only courses that exist in the Backend Database
  const allCourses = await fetchData("courses");
  const enrolled = await getEnrolledCourses();
  availableCoursesList.innerHTML = "";

  if (allCourses.length === 0) {
    availableCoursesList.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <p style="color: var(--muted); font-size: 14px;">No courses are currently active in the system.</p>
      </div>`;
    return;
  }

  allCourses.forEach(course => {
    const isEnrolled = enrolled.includes(course.name);
    const row = document.createElement("div");
    row.className = "card course-card";
    row.style.marginBottom = "15px";
    row.innerHTML = `
      <div class="card-header">
        <h2>${course.name}</h2>
        <span class="card-tag">${isEnrolled ? 'Enrolled' : 'Available'}</span>
      </div>
      <div class="card-body">
        <p style="height: 40px; overflow: hidden;">${course.description || "Expert-led training in " + course.name}</p>
        <button class="btn ${isEnrolled ? 'btn-outline' : 'btn-primary'}" style="width: 100%; margin-top: 15px;">
          ${isEnrolled ? 'View Learning Path' : 'Join Course'}
        </button>
      </div>
    `;

    row.querySelector("button").addEventListener("click", async () => {
      if (!isEnrolled) {
        await setEnrolledCourses(course.name);
        alert(`🎉 Successfully joined ${course.name}!`);
        await renderCourseProgress();
        await renderAvailableCourses();
      }
      // Set the context and go to path (User-Specific)
      window.localStorage.setItem(getUserKey("smartlearn-active-course"), course.name);
      window.location.href = "learning-path.html";
    });
    availableCoursesList.appendChild(row);
  });
}

async function renderCourseProgress() {
  if (!courseProgressList) return;
  
  // 1. Fetch latest courses from API to verify existence
  const allCourses = await fetchData("courses");
  const enrolled = await getEnrolledCourses();
  
  // 2. Synchronize: Ensure we only show courses that still exist in the database
  const validEnrolled = enrolled.filter(courseName => 
    allCourses.some(c => c.name === courseName)
  );
  
  courseProgressList.innerHTML = "";
  
  if (!validEnrolled.length) {
    courseProgressList.innerHTML = `
      <div style="text-align: center; padding: 20px; border: 1px dashed var(--border-subtle); border-radius: 12px;">
        <p class='dashboard-subtitle' style="margin-bottom: 0;">You haven't joined any active courses yet.</p>
        <p style="font-size: 11px; color: var(--muted); margin-top: 5px;">Join a course below to start your personalized learning path.</p>
      </div>`;
    return;
  }

  validEnrolled.forEach(name => {
    // Get course details for ID
    const courseData = allCourses.find(c => c.name === name);
    const courseId = courseData ? courseData.id : "";
    
    const row = document.createElement("div");
    row.className = "progress-row dashboard-progress-row";
    row.style.flexDirection = "column";
    row.style.alignItems = "flex-start";
    row.style.gap = "8px";
    row.style.marginBottom = "20px";
    row.style.background = "var(--bg-elevated)";
    row.style.padding = "15px";
    row.style.borderRadius = "12px";
    row.style.border = "1px solid var(--border-subtle)";
    
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <span class="progress-label" style="font-weight: 700; font-size: 15px;">${name}</span>
        <span class="progress-value" style="color: var(--accent-strong); font-weight: bold;">In Progress</span>
      </div>
      <div class="progress-bar" style="width: 100%; height: 6px; background: var(--bg); border: 1px solid var(--border-subtle);"><div class="progress-fill" style="width: 35%; background: linear-gradient(90deg, var(--accent), var(--accent-strong));"></div></div>
      <div style="display: flex; gap: 8px; width: 100%; margin-top: 8px;">
        <button class="btn btn-outline btn-compact" style="font-size: 11px; flex: 1; border-radius: 8px;" onclick="goToPath('${name}')">Open Roadmap</button>
        <button class="btn btn-primary btn-compact" style="font-size: 11px; flex: 1; border-radius: 8px;" onclick="openQuiz('${name}')">Start AI Quiz</button>
      </div>
    `;
    courseProgressList.appendChild(row);
  });
}

window.goToPath = function(courseName) {
  window.localStorage.setItem(getUserKey("smartlearn-active-course"), courseName);
  window.location.href = "learning-path.html";
};

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
    { q: "Which HTML element is used to specify a footer for a document?", options: ["<bottom>", "<footer>", "<section>"], correct: 1 }
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
    { q: "Which operator is used to select a range of values?", options: ["WITHIN", "BETWEEN", "RANGE"], correct: 1 }
  ],
  "Artificial Intelligence": [
    { q: "What is the primary goal of AI?", options: ["To make computers faster", "To simulate human intelligence", "To build robots"], correct: 1 },
    { q: "Which language is most popular for AI development?", options: ["C++", "Java", "Python"], correct: 2 },
    { q: "What does NLP stand for in AI?", options: ["Natural Language Processing", "Neural Logic Programming", "Node Level Path"], correct: 0 },
    { q: "Who is known as the father of AI?", options: ["Alan Turing", "John McCarthy", "Elon Musk"], correct: 1 },
    { q: "A Turing Test is used to determine what?", options: ["Processing speed", "Machine intelligence", "Network security"], correct: 1 },
    { q: "What is a Neural Network modeled after?", options: ["Human Brain", "Social Media", "The Internet"], correct: 0 },
    { q: "Which of these is a subset of Machine Learning?", options: ["Big Data", "Deep Learning", "Cloud Computing"], correct: 1 },
    { q: "What is 'Supervised Learning'?", options: ["Learning with labels", "Learning by itself", "Learning from mistakes"], correct: 0 },
    { q: "What is a 'Bot' in AI?", options: ["A hardware part", "An automated program", "A type of virus"], correct: 1 },
    { q: "What is Computer Vision?", options: ["Watching movies", "Machine understanding images", "A new type of monitor"], correct: 1 }
  ],
  "Python": [
    { q: "What is the correct file extension for Python files?", options: [".pt", ".py", ".pyt"], correct: 1 },
    { q: "How do you create a variable in Python?", options: ["var x = 5", "x = 5", "int x = 5"], correct: 1 },
    { q: "Which function is used to output text to the screen?", options: ["echo()", "print()", "console.log()"], correct: 1 },
    { q: "How do you start a FOR loop in Python?", options: ["for x in y:", "for(x=0; x<y; x++)", "foreach x in y"], correct: 0 },
    { q: "Which collection is ordered, changeable, and allows duplicates?", options: ["Tuple", "Set", "List"], correct: 2 },
    { q: "How do you insert a comment in Python code?", options: ["//", "/* */", "#"], correct: 2 },
    { q: "Which keyword is used to create a function?", options: ["function", "def", "fun"], correct: 1 },
    { q: "What is the result of 3 * 3?", options: ["6", "9", "33"], correct: 1 },
    { q: "How do you handle exceptions in Python?", options: ["try/catch", "try/except", "do/handle"], correct: 1 },
    { q: "Which method removes whitespace from string start/end?", options: ["strip()", "trim()", "cut()"], correct: 0 }
  ]
};

window.openQuiz = function(subject) {
  window.closeLessonViewer();
  const modal = document.getElementById("quizModal");
  if (!modal) return;

  const modalContent = modal.querySelector(".google-modal-content");
  
  // 1. Precise Subject Recognition Logic
  let matchedSubject = "";
  const normalizedSearch = (subject || "").toLowerCase().trim();

  for (const key in quizPool) {
    if (normalizedSearch.includes(key.toLowerCase())) {
      matchedSubject = key;
      break;
    }
  }

  // 2. If no exact subject is found, show Subject Selection
  if (!matchedSubject) {
    const enrolled = getEnrolledCourses();
    modal.style.display = "flex";
    modalContent.innerHTML = `
      <div class="google-header"><span>AI Subject Selection</span></div>
      <div style="padding: 30px; text-align: center;">
        <p style="margin-bottom: 20px; color: var(--muted);">AI could not automatically identify the quiz pool for "<strong>${subject || 'this course'}</strong>". Please select the subject manually:</p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${Object.keys(quizPool).map(key => `
            <button class="btn btn-outline" style="width: 100%;" onclick="openQuiz('${key}')">${key}</button>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  activeQuizSubject = matchedSubject;
  currentQuizQuestion = 0;
  quizScore = 0;
  
  // 3. AI Randomization: Pick 10 questions specifically for this subject
  const pool = quizPool[matchedSubject];
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
(async () => {
  await renderCourseProgress();
  updateStreakDisplay();
  await renderAnnouncements();
  await renderAvailableCourses();
  await renderLeaderboard();
})();

if (planButton) planButton.addEventListener("click", generateStudyPlan);
if (streakButton) streakButton.addEventListener("click", () => {
  const current = parseInt(window.localStorage.getItem("smartlearn-streak") || 0);
  window.localStorage.setItem("smartlearn-streak", current + 1);
  updateStreakDisplay();
});
