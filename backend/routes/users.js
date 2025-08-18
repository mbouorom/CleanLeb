const express = require("express")
const User = require("../models/User")
const Report = require("../models/Report")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    const userReports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 }).limit(5)

    res.json({
      user,
      recentReports: userReports,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find({ role: "citizen" })
      .select("name points reportsCount badges")
      .sort({ points: -1 })
      .limit(10)

    res.json(topUsers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, location } = req.body

    const user = await User.findByIdAndUpdate(req.user._id, { name, location }, { new: true }).select("-password")

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
