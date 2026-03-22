function requireInstructor() {
  const role = window.localStorage.getItem("smartlearn-session-role");
  if (role !== "instructor") {
    window.location.href = "login.html";
  }
}

requireInstructor();

const instructorCoursesList = document.getElementById("instructorCoursesList");
const upcomingSessionsList = document.getElementById("upcomingSessionsList");
const instructorAnnouncementsList = document.getElementById("instructorAnnouncementsList");
const instructorAnnouncementForm = document.getElementById("instructorAnnouncementForm");
const INSTRUCTOR_ANNOUNCEMENTS_KEY = "smartlearn-instructor-announcements";

const instructorCourses = [
  { name: "Web Development Fundamentals", enrolled: 32, status: "Live" },
  { name: "Database Management Systems", enrolled: 28, status: "Live" },
  { name: "Programming with Python", enrolled: 24, status: "Planned" }
];

const upcomingSessions = [
  "Today 7:00 PM · Web Dev · Layouts and Flexbox",
  "Tomorrow 6:30 PM · DBMS · Normalisation and Keys",
  "Saturday 5:00 PM · Python · Functions and Modules"
];

function loadInstructorAnnouncements() {
  const raw = window.localStorage.getItem(INSTRUCTOR_ANNOUNCEMENTS_KEY);
  if (!raw) {
    return [
      "Quiz 1 for Web Development opens tonight at 9 PM.",
      "DBMS assignment 2 deadline extended to Sunday.",
      "Next live session will focus on project doubts."
    ];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
    return [];
  } catch (error) {
    return [];
  }
}

function saveInstructorAnnouncements(list) {
  window.localStorage.setItem(INSTRUCTOR_ANNOUNCEMENTS_KEY, JSON.stringify(list));
}

let instructorAnnouncements = loadInstructorAnnouncements();

function renderInstructorCourses() {
  if (!instructorCoursesList) {
    return;
  }
  instructorCoursesList.innerHTML = "";
  instructorCourses.forEach(function (course) {
    const row = document.createElement("div");
    row.className = "available-course-row";
    const text = document.createElement("div");
    text.className = "available-course-text";
    text.textContent = course.name + " · " + course.enrolled + " learners";
    const status = document.createElement("span");
    status.className = "card-tag";
    status.textContent = course.status;
    row.appendChild(text);
    row.appendChild(status);
    instructorCoursesList.appendChild(row);
  });
}

function renderUpcomingSessions() {
  if (!upcomingSessionsList) {
    return;
  }
  upcomingSessionsList.innerHTML = "";
  upcomingSessions.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    upcomingSessionsList.appendChild(item);
  });
}

function renderInstructorAnnouncements() {
  if (!instructorAnnouncementsList) {
    return;
  }
  instructorAnnouncementsList.innerHTML = "";
  instructorAnnouncements.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    instructorAnnouncementsList.appendChild(item);
  });
}

function handleInstructorAnnouncementSubmit(event) {
  event.preventDefault();
  if (!instructorAnnouncementForm) {
    return;
  }
  const input = document.getElementById("instructorAnnouncementText");
  if (!input) {
    return;
  }
  const value = input.value.trim();
  if (!value) {
    return;
  }
  instructorAnnouncements.unshift(value);
  saveInstructorAnnouncements(instructorAnnouncements);
  renderInstructorAnnouncements();
  input.value = "";
}

renderInstructorCourses();
renderUpcomingSessions();
renderInstructorAnnouncements();

if (instructorAnnouncementForm) {
  instructorAnnouncementForm.addEventListener("submit", handleInstructorAnnouncementSubmit);
}

