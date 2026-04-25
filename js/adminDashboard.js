const adminMetrics = document.getElementById("adminMetrics");
const adminRoles = document.getElementById("adminRoles");
const adminCourses = document.getElementById("adminCourses");
const adminActivity = document.getElementById("adminActivity");
const courseForm = document.getElementById("courseForm");

const API_BASE = "http://localhost:4000/api";
const adminName = window.localStorage.getItem("smartlearn-user-name") || "Admin";

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

function requireAdmin() {
  const role = window.localStorage.getItem("smartlearn-session-role");
  if (role !== "admin") {
    window.location.href = "login.html";
  }
}

requireAdmin();

async function renderAdminMetrics() {
  if (!adminMetrics) return;
  const courses = await fetchData("courses");
  const activity = await fetchData("activity");
  
  adminMetrics.innerHTML = `
    <div class="admin-metric-card">
      <div class="admin-metric-value">${courses.length}</div>
      <div class="admin-metric-label">Total courses</div>
    </div>
    <div class="admin-metric-card">
      <div class="admin-metric-value">${activity.length}</div>
      <div class="admin-metric-label">System Activities</div>
    </div>
    <div class="admin-metric-card">
      <div class="admin-metric-value">3</div>
      <div class="admin-metric-label">User Roles</div>
    </div>
  `;
}

function renderAdminRoles() {
  if (!adminRoles) return;
  const roleData = [
    { label: "Students", value: 85 },
    { label: "Instructors", value: 45 },
    { label: "Admins", value: 25 }
  ];
  adminRoles.innerHTML = "";
  roleData.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-role-row";
    row.innerHTML = `
      <span>${item.label}</span>
      <div class="admin-role-bar"><div class="admin-role-fill" style="width: ${item.value}px"></div></div>
      <span class="admin-role-value">${item.value}</span>
    `;
    adminRoles.appendChild(row);
  });
}

async function renderAdminCourses() {
  if (!adminCourses) return;
  const courses = await fetchData("courses");
  adminCourses.innerHTML = "";
  courses.forEach(course => {
    const row = document.createElement("div");
    row.className = "admin-course-row";
    row.innerHTML = `<span>${course.name}</span><span class="admin-course-value">By ${course.createdBy}</span>`;
    adminCourses.appendChild(row);
  });
}

async function renderAdminActivity() {
  if (!adminActivity) return;
  const activity = await fetchData("activity");
  adminActivity.innerHTML = "";
  activity.slice(0, 8).forEach(text => {
    const item = document.createElement("li");
    item.textContent = text;
    adminActivity.appendChild(item);
  });
}

async function handleCourseSubmit(event) {
  event.preventDefault();
  const title = courseForm.courseTitle.value.trim();
  const category = courseForm.courseCategory.value;
  if (!title) return;

  await postData("courses", { name: title, creator: adminName });
  courseForm.reset();
  
  renderAdminMetrics();
  renderAdminCourses();
  renderAdminActivity();
}

// Initial load
renderAdminMetrics();
renderAdminRoles();
renderAdminCourses();
renderAdminActivity();

if (courseForm) {
  courseForm.addEventListener("submit", handleCourseSubmit);
}
