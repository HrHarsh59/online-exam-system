document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const BASE_URL = "https://exam-backend-vr0j.onrender.com";

  // Add loading spinner
  const currentBox = document.getElementById("currentExamBox");
  const resultBox = document.getElementById("resultBox");
  currentBox.innerHTML = "<p class='exam-title'>Loading...</p>";
  resultBox.innerHTML = "Loading...";

  // Greet user
  const user = localStorage.getItem("userName") || "Student";
  const greet = document.createElement("h3");
  greet.textContent = `👋 Welcome, ${user}!`;
  document.querySelector(".main-content").prepend(greet);

  fetch(`${BASE_URL}/api/student/dashboard`, {
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(data => {
      renderCurrentExams(data.currentExams);
      renderUpcomingExams(data.upcomingExams);
      renderResult(data.result);
    })
    .catch(err => {
      console.error("Failed to load dashboard:", err);
    });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  });

  // Mobile menu
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });
});

function renderCurrentExams(list) {
  const box = document.getElementById("currentExamBox");
  box.innerHTML = "";

  if (!list || list.length === 0) {
    box.innerHTML = "<p class='exam-title'>No current exam</p>";
    return;
  }

  list.forEach(exam => {
    const card = document.createElement("div");
    card.className = "card highlight"; // 🎯 highlight current exam

    const title = document.createElement("p");
    title.className = "exam-title";
    title.textContent = exam.title;

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start Exam";
    startBtn.onclick = () => {
      localStorage.setItem("currentExamId", exam._id);
      window.location.href = "exam-ui.html";
    };

    card.appendChild(title);
    card.appendChild(startBtn);
    box.appendChild(card);
  });
}

function renderUpcomingExams(list) {
  const container = document.getElementById("upcomingList");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = "<div class='placeholder'>No upcoming exams</div>";
    return;
  }

  list.forEach(exam => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <span>${exam.title}</span>
      <span>${new Date(exam.date).toLocaleDateString()}</span>
    `;
    container.appendChild(div);
  });
}

function renderResult(result) {
  const box = document.getElementById("resultBox");
  if (!result) {
    box.textContent = "No result yet";
  } else {
    box.textContent = `${result.examTitle} – ${result.score}`;
  }
}
