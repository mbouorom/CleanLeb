/* eslint-disable @typescript-eslint/no-require-imports */
const Report = require("../models/Report");

// Update report status/priority (admin only)
exports.updateReport = async (req, res) => {
  try {
    console.log("=== ADMIN UPDATE REPORT ===");
    console.log("User making request:", req.user);
    console.log("Report ID:", req.params.id);
    console.log("Request body:", req.body);

    const { status, priority } = req.body;

    console.log("Finding and updating report...");
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, priority },
      { new: true }
    ).populate("reporter", "name"); // Changed from "reportedBy" to "reporter"

    if (!report) {
      console.log("Report not found");
      return res.status(404).json({ message: "Report not found" });
    }

    console.log("Report updated successfully:", report._id);
    res.json({ message: "Report updated successfully", report });
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
