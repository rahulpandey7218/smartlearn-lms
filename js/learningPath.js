const pathContainer = document.getElementById("learningPath");
const resetPathButton = document.getElementById("resetPath");

const pathTopics = [
  "HTML structure",
  "Semantic tags",
  "Flexbox and grid",
  "Responsive layouts",
  "JavaScript basics",
  "DOM and events"
];

const statusOrder = ["not-started", "in-progress", "mastered"];

function storageKeyForTopic(topic) {
  return "smartlearn-path-" + topic;
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
  badge.textContent = topic;
  badge.dataset.topic = topic;
  badge.dataset.status = status;
  badge.addEventListener("click", function () {
    const currentStatus = badge.dataset.status || "not-started";
    const updated = nextStatus(currentStatus);
    badge.dataset.status = updated;
    saveStatus(topic, updated);
    renderPath();
  });
  return badge;
}

function renderPath() {
  if (!pathContainer) {
    return;
  }
  const seeded = window.localStorage.getItem("smartlearn-path-seeded") === "yes";
  if (!seeded) {
    pathTopics.forEach(function (topic, index) {
      let initialStatus = "not-started";
      if (index <= 1) {
        initialStatus = "mastered";
      } else if (index <= 3) {
        initialStatus = "in-progress";
      }
      saveStatus(topic, initialStatus);
    });
    window.localStorage.setItem("smartlearn-path-seeded", "yes");
  }
  const columns = pathContainer.querySelectorAll(".path-column-body");
  columns.forEach(function (column) {
    column.innerHTML = "";
  });
  pathTopics.forEach(function (topic) {
    const status = loadStatus(topic);
    const badge = createTopicBadge(topic, status);
    const column = pathContainer.querySelector('[data-status="' + status + '"]');
    if (column) {
      column.appendChild(badge);
    }
  });
}

function resetPath() {
  pathTopics.forEach(function (topic) {
    window.localStorage.removeItem(storageKeyForTopic(topic));
  });
  renderPath();
}

renderPath();

if (resetPathButton) {
  resetPathButton.addEventListener("click", resetPath);
}
