document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("examForm");
  const questionsContainer = document.getElementById("questionsContainer");
  const addQuestionBtn = document.getElementById("addQuestionBtn");
  const submitExamBtn = document.getElementById("submitExamBtn");

  // Load saved state if available
  const savedState = sessionStorage.getItem("createExamData");
  if (savedState) {
    const { title, date, duration, questions } = JSON.parse(savedState);
    document.getElementById("examTitle").value = title;
    document.getElementById("examDate").value = date;
    document.getElementById("examDuration").value = duration;

    questions.forEach(q => addQuestionBlock(q));
  }

  addQuestionBtn.addEventListener("click", () => addQuestionBlock());

  // Save form state on input/change
  form.addEventListener("input", saveFormToSession);
  form.addEventListener("change", saveFormToSession);

  submitExamBtn.addEventListener("click", handleSubmitExam);
});

function addQuestionBlock(data = null) {
  const block = document.createElement("div");
  block.className = "question-block";

  const optionsHTML = (data?.options || ["", "", "", ""]).map((opt, i) => `
    <div>
      <input type="text" class="optionInput" placeholder="Option ${i + 1}" value="${opt}">
      <input type="checkbox" class="correctCheckbox" ${data?.correctAnswer?.includes(opt) ? "checked" : ""}> Correct
    </div>
  `).join("");

  block.innerHTML = `
    <label>Question Text</label>
    <textarea class="questionText">${data?.questionText || ""}</textarea>

    <label>Or Upload Question Image</label>
    <input type="file" class="questionImage">
    <img class="imagePreview" style="display:none; max-width:200px; margin-top:10px;" />

    <div class="option-group">
      <label>Options</label>
      ${optionsHTML}
    </div>
  `;

  const imageInput = block.querySelector(".questionImage");
  const preview = block.querySelector(".imagePreview");

  if (data?.questionImagePreview) {
    preview.src = data.questionImagePreview;
    preview.style.display = "block";
  }

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
        saveFormToSession();
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("questionsContainer").appendChild(block);
  saveFormToSession();
}

function saveFormToSession() {
  const title = document.getElementById("examTitle").value;
  const date = document.getElementById("examDate").value;
  const duration = document.getElementById("examDuration").value;

  const questionBlocks = document.querySelectorAll(".question-block");

  const questions = Array.from(questionBlocks).map(block => {
    const questionText = block.querySelector(".questionText").value;
    const options = Array.from(block.querySelectorAll(".optionInput")).map(opt => opt.value);
    const correctAnswers = options.filter((opt, i) =>
      block.querySelectorAll(".correctCheckbox")[i].checked
    );

    const img = block.querySelector(".imagePreview");
    return {
      questionText,
      questionImagePreview: img?.src || "",
      options,
      correctAnswer: correctAnswers
    };
  });

  const state = { title, date, duration, questions };
  sessionStorage.setItem("createExamData", JSON.stringify(state));
}

async function handleSubmitExam() {
  try {
    const title = document.getElementById("examTitle").value.trim();
    const date = document.getElementById("examDate").value;
    const duration = document.getElementById("examDuration").value;
    const questionBlocks = document.querySelectorAll(".question-block");

    if (!title || !date || !duration) {
      alert("Please fill all exam details.");
      return;
    }

    if (questionBlocks.length === 0) {
      alert("Please add at least one question!");
      return;
    }

    const uploadPromises = [];

    questionBlocks.forEach((block) => {
      uploadPromises.push(new Promise(async (resolve, reject) => {
        const questionText = block.querySelector(".questionText").value.trim();
        const imageInput = block.querySelector(".questionImage");
        const previewImage = block.querySelector(".imagePreview");
        const imageFile = imageInput.files[0];

        let imageUrl = "";

        try {
          // ✅ Try uploading if file selected
          if (imageFile) {
            const formData = new FormData();
            formData.append("image", imageFile);

            const uploadRes = await fetch("http://localhost:5000/api/upload-image", {
              method: "POST",
              body: formData
            });

            const uploadData = await uploadRes.json();
            imageUrl = uploadData.imageUrl;
          }

          // ✅ Use fallback image preview if file not selected
          if (!imageUrl && previewImage?.src?.includes("http://localhost:5000")) {
            imageUrl = previewImage.src.replace("http://localhost:5000", "");
          }

          const options = Array.from(block.querySelectorAll(".optionInput")).map(opt => opt.value.trim());
          const correctIndexes = Array.from(block.querySelectorAll(".correctCheckbox"))
            .map((chk, idx) => chk.checked ? idx : -1)
            .filter(idx => idx !== -1);
          const correctAnswers = correctIndexes.map(idx => options[idx]);

          if (!imageUrl && questionText === "") return reject("Each question needs text or image.");
          if (options.some(opt => opt === "")) return reject("Please fill all options.");
          if (correctAnswers.length === 0) return reject("Please mark at least one correct answer.");

          resolve({
            questionText,
            questionImage: imageUrl,
            options,
            correctAnswer: correctAnswers
          });

        } catch (err) {
          reject("Image upload failed.");
        }
      }));
    });

    const questions = await Promise.all(uploadPromises);
    const examData = { title, date, duration, questions };

    localStorage.setItem("previewExamData", JSON.stringify(examData));
    window.location.href = "preview-exam.html";

  } catch (err) {
    alert(err);
  }
}
