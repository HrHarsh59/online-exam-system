document.addEventListener("DOMContentLoaded", () => {
  const examData = JSON.parse(localStorage.getItem("previewExamData"));

  if (!examData) {
    alert("No exam data found. Please go back and create exam again.");
    window.location.href = "create-exam.html";
    return;
  }

  renderPreview(examData);

  document.getElementById("backButton").onclick = () => {
    window.location.href = "create-exam.html";
  };

  document.getElementById("confirmButton").onclick = () => {
    submitExamToBackend(examData);
  };
});

function renderPreview(examData) {
  const container = document.getElementById("examPreviewContent");
  container.innerHTML = `
    <h2>${examData.title}</h2>
    <p><strong>Date:</strong> ${examData.date} | <strong>Duration:</strong> ${examData.duration} minutes</p>
  `;

  examData.questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.className = "question-block";

    block.innerHTML = `<h3>Q${i + 1}: ${q.questionText || "Image Based Question"}</h3>`;

    if (q.questionImage) {
      const img = document.createElement("img");
      img.src = `https://exam-backend-vr0j.onrender.com${q.questionImage}`;
      img.alt = "Question Image";
      block.appendChild(img);
    }

    q.options.forEach(opt => {
      const optEl = document.createElement("div");
      optEl.textContent = `• ${opt}`;
      block.appendChild(optEl);
    });

    container.appendChild(block);
  });
}

async function submitExamToBackend(examData) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("https://exam-backend-vr0j.onrender.com/api/exams/create-exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(examData)
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Exam created successfully!");
      localStorage.removeItem("previewExamData");
      window.location.href = "dashboard-teacher.html";
    } else {
      alert(data.error || "Failed to create exam.");
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong while creating exam.");
  }
}
