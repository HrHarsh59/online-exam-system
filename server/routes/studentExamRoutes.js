const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Submit exam answers
router.post('/exams/:id/submit', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit exams' });
    }

    const examId = req.params.id;
    const { answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    let score = 0;

    exam.questions.forEach((question, index) => {
      const submitted = answers.find(ans => ans.questionId === index.toString());
      if (
        submitted &&
        JSON.stringify(submitted.selectedAnswer.sort()) ===
        JSON.stringify(
          Array.isArray(question.correctAnswer)
            ? question.correctAnswer.sort()
            : [question.correctAnswer].sort()
        )
      ) {
        score += 1;
      }
    });

    const newSubmission = new Submission({
      examId,
      studentId: req.user.id,
      answers,
      score
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Exam submitted!', score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
