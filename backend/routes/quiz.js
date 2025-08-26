// ===== 4. Quiz Routes (routes/quiz.js) =====
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  submitQuiz,
  createQuiz,
  getUserQuizHistory
} = require('../controllers/quizController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/quizzes', getQuizzes);
router.get('/quizzes/:id', getQuiz);

// Protected routes (require login)
router.post('/quizzes/:id/submit', auth, submitQuiz);
router.get('/user/quiz-history', auth, getUserQuizHistory);

// Admin routes
router.post('/quizzes', auth, adminAuth, createQuiz);

module.exports = router;

// ===== 5. Add to your main app.js or server.js =====
/*
const quizRoutes = require('./routes/quiz');
app.use('/api/education', quizRoutes);
*/
