const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/authMiddleware');

// 👀 View All Upcoming Exams
router.get('/exams', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view exams' });
    }

    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✍️ Attempt Exam
router.post('/exams/:id/submit', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit exams' });
    }

    const { answers } = req.body; // [{ questionId, selectedAnswer }]
    const exam = await Exam.findById(req.params.id);

    let score = 0;

    // Check answers (for multiple choice with checkboxes)
    exam.questions.forEach((question, index) => {
      const submitted = answers.find(ans => ans.questionId === index.toString());
      if (
        submitted &&
        Array.isArray(submitted.selectedAnswer) &&
        Array.isArray(question.correctAnswer)
      ) {
        const selected = [...submitted.selectedAnswer].sort().toString();
        const correct = [...question.correctAnswer].sort().toString();
        if (selected === correct) score += 1;
      }
    });

    const newSubmission = new Submission({
      examId: req.params.id,
      studentId: req.user.id,
      answers,
      score
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Exam submitted!', score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 View Student Result History
router.get('/results', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ studentId: req.user.id }).populate('examId');

    const resultList = submissions.map(sub => ({
      score: sub.score,
      submittedAt: sub.submittedAt,
      examTitle: sub.examId.title
    }));

    res.json(resultList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
