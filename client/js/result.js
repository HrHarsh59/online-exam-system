document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const examId = localStorage.getItem("currentExamId"); // Same used in exam-ui.js
  
    if (!token || !examId) {
      alert("Unauthorized. Please login again.");
      return window.location.href = "login.html";
    }
  
    try {
      const res = await fetch(`http://localhost:5000/api/student/results/${examId}`, {
        headers: {
          Authorization: token
        }
      });
  
      const data = await res.json();
      renderResult(data);
  
      localStorage.removeItem("currentExamId"); // Clean up after use
    } catch (err) {
      console.error(err);
      alert("Failed to load result.");
    }
  });
  
  function renderResult(data) {
    document.getElementById("examTitle").textContent = data.examTitle;
    document.getElementById("score").textContent = data.score;
  
    const container = document.getElementById("questionResults");
  
    data.questions.forEach((q, index) => {
      const div = document.createElement("div");
      div.className = "question-block";
  
      const questionEl = document.createElement("p");
      questionEl.innerHTML = `<strong>${index + 1}. ${q.questionText || "Image based question"}</strong>`;
      div.appendChild(questionEl);
  
      if (q.questionImage) {
        const img = document.createElement("img");
        img.src = `http://localhost:5000${q.questionImage}`;
        img.style.maxWidth = "300px";
        img.style.display = "block";
        img.style.marginBottom = "1rem";
        div.appendChild(img);
      }
  
      q.options.forEach((opt, i) => {
        const optionEl = document.createElement("div");
        optionEl.classList.add("option");
  
        const isCorrect = q.correctAnswer.includes(opt);
        const isSelected = q.selectedAnswer.includes(opt);
  
        if (isCorrect) optionEl.classList.add("correct-answer");
        if (isSelected && !isCorrect) optionEl.classList.add("selected-wrong");
  
        optionEl.innerHTML = `<strong>${String.fromCharCode(65 + i)}.</strong> ${opt}`;
        div.appendChild(optionEl);
      });
  
      const status = document.createElement("p");
      status.className = q.isCorrect ? "correct" : "wrong";
      status.textContent = q.isCorrect ? "Correct" : "Wrong";
      div.appendChild(status);
  
      container.appendChild(div);
    });
  }
  