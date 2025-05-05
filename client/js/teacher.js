const BASE_URL = "https://exam-backend-vr0j.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "teacher") {
    alert("Access denied!");
    return window.location.href = "index.html";
  }

  loadTeacherExams();

  document.getElementById("createExamBtn").addEventListener("click", () => {
    window.location.href = "create-exam.html";
  });
});

// 🛠 Load Exams Created By Logged-in Teacher
function loadTeacherExams() {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/api/exams/created-by-me`, {
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(exams => {
      const examList = document.getElementById("examList");
      examList.innerHTML = "";

      if (!exams || exams.length === 0) {
        examList.innerHTML = "<tr><td colspan='3'>No exams created yet.</td></tr>";
        return;
      }

      exams.forEach(exam => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${exam.title}</td>
          <td>${new Date(exam.date).toLocaleDateString()}</td>
          <td>
            <button class="edit-btn" onclick="editExam('${exam._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteExam('${exam._id}')">🗑️</button>
          </td>
        `;
        examList.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Error loading exams:", err);
    });
}

// ✏️ Edit Exam (future functionality)
function editExam(id) {
  localStorage.setItem("editExamId", id);
  window.location.href = "edit-exam.html";
}

// ❌ Delete Exam
function deleteExam(id) {
  const confirmDelete = confirm("Are you sure you want to delete this exam?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/api/exams/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token
    }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Deleted successfully!");
      loadTeacherExams(); // Refresh list
    })
    .catch(err => {
      console.error("Error deleting exam:", err);
    });
}
