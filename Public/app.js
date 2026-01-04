// Load and display tasks from the server
const API_URL = process.env.APP_API_URL; 
async function loadTasks() {
  try {
    const res = await fetch("API_URL/tasks");
    if (!res.ok) throw new Error("Failed to fetch tasks");

    const tasks = await res.json();

    // Build HTML for task list
    const taskList = tasks.map(t => `
      <li id="task-${t.id}">
        ${t.title}
        <input type="checkbox" ${t.completed ? "checked" : ""} data-id="${t.id}" class="complete-checkbox">
        <input type="text" value="${t.title}" data-id="${t.id}" class="title-input">
        <button data-id="${t.id}">Delete</button>
      </li>
    `).join("");

    document.getElementById("taskList").innerHTML = taskList;
        // Checkbox change → toggle completed
    document.querySelectorAll(".complete-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const id = parseInt(cb.dataset.id, 10);
        updateTask(id, { completed: cb.checked ? 1 : 0 });
      });
    });

    // Title input → update on blur
    document.querySelectorAll(".title-input").forEach(input => {
      input.addEventListener("blur", () => {
        const id = parseInt(input.dataset.id, 10);
        const newTitle = input.value.trim();
        if (newTitle) updateTask(id, { title: newTitle });
      });
    });
    // Add click listeners to all delete buttons AFTER rendering
    document.querySelectorAll("#taskList button").forEach(btn => {
      btn.addEventListener("click", () => deleteTask(btn.dataset.id));
    });

  } catch (err) {
    console.error("Error loading tasks:", err);
    alert("Could not load tasks.");
  }
}

// Delete a task by ID
async function deleteTask(id) {
  try {
    const taskId = parseInt(id, 10); // ensure it's a number
    if (isNaN(taskId)) return;       // sanity check

    const res = await fetch(`API_URL/tasks/${taskId}`, {
      method: "DELETE"
    });

    if (res.status === 404) {
      alert("Task not found. It may have already been deleted.");
    } else if (!res.ok) {
      throw new Error("Failed to delete task");
    }

    // Remove task from UI immediately
    const li = document.getElementById(`task-${taskId}`);
    if (li) li.remove();

  } catch (err) {
    console.error("Error deleting task:", err);
    alert("Could not delete task.");
  }
}

// Add a new task
async function addTask() {
  const input = document.getElementById("taskInput");
  const title = input.value.trim();
  if (!title) return; // ignore empty input

  try {
    const res = await fetch("API_URL/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    if (!res.ok) throw new Error("Failed to add task");

    input.value = "";  // clear input
    loadTasks();       // reload tasks
  } catch (err) {
    console.error("Error adding task:", err);
    alert("Could not add task.");
  }
}

// update task
async function updateTask(id, data) {
  const taskId = parseInt(id, 10); // ensure number
  if (isNaN(taskId)) return;

  try {
    const res = await fetch(`API_URL/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.status === 404) alert("Task not found. It may have been deleted.");
    else if (!res.ok) throw new Error("Failed to update task");
  } catch (err) {
    console.error("Error updating task:", err);
    alert("Could not update task.");
  }
}


// Initial load
loadTasks();
