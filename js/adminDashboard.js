const adminMetrics = document.getElementById("adminMetrics");
const adminRoles = document.getElementById("adminRoles");
const adminCourses = document.getElementById("adminCourses");
const adminActivity = document.getElementById("adminActivity");
const courseForm = document.getElementById("courseForm");

function requireAdmin() {
  const role = window.localStorage.getItem("smartlearn-session-role");
  if (role !== "admin") {
    window.location.href = "login.html";
  }
}

requireAdmin();

const roleData = [
  { label: "Students", value: 10 },
  { label: "Instructors", value: 2 },
  { label: "Admins", value: 1 }
];

const courseData = [
  { label: "Web Development", value: 6 },
  { label: "Core CS", value: 5 },
  { label: "Interview Prep", value: 4 },
  { label: "Electives", value: 3 }
];

const activityData = [
  "5 new learners enrolled in Web Development Fundamentals.",
  "Instructor Ananya published Quiz 3 for DBMS.",
  "8 certificates generated in the last 24 hours.",
  "2 new courses pending approval."
];

function getCreatedCoursesCount() {
  const raw = window.localStorage.getItem("smartlearn-courses-created");
  const parsed = raw ? parseInt(raw, 10) : 2;
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function setCreatedCoursesCount(value) {
  window.localStorage.setItem("smartlearn-courses-created", String(value));
}

function buildMetricsData() {
  const totalCourses = courseData.reduce(function (sum, item) {
    return sum + item.value;
  }, 0);
  const createdCount = getCreatedCoursesCount();
  const categories = courseData.length;
  const pending = createdCount;
  return [
    { label: "Total courses", value: totalCourses },
    { label: "New courses this session", value: createdCount },
    { label: "Course categories", value: categories },
    { label: "Pending approval (prototype)", value: pending }
  ];
}

function renderAdminMetrics() {
  if (!adminMetrics) {
    return;
  }
  adminMetrics.innerHTML = "";
  buildMetricsData().forEach(function (item) {
    const card = document.createElement("div");
    card.className = "admin-metric-card";
    const value = document.createElement("div");
    value.className = "admin-metric-value";
    value.textContent = String(item.value);
    const label = document.createElement("div");
    label.className = "admin-metric-label";
    label.textContent = item.label;
    card.appendChild(value);
    card.appendChild(label);
    adminMetrics.appendChild(card);
  });
}

function renderAdminRoles() {
  if (!adminRoles) {
    return;
  }
  adminRoles.innerHTML = "";
  roleData.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "admin-role-row";
    const label = document.createElement("span");
    label.textContent = item.label;
    const bar = document.createElement("div");
    bar.className = "admin-role-bar";
    const fill = document.createElement("div");
    fill.className = "admin-role-fill";
    fill.style.width = String(item.value) + "px";
    bar.appendChild(fill);
    const value = document.createElement("span");
    value.className = "admin-role-value";
    value.textContent = String(item.value);
    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(value);
    adminRoles.appendChild(row);
  });
}

function renderAdminCourses() {
  if (!adminCourses) {
    return;
  }
  adminCourses.innerHTML = "";
  courseData.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "admin-course-row";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("span");
    value.className = "admin-course-value";
    value.textContent = String(item.value) + " courses";
    row.appendChild(label);
    row.appendChild(value);
    adminCourses.appendChild(row);
  });
}

function renderAdminActivity() {
  if (!adminActivity) {
    return;
  }
  adminActivity.innerHTML = "";
  activityData.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    adminActivity.appendChild(item);
  });
}

function handleCourseSubmit(event) {
  event.preventDefault();
  if (!courseForm) {
    return;
  }
  const title = courseForm.courseTitle.value.trim();
  const category = courseForm.courseCategory.value;
  const level = courseForm.courseLevel.value;
  if (!title || !category || !level) {
    return;
  }
  activityData.unshift("New course created: " + title + " (" + level + ").");
  const categoryItem = courseData.find(function (item) {
    return item.label === "Web Development" && category === "web";
  }) || courseData.find(function (item) {
    return item.label === "Core CS" && category === "cs-core";
  }) || courseData.find(function (item) {
    return item.label === "Interview Prep" && category === "interview";
  }) || courseData.find(function (item) {
    return item.label === "Electives" && category === "elective";
  });
  if (categoryItem) {
    categoryItem.value += 1;
  }
  const createdCount = getCreatedCoursesCount() + 1;
  setCreatedCoursesCount(createdCount);
  renderAdminMetrics();
  renderAdminCourses();
  renderAdminActivity();
  courseForm.reset();
}

renderAdminMetrics();
renderAdminRoles();
renderAdminCourses();
renderAdminActivity();

if (courseForm) {
  courseForm.addEventListener("submit", handleCourseSubmit);
}
