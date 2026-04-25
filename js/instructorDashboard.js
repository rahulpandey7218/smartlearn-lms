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
const instructorCourseForm = document.getElementById("instructorCourseForm");
const instructorSessionForm = document.getElementById("instructorSessionForm");

const API_BASE = "http://localhost:4000/api";
const userName = window.localStorage.getItem("smartlearn-user-name") || "Instructor";

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

async function renderInstructorCourses() {
  if (!instructorCoursesList) return;
  const courses = await fetchData("courses");
  instructorCoursesList.innerHTML = "";
  courses.forEach(course => {
    const row = document.createElement("div");
    row.className = "available-course-row";
    const dateText = course.date ? ` · Starts ${new Date(course.date).toLocaleDateString()}` : "";
    row.innerHTML = `
      <div class="available-course-text">${course.name}${dateText} · ${course.enrolled} learners</div>
      <span class="card-tag">${course.status}</span>
    `;
    instructorCoursesList.appendChild(row);
  });
}

async function renderUpcomingSessions() {
  if (!upcomingSessionsList) return;
  const sessions = await fetchData("sessions");
  upcomingSessionsList.innerHTML = "";
  sessions.forEach(session => {
    const item = document.createElement("li");
    const dt = session.dateTime ? new Date(session.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "";
    item.innerHTML = `<strong>${dt}</strong> · ${session.text}`;
    upcomingSessionsList.appendChild(item);
  });
}

async function renderInstructorAnnouncements() {
  if (!instructorAnnouncementsList) return;
  const anns = await fetchData("announcements");
  instructorAnnouncementsList.innerHTML = "";
  anns.forEach(ann => {
    const item = document.createElement("li");
    item.textContent = ann.text;
    instructorAnnouncementsList.appendChild(item);
  });
}

if (instructorAnnouncementForm) {
  instructorAnnouncementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("instructorAnnouncementText");
    const text = input.value.trim();
    if (text) {
      await postData("announcements", { text, from: userName });
      input.value = "";
      renderInstructorAnnouncements();
    }
  });
}

if (instructorCourseForm) {
  instructorCourseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("newCourseName");
    const dateInput = document.getElementById("newCourseDate");
    const name = nameInput.value.trim();
    const date = dateInput.value;
    if (name) {
      await postData("courses", { name, date, creator: userName });
      nameInput.value = "";
      dateInput.value = "";
      renderInstructorCourses();
    }
  });
}

if (instructorSessionForm) {
  instructorSessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const textInput = document.getElementById("newSessionText");
    const dateTimeInput = document.getElementById("newSessionDateTime");
    const text = textInput.value.trim();
    const dateTime = dateTimeInput.value;
    if (text && dateTime) {
      await postData("sessions", { text, dateTime, instructor: userName });
      textInput.value = "";
      dateTimeInput.value = "";
      renderUpcomingSessions();
    }
  });
}

// Video Call Integration
window.startVideoCall = function() {
  const roomName = "SmartLearn-" + Math.random().toString(36).substring(7);
  const jitsiUrl = `https://meet.jit.si/${roomName}`;
  
  // Notify students via announcement
  const announcementText = `🔴 LIVE CLASS STARTED: Join now at ${jitsiUrl}`;
  postData("announcements", { text: announcementText, from: userName });
  
  // Open the call in a new window
  window.open(jitsiUrl, '_blank');
  alert("Live class started! Students have been notified via announcements.");
  renderInstructorAnnouncements();
};

// Initial render
renderInstructorCourses();
renderUpcomingSessions();
renderInstructorAnnouncements();

