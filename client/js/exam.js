document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const examId = localStorage.getItem("currentExamId");
  
    if (!token || role !== "student" || !examId) {
      alert("Unauthorized access");
      window.location.href = "index.html";
      return;
    }
  
    fetch(`http://localhost:5000/api/student/exams`, {
      headers: {
        Authorization: token
      }
    })
      .then(res => res.json())
      .then(exams => {
        const exam = exams.find(e => e._id === examId);
        if (!exam) return alert("Exam not found");
  
        document.getElementById("examTitle").innerText = exam.title;
        const questionsArea = document.getElementById("questionsArea");
  
        exam.questions.forEach((q, index) => {
          const wrapper = document.createElement("div");
          wrapper.className = "exam-card";
          wrapper.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${q.questionText}</p>
            ${q.options
              .map(
                (opt) => `
                <label>
                  <input type="radio" name="q${index}" value="${opt}" required />
                  ${opt}
                </label><br/>
              `
              )
              .join("")}
          `;
          questionsArea.appendChild(wrapper);
        });
  
        // Submit logic
        const form = document.getElementById("examForm");
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
  
          const answers = exam.questions.map((q, i) => {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            return {
              questionId: String(i),
              selectedAnswer: selected ? selected.value : ""
            };
          });
  
          const res = await fetch(`http://localhost:5000/api/student/exams/${examId}/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify({ answers })
          });
  
          const result = await res.json();
          alert(`Your score: ${result.score}`);
          localStorage.removeItem("currentExamId");
          window.location.href = "dashboard-student.html";
        });
      });
  });
  