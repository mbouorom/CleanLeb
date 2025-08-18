const express = require("express")
const Quiz = require("../models/Quiz")
const UserQuizResult = require("../models/UserQuizResult")
const User = require("../models/User")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get all quizzes
router.get("/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).select("-questions.options.isCorrect").sort({ createdAt: -1 })

    res.json(quizzes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single quiz
router.get("/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.options.isCorrect")

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    res.json(quiz)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit quiz answers
router.post("/quizzes/:id/submit", auth, async (req, res) => {
  try {
    const { answers } = req.body
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Calculate score
    let totalScore = 0
    const resultAnswers = []

    answers.forEach((answer, index) => {
      const question = quiz.questions[index]
      const isCorrect = question.options[answer.selectedOption]?.isCorrect || false
      const points = isCorrect ? question.points : 0

      totalScore += points
      resultAnswers.push({
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
        points,
      })
    })

    const percentage = Math.round((totalScore / quiz.totalPoints) * 100)

    // Save result
    const result = new UserQuizResult({
      user: req.user._id,
      quiz: quiz._id,
      answers: resultAnswers,
      totalScore,
      percentage,
    })

    await result.save()

    // Update user points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: totalScore },
    })

    // Award badges based on performance
    if (percentage >= 90) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          badges: {
            name: "Eco Expert",
            description: "Scored 90% or higher on a quiz",
          },
        },
      })
    }

    res.json({
      totalScore,
      percentage,
      correctAnswers: resultAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: quiz.questions.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get educational tips
router.get("/tips", async (req, res) => {
  try {
    const tips = [
      {
        id: 1,
        category: "recycling",
        title: "Proper Plastic Recycling",
        content:
          "Clean plastic containers before recycling. Remove labels when possible and separate different types of plastic.",
        image: "/images/recycling-tip.jpg",
      },
      {
        id: 2,
        category: "composting",
        title: "Home Composting Basics",
        content:
          "Mix green materials (food scraps) with brown materials (dry leaves) in a 1:3 ratio for optimal composting.",
        image: "/images/composting-tip.jpg",
      },
      {
        id: 3,
        category: "waste_reduction",
        title: "Reduce Single-Use Items",
        content:
          "Carry reusable bags, water bottles, and containers to significantly reduce your daily waste footprint.",
        image: "/images/reduce-tip.jpg",
      },
    ]

    res.json(tips)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
