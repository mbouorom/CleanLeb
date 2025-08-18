const express = require("express")
const Report = require("../models/Report")
const User = require("../models/User")
const Quiz = require("../models/Quiz")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get admin dashboard stats
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments()
    const pendingReports = await Report.countDocuments({ status: "pending" })
    const resolvedReports = await Report.countDocuments({ status: "resolved" })
    const totalUsers = await User.countDocuments({ role: "citizen" })

    const recentReports = await Report.find().populate("reporter", "name").sort({ createdAt: -1 }).limit(5)

    res.json({
      stats: {
        totalReports,
        pendingReports,
        resolvedReports,
        totalUsers,
      },
      recentReports,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update report status
router.put("/reports/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, priority } = req.body

    const updateData = { status }
    if (priority) updateData.priority = priority
    if (status === "resolved") {
      updateData.resolvedAt = new Date()
      updateData.resolvedBy = req.user._id
    }

    const report = await Report.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("reporter", "name")

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    // Award points to reporter if resolved
    if (status === "resolved") {
      await User.findByIdAndUpdate(report.reporter._id, {
        $inc: { points: 20 },
      })
    }

    res.json(report)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Assign report to admin/municipal user
router.put("/reports/:id/assign", adminAuth, async (req, res) => {
  try {
    const { assignedTo } = req.body

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: "in_progress" },
      { new: true },
    ).populate("assignedTo", "name")

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json(report)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create quiz
router.post("/quizzes", adminAuth, async (req, res) => {
  try {
    const quiz = new Quiz(req.body)

    // Calculate total points
    quiz.totalPoints = quiz.questions.reduce((total, q) => total + q.points, 0)

    await quiz.save()
    res.status(201).json(quiz)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
