/* eslint-disable @typescript-eslint/no-require-imports */
const Report = require("../models/Report");

// Update report status/priority (admin only)
exports.updateReport = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, priority },
      { new: true }
    ).populate("reportedBy", "name");

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json({ message: "Report updated successfully", report });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
