
const taskInput = document.getElementById("taskInput");
const dayInput = document.getElementById("dayInput");

// توليد الأيام من 1 لـ 30
for (let i = 1; i <= 30; i++) {
  const option = document.createElement("option");
  option.value = `اليوم ${i}`;
  option.textContent = `اليوم ${i}`;
  dayInput.appendChild(option);
}

const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const progress = document.getElementById("progress");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  taskList.innerHTML = "";

  // تجميع المهام حسب اليوم
  const grouped = {};

  tasks.forEach(task => {
    const day = task.day || "بدون يوم";
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(task);
  });

  // ترتيب الأيام رقمياً
  const daysSorted = Object.keys(grouped).sort((a, b) => {
    const na = parseInt(a.replace("اليوم ", "")) || 999;
    const nb = parseInt(b.replace("اليوم ", "")) || 999;
    return na - nb;
  });

  daysSorted.forEach(day => {
    /* ===== عنوان اليوم ===== */
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-section";
    dayHeader.innerHTML = `
  <span>${day}</span>
  <button class="dayStats">📊</button>
`;

dayHeader.querySelector(".dayStats").onclick = () => {
  const dayTasks = grouped[day];
  const done = dayTasks.filter(t => t.done).length;
  alert(`${day}\nعدد المهام: ${dayTasks.length}\nالمنجز: ${done}`);
};

    taskList.appendChild(dayHeader);

    /* ===== مهام اليوم ===== */
    grouped[day].forEach((task, index) => {
      const li = document.createElement("li");
      if (task.done) li.classList.add("completed");

      li.innerHTML = `
        <div class="task-row">
          <input type="checkbox" ${task.done ? "checked" : ""}>
          <span>${task.text}</span>
          <div class="buttons">
            <button class="edit">تعديل</button>
            <button class="delete">حذف</button>
          </div>
        </div>
      `;

      li.querySelector("input").onchange = () => {
        task.done = !task.done;
        save();
        render();
      };

      li.querySelector(".delete").onclick = () => {
        tasks.splice(tasks.indexOf(task), 1);
        save();
        render();
      };

      li.querySelector(".edit").onclick = () => {
        const newText = prompt("عدّل الاسم:", task.text);
        const newDay = prompt("عدّل اليوم:", task.day);
        if (newText) task.text = newText;
        if (newDay) task.day = newDay;
        save();
        render();
      };

      taskList.appendChild(li);
    });
  });

  // عدّاد الإنجاز
  const doneCount = tasks.filter(t => t.done).length;
  progress.textContent = `${doneCount} / ${tasks.length} تم إنجازه`;
}

addBtn.onclick = () => {
  if (taskInput.value.trim() === "") return;

  tasks.push({
    text: taskInput.value,
    day: dayInput.value || "بدون يوم",
    done: false
  });

  taskInput.value = "";
  dayInput.value = "";
  save();
  render();
};


render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}


function updateOnlineStatus() {
  if (navigator.onLine) {
    console.log("🟢 Online");
    onOnlineSync();
  } else {
    console.log("🔴 Offline");
  }
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

function onOnlineSync() {
  const syncedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  console.log("🔄 Syncing tasks...", syncedTasks);

  showToast("تم الاتصال بالإنترنت ✓");
}


function showToast(text) {
  const toast = document.createElement("div");
  toast.textContent = text;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4f7cff;
    color: white;
    padding: 10px 16px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

updateOnlineStatus();

document.getElementById("syncBtn").onclick = () => {
  onOnlineSync();
  showToast("تمت المزامنة بنجاح ✔️");
};


document.getElementById("clearBtn").onclick = () => {
  if (!confirm("متأكد إنك عايز تمسح كل المهام؟")) return;
  tasks = [];
  save();
  render();
};

document.getElementById("statsBtn").onclick = () => {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  alert(`إجمالي المهام: ${total}\nتم إنجازه: ${done}\nمتبقي: ${total - done}`);
};


const darkToggle = document.getElementById("darkToggle");

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
};


