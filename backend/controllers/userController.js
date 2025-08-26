/* eslint-disable @typescript-eslint/no-require-imports */
const User = require("../models/User");
const Report = require("../models/Report");

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("name points badges")
      .sort({ points: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    const reportsCount = await Report.countDocuments({ reportedBy: req.user.userId });

    res.json({ user, reportsCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
