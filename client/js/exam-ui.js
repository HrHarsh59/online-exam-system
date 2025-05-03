let currentQuestion = 0;
let questions = [];
let answers = [];
let reviewSet = new Set();
let duration = 10 * 60;

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const examId = localStorage.getItem("currentExamId");

  if (!token || !examId) return (window.location.href = "index.html");

  try {
    const res = await fetch(`http://localhost:5000/api/exams/${examId}`, {
      headers: { Authorization: token },
    });

    const exam = await res.json();
    document.getElementById("examTitle").innerText = exam.title;
    questions = exam.questions;
    duration = exam.duration * 60;

    answers = Array(questions.length).fill([]);
    renderPalette();
    loadQuestion();
    startTimer();
  } catch (err) {
    alert("Failed to load exam!");
    console.error(err);
    window.location.href = "dashboard-student.html";
  }
});

function startTimer() {
  let timeLeft = duration;
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Time's up!");
      submitTest();
    }
    const h = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');

    document.getElementById("hours").textContent = h;
    document.getElementById("minutes").textContent = m;
    document.getElementById("seconds").textContent = s;
    timeLeft--;
  }, 1000);
}

function loadQuestion() {
  const q = questions[currentQuestion];
  const area = document.getElementById("questionArea");

  area.innerHTML = `
    <p><strong>Q${currentQuestion + 1}:</strong> ${q.questionText || "Image-based question"}</p>
    ${q.questionImage ? `<img src="http://localhost:5000${q.questionImage}" style="max-width: 300px;" />` : ""}
    ${q.options.map((opt, i) => `
      <label>
        <input type="checkbox" name="option" value="${opt}" ${answers[currentQuestion]?.includes(opt) ? 'checked' : ''} />
        ${opt}
      </label><br/>
    `).join("")}
  `;

  highlightCurrentPalette();
}

document.addEventListener("change", (e) => {
  if (e.target.name === "option") {
    const checkedOptions = Array.from(document.querySelectorAll('input[name="option"]:checked')).map(el => el.value);
    answers[currentQuestion] = checkedOptions;
    updatePalette(currentQuestion);
  }
});

document.getElementById("nextBtn").onclick = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
};

document.getElementById("markReviewBtn").onclick = () => {
  reviewSet.add(currentQuestion);
  updatePalette(currentQuestion);
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  }
};

function renderPalette() {
  const palette = document.getElementById("questionPalette");
  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("button");
    btn.id = `palette-${i}`;
    btn.innerText = i + 1;
    btn.onclick = () => {
      currentQuestion = i;
      loadQuestion();
    };
    btn.style.backgroundColor = "#ccc";
    palette.appendChild(btn);
  }
}

function updatePalette(index) {
  const btn = document.getElementById(`palette-${index}`);
  if (reviewSet.has(index)) {
    btn.style.backgroundColor = "#ffc107";
  } else if (answers[index]?.length > 0) {
    btn.style.backgroundColor = "#28a745";
  } else {
    btn.style.backgroundColor = "#ccc";
  }
}

function highlightCurrentPalette() {
  document.querySelectorAll(".question-palette button").forEach((b, i) => {
    b.style.border = i === currentQuestion ? "2px solid #007bff" : "none";
  });
}

document.getElementById("submitTestBtn").onclick = () => {
  const confirmSubmit = confirm("Are you sure you want to submit?");
  if (confirmSubmit) submitTest();
};

async function submitTest() {
  const token = localStorage.getItem("token");
  const examId = localStorage.getItem("currentExamId");

  const payload = {
    answers: answers.map((a, i) => ({
      questionId: i.toString(),
      selectedAnswer: a || []
    }))
  };

  try {
    const res = await fetch(`http://localhost:5000/api/exams/${examId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      window.location.href = "result.html";
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Failed to submit exam");
    }
  } catch (error) {
    console.error("Submit Error:", error);
    alert("Server error. Try again.");
  }
}
