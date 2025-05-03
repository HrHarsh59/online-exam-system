document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (!token || role !== "student") {
      alert("Access denied!");
      window.location.href = "index.html";
      return;
    }
  
    // Optional: Show user info
    document.getElementById("studentEmail").innerText = `Logged in as: ${role}`;
  
    // Fetch exams
    fetch("http://localhost:5000/api/student/exams", {
      headers: {
        Authorization: token
      }
    })
      .then(res => res.json())
      .then(data => {
        const examList = document.getElementById("examList");
        if (!data.length) {
          examList.innerHTML = "<p>No exams available.</p>";
          return;
        }
  
        data.forEach((exam) => {
          const examCard = document.createElement("div");
          examCard.className = "exam-card";
          examCard.innerHTML = `
            <h4>${exam.title}</h4>
            <p><strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${exam.duration} minutes</p>
            <button onclick="startExam('${exam._id}')">Attempt Exam</button>
          `;
          examList.appendChild(examCard);
        });
      })
      .catch(err => {
        console.error(err);
        alert("Error loading exams.");
      });
  });
  
  function startExam(examId) {
    localStorage.setItem("currentExamId", examId);
    window.location.href = "exam-ui.html";
  }
  