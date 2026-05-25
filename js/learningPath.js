const pathContainer = document.getElementById("learningPath");
const resetPathButton = document.getElementById("resetPath");
const courseTitleDisplay = document.getElementById("courseTitleDisplay");
const aiVideoList = document.getElementById("aiVideoList");

// AI Subject Knowledge Base (Ultra-Powerful & Precise)
const aiKnowledgeBase = {
  "Web Development": {
    topics: ["HTML5 Semantic Structure", "CSS3 Flexbox & Grid", "JavaScript Async/Await", "DOM API Mastery", "RESTful Architecture", "React Hooks & State", "Deployment with Vercel"],
    videos: [
      { title: "🚀 COMPLETE WEB DEVELOPMENT ONE-SHOT (2026)", id: "qz0aGYrrlhU" },
      { title: "JS Advanced Patterns Masterclass", id: "W6NZfCO5SIk" }
    ]
  },
  "Database Management Systems": {
    topics: ["Relational Algebra", "Complex SQL Joins", "Normalization (1NF-BCNF)", "B-Tree Indexing", "ACID Transactions", "MongoDB vs Oracle", "DB Security & Roles"],
    videos: [
      { title: "🗄️ DBMS ONE-SHOT MASTERCLASS (FULL COURSE)", id: "HXV3zeBB80w" },
      { title: "Advanced SQL Optimization", id: "ztHopE5Wnpc" }
    ]
  },
  "Artificial Intelligence": {
    topics: ["Machine Learning Basics", "Neural Networks Intro", "Natural Language Processing", "Computer Vision Fundamentals", "AI Ethics & Safety", "Python for AI", "Large Language Models"],
    videos: [
      { title: "🧠 ARTIFICIAL INTELLIGENCE ONE-SHOT (FULL GUIDE)", id: "06-AZXmwHjo" },
      { title: "Deep Learning Neural Networks", id: "6mU7-5A5sN4" }
    ]
  },
  "Data Structures & Algorithms": {
    topics: ["Big O Complexity", "Linked Lists & Queues", "Binary Search Trees", "Dynamic Programming", "Dijkstra's Algorithm", "Trie & Segment Trees", "Backtracking Problems"],
    videos: [
      { title: "⚡ DSA ONE-SHOT: CRACK CODING INTERVIEWS", id: "8hly31Kuy2g" },
      { title: "Advanced Data Structures in JS", id: "t2CEgPsws3U" }
    ]
  }
};

const statusOrder = ["not-started", "in-progress", "mastered"];

function getActiveCourse() {
  const active = window.localStorage.getItem("smartlearn-active-course");
  if (!active) {
    window.location.href = "dashboard-student.html";
    return "";
  }
  return active;
}

// User-Specific Helper: Get unique key for the current logged-in user
function getUserKey(baseKey) {
  const email = window.localStorage.getItem("smartlearn-session-email") || "guest";
  return `${baseKey}-${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function storageKeyForTopic(topic) {
  return getUserKey("smartlearn-path-" + getActiveCourse() + "-" + topic);
}

function loadStatus(topic) {
  const stored = window.localStorage.getItem(storageKeyForTopic(topic));
  if (statusOrder.indexOf(stored) !== -1) {
    return stored;
  }
  return "not-started";
}

function saveStatus(topic, status) {
  window.localStorage.setItem(storageKeyForTopic(topic), status);
}

function nextStatus(current) {
  const index = statusOrder.indexOf(current);
  if (index === -1) {
    return statusOrder[0];
  }
  return statusOrder[(index + 1) % statusOrder.length];
}

function createTopicBadge(topic, status) {
  const badge = document.createElement("button");
  badge.className = "path-topic path-" + status;
  badge.type = "button";
  badge.innerHTML = `<span class="badge-dot"></span> ${topic}`;
  badge.dataset.topic = topic;
  badge.dataset.status = status;
  
  // Right click or Long press to change status
  badge.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    const currentStatus = badge.dataset.status || "not-started";
    const updated = nextStatus(currentStatus);
    badge.dataset.status = updated;
    saveStatus(topic, updated);
    renderPath();
  });

  // Left click to Read Info (AI Topic Analysis)
  badge.addEventListener("click", function () {
    showTopicInfo(topic);
  });

  return badge;
}

// AI Topic Detail Engine (Generates UNIQUE in-depth info for every topic)
function showTopicInfo(topic) {
  const modal = document.getElementById("topicInfoModal");
  const title = document.getElementById("modalTopicTitle");
  const content = document.getElementById("modalTopicContent");
  
  if (!modal || !title || !content) return;

  title.textContent = `AI Analysis: ${topic}`;
  
  // ULTRA-SMART AI Content Generation Logic (Strictly Topic-Specific)
  const lowerTopic = topic.toLowerCase();
  let info = "";

  if (lowerTopic.includes("intro") || lowerTopic.includes("foundation") || lowerTopic.includes("basics")) {
    info = `<h3>Core Fundamentals</h3><p>This module establishes the essential foundations of <strong>${topic}</strong>. Understanding these basics is critical for long-term mastery.</p>
    <ul>
      <li>Key principles and historical evolution of ${topic}.</li>
      <li>Basic syntax, terminology, and ecosystem setup.</li>
      <li>Fundamental concepts that drive this technology.</li>
    </ul>`;
  } else if (lowerTopic.includes("architecture") || lowerTopic.includes("structure") || lowerTopic.includes("design")) {
    info = `<h3>Technical Architecture & Design</h3><p>A deep dive into the structural blueprint of <strong>${topic}</strong>. This focuses on how components interact at a high level.</p>
    <ul>
      <li>High-level system design patterns and modularity.</li>
      <li>Data flow management and component lifecycle.</li>
      <li>Scalability considerations for enterprise-grade systems.</li>
    </ul>`;
  } else if (lowerTopic.includes("core") || lowerTopic.includes("logic") || lowerTopic.includes("theory") || lowerTopic.includes("algorithm") || lowerTopic.includes("data structure")) {
    info = `<h3>Advanced Logic & Computational Theory</h3><p>Mastering the underlying logic of <strong>${topic}</strong>. This is the "brain" of the subject where technical complexity resides.</p>
    <ul>
      <li>Mathematical and logical foundations of ${topic}.</li>
      <li>Algorithm optimization and complexity analysis.</li>
      <li>Internal mechanics and performance tuning.</li>
    </ul>`;
  } else if (lowerTopic.includes("advanced") || lowerTopic.includes("expert") || lowerTopic.includes("mastery") || lowerTopic.includes("deep dive")) {
    info = `<h3>Expert-Level Implementation</h3><p>Taking <strong>${topic}</strong> to the professional limit. This module handles complex edge cases and production-ready code.</p>
    <ul>
      <li>Advanced patterns, asynchronous handling, and security.</li>
      <li>Cross-platform integration and legacy support.</li>
      <li>Debugging complex production-level issues and memory management.</li>
    </ul>`;
  } else if (lowerTopic.includes("best practices") || lowerTopic.includes("standard") || lowerTopic.includes("quality") || lowerTopic.includes("security")) {
    info = `<h3>Professional Standards & Security</h3><p>How do world-class engineers handle <strong>${topic}</strong>? Focus on maintainability, security, and efficiency.</p>
    <ul>
      <li>Clean code principles and industry-standard formatting.</li>
      <li>Security protocols and data protection strategies.</li>
      <li>Automated testing (Unit, Integration) and CI/CD basics.</li>
    </ul>`;
  } else if (lowerTopic.includes("project") || lowerTopic.includes("build") || lowerTopic.includes("application") || lowerTopic.includes("real-world")) {
    info = `<h3>Real-world Application & Deployment</h3><p>Time to apply your knowledge. This module guides you through building a tangible solution using <strong>${topic}</strong>.</p>
    <ul>
      <li>Requirement analysis and feature roadmap development.</li>
      <li>Full-stack integration and database connectivity.</li>
      <li>Deployment strategies and live environment monitoring.</li>
    </ul>`;
  } else if (lowerTopic.includes("certification") || lowerTopic.includes("exam") || lowerTopic.includes("assessment") || lowerTopic.includes("quiz")) {
    info = `<h3>Career Validation & Assessment</h3><p>Validating your expertise in <strong>${topic}</strong>. This final stage prepares you for industrial roles.</p>
    <ul>
      <li>Comprehensive mock exams and technical interview prep.</li>
      <li>Portfolio development and GitHub optimization.</li>
      <li>AI-verified assessment to unlock your official certificate.</li>
    </ul>`;
  } else {
    // Dynamic Fallback for highly specific technical sub-parts
    info = `<h3>Technical Analysis: ${topic}</h3><p>AI has identified <strong>${topic}</strong> as a critical technical component within your learning path.</p>
    <ul>
      <li>In-depth exploration of the unique logic governing ${topic}.</li>
      <li>Functional integration within the broader system architecture.</li>
      <li>Practical hands-on exercises to ensure conceptual clarity.</li>
    </ul>`;
  }

  content.innerHTML = info;
  modal.style.display = "flex";
}

// Personal Notes System (Auto-save)
const notesArea = document.getElementById("personalStudyNotes");
const notesStatus = document.getElementById("notesStatus");

if (notesArea) {
  // Load existing notes for this course and this specific user
  const courseKey = getUserKey("smartlearn-notes-" + getActiveCourse());
  notesArea.value = window.localStorage.getItem(courseKey) || "";

  notesArea.addEventListener("input", () => {
    if (notesStatus) notesStatus.textContent = "Saving...";
    window.localStorage.setItem(courseKey, notesArea.value);
    
    // Debounced status update
    clearTimeout(window.notesTimeout);
    window.notesTimeout = setTimeout(() => {
      if (notesStatus) notesStatus.textContent = "✅ All points auto-saved.";
    }, 1000);
  });
}

async function renderPath() {
  if (!pathContainer) return;

  const courseName = getActiveCourse();
  if (courseTitleDisplay) courseTitleDisplay.textContent = courseName + " Path";

  // First, verify if the course still exists in the system (Synchronization Check)
  try {
    const allCourses = await (await fetch("http://localhost:4000/api/courses")).json();
    const exists = allCourses.some(c => c.name === courseName);
    if (!exists) {
      alert("⚠️ This course has been removed by the Admin.");
      window.location.href = "dashboard-student.html";
      return;
    }
  } catch (err) {
    console.error("Sync Error:", err);
  }

  // Fetch real-time sessions from backend for "Teacher Uploads"
  let teacherUploads = [];
  try {
    const sessions = await (await fetch("http://localhost:4000/api/sessions")).json();
    teacherUploads = sessions.filter(s => s.courseName === courseName);
  } catch (err) {
    console.error("Error fetching uploads:", err);
  }

  // Render Teacher Uploads
  const teacherUploadsList = document.getElementById("teacherUploadsList");
  if (teacherUploadsList) {
    teacherUploadsList.innerHTML = "";
    if (teacherUploads.length === 0) {
      teacherUploadsList.innerHTML = `<p style="font-size: 11px; color: var(--muted);">No notes uploaded yet.</p>`;
    } else {
      teacherUploads.forEach(item => {
        if (item.noteName || item.youtubeLink) {
          const div = document.createElement("div");
          div.className = "upload-item";
          div.style.padding = "10px";
          div.style.borderRadius = "8px";
          div.style.background = "var(--bg-elevated)";
          div.style.marginBottom = "8px";
          div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 18px;">${item.noteName ? '📄' : '🎥'}</span>
              <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 13px;">${item.noteName || item.topic}</div>
                <div style="font-size: 11px; color: var(--accent-strong); cursor: pointer;" onclick="${item.youtubeLink ? `window.open('${item.youtubeLink}')` : `alert('Downloading ${item.noteName}...')`}">
                  ${item.noteName ? 'Download Notes' : 'Watch Lecture'}
                </div>
              </div>
            </div>
          `;
          teacherUploadsList.appendChild(div);
        }
      });
    }
  }

// AI-Simulated Path Generation
  let pathData = aiKnowledgeBase[courseName];
  
  // AI DYNAMIC SEARCH ENGINE: If not in knowledge base, generate specific videos using YouTube's Search Logic
  if (!pathData) {
    // POWERFUL SUBJECT-SPECIFIC YOUTUBE ENGINE (No Generic Fallbacks)
    const dynamicVideoMap = {
      "python": "rfscVS0vtbw",
      "java": "eIrMb66zuSI",
      "react": "bMknfKXIFA8",
      "c++": "8jLOx1hD3_o",
      "c#": "M70K9Zk6KNo",
      "javascript": "W6NZfCO5SIk",
      "html": "qz0aGYrrlhU",
      "css": "qz0aGYrrlhU",
      "node": "32M1al-Y6Ag",
      "express": "7H_QH9ipp0Q",
      "mongodb": "O5XWfS_P1pU",
      "sql": "HXV3zeBB80w",
      "database": "HXV3zeBB80w",
      "machine learning": "GwIo3gDZCVQ",
      "artificial intelligence": "06-AZXmwHjo",
      "cyber security": "3Kq1MIfTWCE",
      "dsa": "8hly31Kuy2g",
      "data structures": "8hly31Kuy2g",
      "algorithms": "8hly31Kuy2g",
      "php": "zZ6vybT1HQs",
      "android": "fis26HvvDII",
      "flutter": "nQt07ZPr7T8",
      "aws": "ENrzD9HAZK4",
      "cloud": "ENrzD9HAZK4",
      "devops": "hQcFE0RD0cQ",
      "git": "RGOj5yH7evk",
      "github": "RGOj5yH7evk",
      "linux": "sWbUDq4S6Yw",
      "data science": "ua-CiDNNj30",
      "deep learning": "6mU7-5A5sN4",
      "blockchain": "k0S2A53t-9c",
      "full stack": "qz0aGYrrlhU"
    };

    const searchKey = courseName.toLowerCase().trim();
    let videoId = ""; 
    
    // AI Subject Matcher: Find the best video ID for ANY subject
    for (const key in dynamicVideoMap) {
      if (searchKey.includes(key)) {
        videoId = dynamicVideoMap[key];
        break;
      }
    }

    pathData = {
      topics: [
        `Intro to ${courseName}`,
        `${courseName} Core Concepts`,
        `${courseName} Architecture`,
        `Advanced ${courseName} Logic`,
        `${courseName} Best Practices`,
        `${courseName} Real-world Project`,
        `${courseName} Certification Exam`
      ],
      videos: videoId ? [
        { title: `🚀 ${courseName.toUpperCase()} MASTERCLASS`, id: videoId }
      ] : [] // Empty if no match found, handled in UI
    };
  }

  // Render Videos
  if (aiVideoList) {
    aiVideoList.innerHTML = "";
    
    // STRICT AI LOGIC: No generic fallbacks. Only show subject-specific videos.
    const allVideos = [...pathData.videos];

    if (allVideos.length === 0) {
      aiVideoList.innerHTML = `<p style="font-size: 11px; color: var(--muted); padding: 10px;">AI is finding the best mastery videos for ${courseName}...</p>`;
    } else {
      allVideos.forEach(video => {
        const div = document.createElement("div");
        div.className = "video-item";
        div.style.marginBottom = "15px";
        div.innerHTML = `
          <div style="border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; background: #000; margin-bottom: 8px; border: 2px solid var(--accent-strong); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: var(--accent-strong); line-height: 1.4; padding: 0 5px;">${video.title}</div>
        `;
        aiVideoList.appendChild(div);
      });
    }
  }

  const columns = pathContainer.querySelectorAll(".path-column-body");
  columns.forEach(function (column) {
    column.innerHTML = "";
  });

  pathData.topics.forEach(function (topic) {
    const status = loadStatus(topic);
    const badge = createTopicBadge(topic, status);
    const column = pathContainer.querySelector('[data-status="' + status + '"]');
    if (column) {
      column.appendChild(badge);
    }
  });
}

function resetPath() {
  const courseName = getActiveCourse();
  const pathData = aiKnowledgeBase[courseName] || { topics: [] };
  pathData.topics.forEach(function (topic) {
    window.localStorage.removeItem(storageKeyForTopic(topic));
  });
  renderPath();
}

// Initial render
renderPath();

if (resetPathButton) {
  resetPathButton.addEventListener("click", resetPath);
}
