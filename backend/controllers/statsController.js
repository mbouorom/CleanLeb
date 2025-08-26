/* eslint-disable @typescript-eslint/no-require-imports */

const Report = require("../models/Report");
const User = require("../models/User");

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const resolvedReports = await Report.countDocuments({ status: "resolved" });
    const totalUsers = await User.countDocuments();

    res.json({ totalReports, pendingReports, resolvedReports, totalUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
