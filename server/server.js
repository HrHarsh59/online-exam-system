// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const examRoutes = require('./routes/examRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const studentDashboardRoutes = require('./routes/studentDashboardRoutes');
const studentExamRoutes = require('./routes/studentExamRoutes');  // ✅ Student Exam Submit
const studentResultRoutes = require('./routes/studentResultRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/exams', examRoutes);                   // ✅ Teacher exam routes
app.use('/api/upload-image', uploadRoutes);
app.use('/api/student', studentDashboardRoutes);
app.use('/api/student-exams', studentExamRoutes);    // ✅ Fixed
app.use('/api/student', studentResultRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('Online Exam System Backend Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
