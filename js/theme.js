const body = document.body;
const modeToggle = document.getElementById("modeToggle");
const modeIcon = document.getElementById("modeIcon");
const logoutButton = document.getElementById("logoutButton");
const userPill = document.getElementById("userPill");

function applyModeFromStorage() {
  const savedMode = window.localStorage.getItem("smartlearn-mode");
  if (savedMode === "focus") {
    body.classList.add("focus-mode");
    if (modeIcon) {
      modeIcon.textContent = "☾";
    }
  }
}

function toggleMode() {
  const isFocus = body.classList.toggle("focus-mode");
  if (modeIcon) {
    modeIcon.textContent = isFocus ? "☾" : "☀";
  }
  window.localStorage.setItem("smartlearn-mode", isFocus ? "focus" : "default");
}

function applyUserBadge() {
  if (!userPill) {
    return;
  }
  const role = window.localStorage.getItem("smartlearn-session-role");
  const name = window.localStorage.getItem("smartlearn-user-name") || "Guest";
  
  if (!role) {
    userPill.textContent = "Guest";
    return;
  }
  
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  
  // Real-time Identity Icon Logic
  let icon = "👤";
  if (name.includes("(Google)")) icon = "🌐";
  if (name.includes("(Github)")) icon = "🐙";
  if (name.includes("(Apple)")) icon = "🍎";
  
  userPill.innerHTML = `<span style="margin-right:8px;">${icon}</span> ${label} · ${name}`;
}

function handleLogout() {
  window.localStorage.removeItem("smartlearn-session-role");
  window.localStorage.removeItem("smartlearn-session-email");
  window.location.href = "login.html";
}

applyModeFromStorage();
applyUserBadge();

if (modeToggle) {
  modeToggle.addEventListener("click", toggleMode);
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}
