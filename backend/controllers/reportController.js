/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const fs = require("fs");
const Report = require("../models/Report");
const User = require("../models/User");

// ------------------------ GET ALL REPORTS ------------------------
exports.getReports = async (req, res) => {
  try {
    // Build filter object based on query parameters
    const filter = {};

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add city filter if provided
    if (req.query.city) {
      filter["location.city"] = { $regex: req.query.city, $options: "i" }; // Case-insensitive search
    }

    // Add reporter filter if provided (useful for dashboard to get user's reports)
    if (req.query.reporter) {
      filter.reporter = req.query.reporter;
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);
    const totalPages = Math.ceil(totalReports / limit);

    // Fetch reports with filters, pagination, and populate
    const reports = await Report.find(filter)
      .populate("reporter", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      reports,
      currentPage: page,
      totalPages,
      total: totalReports,
      hasMore: page < totalPages,
    });
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------ GET REPORT BY ID ------------------------
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate("reporter", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ report });
  } catch (err) {
    console.error("❌ Error fetching report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------ CREATE REPORT ------------------------
exports.createReport = async (req, res) => {
  try {
    // FIXED: Check for req.user._id instead of req.user.userId
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      city,
      region,
    } = req.body;

    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const imageUrls = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const filename = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        imageUrls.push(`/uploads/${filename}`);
      }
    }

    const report = await Report.create({
      title,
      description,
      category,
      reporter: req.user._id,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || "",
        city: city || "",
        region: region || "",
      },
      images: imageUrls.map((url) => ({ url })),
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

    res.status(201).json({ message: "Report created successfully", report });
  } catch (err) {
    console.error("❌ Error creating report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------------ UPDATE REPORT STATUS ------------------------
exports.updateReportStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // Only municipal or admin allowed
    if (!["municipal", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Not authorized to update status" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "in_progress", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;

    // if report is resolved, track who resolved it + when
    if (status === "resolved") {
      report.resolvedAt = new Date();
      report.resolvedBy = req.user._id;
    }

    await report.save();

    res.status(200).json({
      message: `Report status updated to '${status}'`,
      report,
    });
  } catch (err) {
    console.error("❌ Error updating report status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------ VOTE ON REPORT ------------------------
exports.voteReport = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const { id } = req.params;
    const { voteType } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (!report.votes) {
      report.votes = { upvotes: [], downvotes: [] };
    }

    const userId = req.user._id.toString();
    const hasUpvoted = report.votes.upvotes.some(
      (vote) => vote.user.toString() === userId
    );
    const hasDownvoted = report.votes.downvotes.some(
      (vote) => vote.user.toString() === userId
    );

    if (voteType === "up") {
      if (hasUpvoted) {
        report.votes.upvotes = report.votes.upvotes.filter(
          (vote) => vote.user.toString() !== userId
        );
      } else {
        report.votes.upvotes.push({ user: req.user._id });
        if (hasDownvoted) {
          report.votes.downvotes = report.votes.downvotes.filter(
            (vote) => vote.user.toString() !== userId
          );
        }
      }
    } else if (voteType === "down") {
      if (hasDownvoted) {
        report.votes.downvotes = report.votes.downvotes.filter(
          (vote) => vote.user.toString() !== userId
        );
      } else {
        report.votes.downvotes.push({ user: req.user._id });
        if (hasUpvoted) {
          report.votes.upvotes = report.votes.upvotes.filter(
            (vote) => vote.user.toString() !== userId
          );
        }
      }
    }

    await report.save();

    res.status(200).json({
      message: "Vote updated successfully",
      votes: {
        up: report.votes.upvotes.length,
        down: report.votes.downvotes.length,
      },
    });
  } catch (err) {
    console.error("❌ Error voting on report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
