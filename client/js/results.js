document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (!token || role !== "student") {
      alert("Access denied!");
      window.location.href = "index.html";
      return;
    }
  
    document.getElementById("studentEmail").innerText = `Logged in as: ${role}`;
  
    fetch("http://localhost:5000/api/student/results", {
      headers: {
        Authorization: token
      }
    })
      .then(res => res.json())
      .then(results => {
        const container = document.getElementById("resultList");
  
        if (!results.length) {
          container.innerHTML = "<p>No results yet.</p>";
          return;
        }
  
        results.forEach((res) => {
          const card = document.createElement("div");
          card.className = "exam-card";
          card.innerHTML = `
            <h4>${res.examTitle}</h4>
            <p><strong>Score:</strong> ${res.score}</p>
            <p><strong>Date:</strong> ${new Date(res.submittedAt).toLocaleDateString()}</p>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error(err);
        alert("Could not load results");
      });
  });
  