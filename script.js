let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
const notifiedAssignments = JSON.parse(localStorage.getItem("notifiedAssignments")) || [];

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function saveAssignments() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

function addAssignment() {
  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;

  if (!title || !dueDate) {
    alert("Please enter an assignment and due date.");
    return;
  }

  assignments.push({
    title,
    dueDate,
    priority,
    completed:false
  });

  saveAssignments();
  displayAssignments();
  checkNotifications();

  document.getElementById("title").value = "";
  document.getElementById("dueDate").value = "";
}

function displayAssignments() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  assignments.forEach((assignment,index) => {
    const li = document.createElement("li");

    if (assignment.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="assignment-header">
        <strong>${assignment.title}</strong>
        <span class="priority ${assignment.priority.toLowerCase()}">
          ${assignment.priority}
        </span>
      </div>

      <p>📅 Due: ${assignment.dueDate}</p>

      <div class="actions">
        <button class="complete-btn" onclick="toggleComplete(${index})">
          ${assignment.completed ? "Undo" : "Complete"}
        </button>

        <button onclick="editAssignment(${index})">
          Edit
        </button>

        <button class="delete-btn" onclick="deleteAssignment(${index})">
          Delete
        </button>
      </div>
    `;

    list.appendChild(li);
  });
}

function deleteAssignment(index) {
  assignments.splice(index,1);
  saveAssignments();
  displayAssignments();
}

function toggleComplete(index) {
  assignments[index].completed = !assignments[index].completed;

  if (assignments[index].completed) {
    launchConfetti();
  }

  saveAssignments();
  displayAssignments();
}

function editAssignment(index) {
  const newTitle = prompt("Edit assignment name:", assignments[index].title);

  if (newTitle && newTitle.trim() !== "") {
    assignments[index].title = newTitle.trim();
    saveAssignments();
    displayAssignments();
  }
}

function sortAssignments() {
  assignments.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  saveAssignments();
  displayAssignments();
}

function clearCompleted() {
  assignments = assignments.filter(a => !a.completed);
  saveAssignments();
  displayAssignments();
}

function showNotification(message) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification("📚 Assignment Reminder", {
          body: message
        });
      }
    });
  }
}

function checkNotifications() {
  const today = new Date();

  assignments.forEach(a => {
    if (a.completed) return;

    const due = new Date(a.dueDate);
    const difference = due - today;
    const daysLeft = Math.ceil(difference / (1000*60*60*24));

    const key = `${a.title}-${daysLeft}`;

    if ((daysLeft === 2 || daysLeft === 1 || daysLeft === 0) &&
      !notifiedAssignments.includes(key)) {

      let message = "";

      if (daysLeft === 2) message = `${a.title} is due in 2 days!`;
      if (daysLeft === 1) message = `${a.title} is due TOMORROW!`;
      if (daysLeft === 0) message = `${a.title} is due TODAY!`;

      showNotification(message);

      notifiedAssignments.push(key);

      localStorage.setItem(
        "notifiedAssignments",
        JSON.stringify(notifiedAssignments)
      );
    }
  });
}

function launchConfetti() {
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement("div");

    confetti.innerHTML = "🎉";
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.fontSize = "24px";
    confetti.style.zIndex = "9999";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.transform = `translateY(${window.innerHeight}px)`;
      confetti.style.transition = "1s linear";
      confetti.style.opacity = "0";
    }, 10);

    setTimeout(() => {
      confetti.remove();
    }, 1000);
  }
}

setInterval(checkNotifications, 60000);

checkNotifications();
displayAssignments();
