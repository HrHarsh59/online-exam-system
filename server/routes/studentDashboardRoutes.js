const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

router.get('/dashboard', authMiddleware, async (req, res) => {
   try {
    console.log("User in student dashboard:", req.user); 

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.user.id;

    // 🔹 Get today's start and end time
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // 🔹 Current Exam: exact today's date
    // 🔹 Current Exams (all for today)
    const currentExams = await Exam.find({
      date: { $gte: startOfToday, $lt: endOfToday }
    }).sort({ date: 1 });


    // 🔹 Upcoming Exams: after today
   // 🔹 Upcoming Exams
    const upcomingExams = await Exam.find({
      date: { $gte: endOfToday }
    }).sort({ date: 1 });


    // 🔹 Latest Result
    const latestSubmission = await Submission.find({ studentId })
      .sort({ submittedAt: -1 })
      .limit(1)
      .populate('examId');

    const result = latestSubmission.length > 0 ? {
      examTitle: latestSubmission[0].examId.title,
      score: latestSubmission[0].score
    } : null;

    res.json({
      currentExams,      // 👈 array instead of single object
      upcomingExams,
      result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
