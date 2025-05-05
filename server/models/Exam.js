// server/models/Exam.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: function() {
      return !this.questionImage;  // ✅ Agar image nahi hai tab text required
    }
  },
  questionImage: {
    type: String, // ✅ Optional URL
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: [String],
    required: true
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Exam', examSchema);
