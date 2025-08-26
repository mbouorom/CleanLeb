/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express")

const {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getTips,} = require("../controllers/educationController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Quizzes
router.get("/quizzes", getQuizzes)
router.get("/quizzes/:id", getQuizById)
router.post("/quizzes/:id/submit", auth, submitQuiz)

// Tips
router.get("/tips", getTips)

module.exports = router
