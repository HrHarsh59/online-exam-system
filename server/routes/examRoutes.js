const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Submission = require('../models/Submission'); // ✅ Required for result saving
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Create New Exam (Teacher Only)
router.post('/create-exam', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create exams' });
    }

    const { title, date, duration, questions } = req.body;

    const exam = new Exam({
      title,
      date,
      duration,
      questions,
      createdBy: req.user.id
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all exams (Admin/Teacher only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const exams = await Exam.find({ createdBy: req.user.id });
      res.json(exams);
    } else if (req.user.role === 'admin') {
      const exams = await Exam.find();
      res.json(exams);
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Exam
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete exams' });
    }

    const deleted = await Exam.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Exam
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can update exams' });
    }

    const updated = await Exam.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Exam not found or unauthorized' });
    }

    res.json({ message: 'Exam updated successfully', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get single exam by ID (Student)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Submit Exam (Student)
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit exams' });
    }

    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    let score = 0;

    exam.questions.forEach((question, index) => {
      const submitted = answers.find(ans => ans.questionId === index.toString());

      const correct = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];

      const selected = submitted?.selectedAnswer || [];

      if (JSON.stringify(correct.sort()) === JSON.stringify(selected.sort())) {
        score += 1;
      }
    });

    const submission = new Submission({
      examId: req.params.id,
      studentId: req.user.id,
      answers,
      score
    });

    await submission.save();
    res.status(201).json({ message: 'Exam submitted!', score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
