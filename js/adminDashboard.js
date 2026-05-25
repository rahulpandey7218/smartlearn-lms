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
    return { success: false, error: "Connection failed" };
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
  const adminCourseList = document.getElementById("adminCourseList");
  const courseCountTag = document.getElementById("courseCount");
  if (!adminCourseList) return;
  
  const courses = await fetchData("courses");
  adminCourseList.innerHTML = "";
  
  if (courseCountTag) courseCountTag.textContent = `${courses.length} Active`;

  if (courses.length === 0) {
    adminCourseList.innerHTML = `<p style="color: var(--muted); padding: 20px;">No courses found. Create your first course below.</p>`;
    return;
  }

  courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.border = "1px solid var(--border-subtle)";
    card.innerHTML = `
      <div class="card-header" style="padding: 15px;">
        <h3 style="margin: 0; font-size: 18px;">${course.name}</h3>
      </div>
      <div class="card-body" style="padding: 15px;">
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 15px; height: 40px; overflow: hidden;">${course.description || 'Professional course content.'}</p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-compact" style="flex: 1; font-size: 12px;" onclick="editCourse('${course.id}', '${course.name}', '${course.description}')">Edit</button>
          <button class="btn btn-primary btn-compact" style="flex: 1; font-size: 12px; background: #ff4757; border-color: #ff4757;" onclick="deleteCourse('${course.id}')">Delete</button>
        </div>
      </div>
    `;
    adminCourseList.appendChild(card);
  });
}

window.deleteCourse = async function(id) {
  if (confirm("Are you sure you want to delete this course? Students will lose access.")) {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("✅ Course deleted successfully!");
        renderAdminCourses();
        if (typeof renderAdminMetrics === 'function') renderAdminMetrics();
      } else {
        alert("❌ Error deleting course: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to connect to server.");
    }
  }
};

window.editCourse = function(id, name, desc) {
  const newName = prompt("Enter new course name:", name);
  const newDesc = prompt("Enter new description:", desc);
  if (newName && newDesc) {
    fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc })
    }).then(() => renderAdminCourses());
  }
};

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

// Update existing course creation logic to handle description
if (courseForm) {
  courseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("courseName") ? document.getElementById("courseName").value : (courseForm.courseTitle ? courseForm.courseTitle.value : "");
    const description = document.getElementById("courseDesc") ? document.getElementById("courseDesc").value : "";
    const res = await postData("courses", { name, description, instructor: adminName });
    if (res.success) {
      courseForm.reset();
      renderAdminMetrics();
      renderAdminCourses();
      renderAdminActivity();
    }
  });
}

// Initial load
renderAdminMetrics();
renderAdminRoles();
renderAdminCourses();
renderAdminActivity();
