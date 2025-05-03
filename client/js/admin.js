document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (!token || role !== "admin") {
      alert("Access denied!");
      window.location.href = "index.html";
      return;
    }
  
    document.getElementById("adminEmail").innerText = `Logged in as: ${role}`;
  
    loadUsers();
    loadExams();
  
    function loadUsers() {
      fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(users => {
          const userList = document.getElementById("userList");
          userList.innerHTML = "";
  
          users.forEach((user) => {
            const card = document.createElement("div");
            card.className = "exam-card";
            card.innerHTML = `
              <h4>${user.name} (${user.role})</h4>
              <p>${user.email}</p>
              <button onclick="deleteUser('${user._id}')">Delete</button>
            `;
            userList.appendChild(card);
          });
        });
    }
  
    function loadExams() {
      fetch("http://localhost:5000/api/admin/exams", {
        headers: { Authorization: token }
      })
        .then(res => res.json())
        .then(exams => {
          const examList = document.getElementById("adminExamList");
          examList.innerHTML = "";
  
          exams.forEach((exam) => {
            const card = document.createElement("div");
            card.className = "exam-card";
            card.innerHTML = `
              <h4>${exam.title}</h4>
              <p><strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${exam.duration} min</p>
              <button onclick="deleteExam('${exam._id}')">Delete Exam</button>
            `;
            examList.appendChild(card);
          });
        });
    }
  
    window.deleteUser = async (userId) => {
      const confirmDelete = confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;
  
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
  
      const data = await res.json();
      alert(data.message || "User deleted");
      loadUsers();
    };
  
    window.deleteExam = async (examId) => {
      const confirmDelete = confirm("Are you sure you want to delete this exam?");
      if (!confirmDelete) return;
  
      const res = await fetch(`http://localhost:5000/api/admin/exams/${examId}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
  
      const data = await res.json();
      alert(data.message || "Exam deleted");
      loadExams();
    };
  });
  