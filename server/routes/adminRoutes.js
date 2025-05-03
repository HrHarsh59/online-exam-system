const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Exam = require('../models/Exam');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Get all users
router.get('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const users = await User.find().select('-password');
  res.json(users);
});

// 🗑 Delete user by ID
router.delete('/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

// ✅ View all exams
router.get('/exams', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const exams = await Exam.find();
  res.json(exams);
});

// 🗑 Delete exam by ID
router.delete('/exams/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  await Exam.findByIdAndDelete(req.params.id);
  res.json({ message: 'Exam deleted successfully' });
});

module.exports = router;
