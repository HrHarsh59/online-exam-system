const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    console.log("User in student dashboard:", req.user); // you already added this

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const currentExams = await Exam.find();


    const upcomingExams = await Exam.find({
      date: { $gte: endOfToday }
    });

    const latestSubmission = await Submission.find({ studentId: req.user.id })
      .sort({ submittedAt: -1 })
      .limit(1)
      .populate('examId');

    const result = latestSubmission.length > 0 ? {
      examTitle: latestSubmission[0].examId.title,
      score: latestSubmission[0].score
    } : null;

    res.json({ currentExams, upcomingExams, result });

  } catch (err) {
    console.error("Dashboard Error:", err);  // 🧠 ADD THIS
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
