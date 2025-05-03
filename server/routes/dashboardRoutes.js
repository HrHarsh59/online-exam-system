const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// 👤 Protected Dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  const role = req.user.role;

  if (role === 'student') {
    res.json({ message: 'Welcome to the Student Dashboard 🎓' });
  } else if (role === 'teacher') {
    res.json({ message: 'Welcome to the Teacher Dashboard 👩‍🏫' });
  } else if (role === 'admin') {
    res.json({ message: 'Welcome to the Admin Dashboard 👑' });
  } else {
    res.status(403).json({ message: 'Access denied: Invalid role' });
  }
});

module.exports = router;
