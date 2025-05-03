// server/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Storage Setting
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload Route
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
