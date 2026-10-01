const STORAGE_KEY = "task-manager-tasks";

const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const filter = document.getElementById("filter");

let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch {
  tasks = [];
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  document.getElementById("allCount").textContent = tasks.length;
  document.getElementById("todoCount").textContent =
    tasks.filter(task => !task.completed).length;
  document.getElementById("doneCount").textContent =
    tasks.filter(task => task.completed).length;

  let visibleTasks = tasks;

  if (filter.value === "active") {
    visibleTasks = tasks.filter(task => !task.completed);
  } else if (filter.value === "completed") {
    visibleTasks = tasks.filter(task => task.completed);
  }

  if (visibleTasks.length === 0) {
    taskList.innerHTML =
      '<p class="empty">No tasks here. Add a task to get started.</p>';
    return;
  }

  taskList.innerHTML = visibleTasks.map(task => {
    const dueDate = task.dueDate
      ? `Due ${escapeHTML(task.dueDate)}`
      : "No due date";

    return `
      <div class="task-row ${task.completed ? "completed" : ""}">
        <input
          class="task-check"
          type="checkbox"
          data-action="toggle"
          data-id="${task.id}"
          ${task.completed ? "checked" : ""}
          aria-label="Mark task complete"
        >

        <div>
          <div class="task-title">${escapeHTML(task.title)}</div>
          <div class="task-meta">
            ${escapeHTML(task.category)} · ${dueDate}
            <span class="priority ${task.priority}">
              ${escapeHTML(task.priority)}
            </span>
          </div>
        </div>

        <button
          class="delete"
          type="button"
          data-action="delete"
          data-id="${task.id}"
          aria-label="Delete task"
        >×</button>
      </div>
    `;
  }).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now(),
    title,
    category: document.getElementById("taskCategory").value,
    priority: document.getElementById("taskPriority").value,
    dueDate: document.getElementById("taskDate").value,
    completed: false
  });

  saveTasks();
  form.reset();
  document.getElementById("taskPriority").value = "medium";
  document.getElementById("taskTitle").focus();
});

filter.addEventListener("change", renderTasks);

taskList.addEventListener("click", event => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;

  const id = Number(button.dataset.id);
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
});

taskList.addEventListener("change", event => {
  if (event.target.dataset.action !== "toggle") return;

  const id = Number(event.target.dataset.id);
  const task = tasks.find(item => item.id === id);

  if (task) {
    task.completed = event.target.checked;
    saveTasks();
  }
});

renderTasks();