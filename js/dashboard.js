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

function requireRole(allowedRoles) {
  const role = window.localStorage.getItem("smartlearn-session-role");
  if (!role || allowedRoles.indexOf(role) === -1) {
    window.location.href = "login.html";
  }
}

requireRole(["student", "instructor"]);

const sampleCourses = {
  "Web Development": { completed: 6, total: 10 },
  "DBMS": { completed: 4, total: 10 },
  "Operating Systems": { completed: 3, total: 8 }
};

const ENROLLED_KEY = "smartlearn-enrolled-courses";

function getEnrolledCourses() {
  const raw = window.localStorage.getItem(ENROLLED_KEY);
  if (!raw) {
    return ["Web Development"];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
    return ["Web Development"];
  } catch (error) {
    return ["Web Development"];
  }
}

function setEnrolledCourses(list) {
  window.localStorage.setItem(ENROLLED_KEY, JSON.stringify(list));
}

const microGoals = [
  "Revise one previously completed topic",
  "Attempt one quiz or practice test",
  "Add two key notes to any lesson"
];

const announcements = [
  "Live doubt-clearing session for DBMS on Friday at 6 PM.",
  "Quiz 2 for Web Development will close tonight at 11:59 PM.",
  "New practice set added to Aptitude course: Time and Work."
];

function renderAvailableCourses() {
  if (!availableCoursesList) {
    return;
  }
  const enrolled = getEnrolledCourses();
  availableCoursesList.innerHTML = "";
  Object.keys(sampleCourses).forEach(function (name) {
    const row = document.createElement("div");
    row.className = "available-course-row";
    const text = document.createElement("div");
    text.className = "available-course-text";
    text.textContent = name;
    const button = document.createElement("button");
    button.type = "button";
    const isEnrolled = enrolled.indexOf(name) !== -1;
    button.className = isEnrolled ? "btn btn-primary btn-compact" : "btn btn-outline btn-compact";
    button.textContent = isEnrolled ? "Go to session" : "Join session";
    button.addEventListener("click", function () {
      const current = getEnrolledCourses();
      if (current.indexOf(name) === -1) {
        current.push(name);
        setEnrolledCourses(current);
        renderCourseProgress();
      }
      renderAvailableCourses();
      window.location.href = "learning-path.html";
    });
    row.appendChild(text);
    row.appendChild(button);
    availableCoursesList.appendChild(row);
  });
}

function renderCourseProgress() {
  if (!courseProgressList) {
    return;
  }
  courseProgressList.innerHTML = "";
  const enrolled = getEnrolledCourses();
  if (!enrolled.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-subtitle";
    empty.textContent = "No active courses yet. Join a course below to start a session.";
    courseProgressList.appendChild(empty);
    return;
  }
  enrolled.forEach(function (name) {
    const info = sampleCourses[name];
    if (!info) {
      return;
    }
    const percentage = info.total ? Math.round((info.completed / info.total) * 100) : 0;
    const row = document.createElement("div");
    row.className = "progress-row dashboard-progress-row";
    const label = document.createElement("span");
    label.className = "progress-label";
    label.textContent = name;
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = String(percentage) + "%";
    bar.appendChild(fill);
    const value = document.createElement("span");
    value.className = "progress-value";
    value.textContent = String(percentage) + "%";
    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(value);
    courseProgressList.appendChild(row);
  });
}

function generateStudyPlan() {
  if (!plannerWeeks || !examDateInput || !weeklyHoursInput) {
    return;
  }
  const dateValue = examDateInput.value;
  const hours = parseInt(weeklyHoursInput.value, 10);
  if (!dateValue || Number.isNaN(hours) || hours <= 0) {
    plannerWeeks.textContent = "Enter a valid exam date and weekly hours to generate a plan.";
    return;
  }
  const today = new Date();
  const exam = new Date(dateValue + "T00:00:00");
  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 7);
  const weeks = Math.max(Math.round(diffDays / 7), 1);
  const topics = ["HTML basics", "CSS layouts", "Responsive design", "JavaScript basics", "DOM and events", "Forms and validation", "Mini project polish"];
  const topicsPerWeek = Math.ceil(topics.length / weeks);
  plannerWeeks.innerHTML = "";
  for (let week = 1; week <= weeks; week += 1) {
    const start = (week - 1) * topicsPerWeek;
    const group = topics.slice(start, start + topicsPerWeek);
    if (!group.length) {
      break;
    }
    const card = document.createElement("div");
    card.className = "planner-week-card";
    const title = document.createElement("h3");
    title.textContent = "Week " + week;
    const hoursText = document.createElement("p");
    hoursText.className = "planner-week-hours";
    hoursText.textContent = String(hours) + " study hours";
    const list = document.createElement("ul");
    list.className = "planner-week-list";
    group.forEach(function (topic) {
      const item = document.createElement("li");
      item.textContent = topic;
      list.appendChild(item);
    });
    card.appendChild(title);
    card.appendChild(hoursText);
    card.appendChild(list);
    plannerWeeks.appendChild(card);
  }
}

function renderMicroGoals() {
  if (!microGoalsList) {
    return;
  }
  microGoalsList.innerHTML = "";
  microGoals.forEach(function (goalText, index) {
    const item = document.createElement("li");
    item.className = "goal";
    if (index === 0) {
      item.classList.add("done");
    }
    item.textContent = goalText;
    microGoalsList.appendChild(item);
  });
}

function getStreak() {
  const storedValue = window.localStorage.getItem("smartlearn-streak");
  const parsed = storedValue ? parseInt(storedValue, 10) : 3;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function updateStreakDisplay() {
  if (!streakValue) {
    return;
  }
  const streak = getStreak();
  streakValue.textContent = streak + (streak === 1 ? " day" : " days");
}

function incrementStreak() {
  const streak = getStreak() + 1;
  window.localStorage.setItem("smartlearn-streak", String(streak));
  updateStreakDisplay();
}

function renderAnnouncements() {
  if (!announcementList) {
    return;
  }
  announcementList.innerHTML = "";
  announcements.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    announcementList.appendChild(item);
  });
}

renderCourseProgress();
renderMicroGoals();
updateStreakDisplay();
renderAnnouncements();
renderAvailableCourses();

if (planButton) {
  planButton.addEventListener("click", generateStudyPlan);
}

if (streakButton) {
  streakButton.addEventListener("click", incrementStreak);
}
