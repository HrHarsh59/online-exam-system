const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

// 📘 Get result of a specific exam for logged-in student
router.get('/results/:examId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.user.id;
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const submission = await Submission.findOne({ examId, studentId });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    let detailedQuestions = [];

    exam.questions.forEach((question, index) => {
      const studentAnswer = submission.answers.find(ans => ans.questionId === index.toString());

      const selectedAnswer = studentAnswer?.selectedAnswer || [];
      const correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];

      const isCorrect = JSON.stringify(selectedAnswer.sort()) === JSON.stringify(correctAnswer.sort());

      detailedQuestions.push({
        questionText: question.questionText,
        questionImage: question.questionImage,
        options: question.options,
        correctAnswer,
        selectedAnswer,
        isCorrect
      });
    });

    res.json({
      examTitle: exam.title,
      score: submission.score,
      questions: detailedQuestions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
