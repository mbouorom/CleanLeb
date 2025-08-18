const express = require("express")
const { body, validationResult } = require("express-validator")
const Report = require("../models/Report")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const { cloudinary, upload } = require("../config/cloudinary")

const router = express.Router()

// Get all reports with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, city, lat, lng, radius = 5000 } = req.query

    const query = {}

    if (status) query.status = status
    if (category) query.category = category
    if (city) query["location.city"] = new RegExp(city, "i")

    // Location-based search
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number.parseFloat(lng), Number.parseFloat(lat)],
          },
          $maxDistance: Number.parseInt(radius),
        },
      }
    }

    const reports = await Report.find(query)
      .populate("reporter", "name")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Report.countDocuments(query)

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new report
router.post(
  "/",
  auth,
  upload.array("images", 5),
  [
    body("title").trim().isLength({ min: 5 }).withMessage("Title must be at least 5 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("category").isIn(["illegal_dumping", "overflowing_bins", "missed_collection", "hazardous_waste", "other"]),
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, category, latitude, longitude, address, city, region } = req.body

      // Upload images to Cloudinary
      const images = []
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload_stream({ folder: "waste-reports" }, (error, result) => {
            if (error) throw error
            return result
          })

          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: "waste-reports" }, (error, result) => {
              if (error) reject(error)
              else resolve(result)
            })
            stream.end(file.buffer)
          })

          const uploadResult = await uploadPromise
          images.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          })
        }
      }

      const report = new Report({
        title,
        description,
        category,
        location: {
          type: "Point",
          coordinates: [Number.parseFloat(longitude), Number.parseFloat(latitude)],
          address,
          city,
          region,
        },
        images,
        reporter: req.user._id,
      })

      await report.save()

      // Update user's report count and points
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { reportsCount: 1, points: 10 },
      })

      await report.populate("reporter", "name")

      res.status(201).json(report)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get single report
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "name")
      .populate("assignedTo", "name")
      .populate("comments.user", "name")

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json(report)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Vote on report
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { voteType } = req.body // 'up' or 'down'
    const report = await Report.findById(req.params.id)

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    // Remove existing vote
    report.votes.upvotes = report.votes.upvotes.filter((vote) => vote.user.toString() !== req.user._id.toString())
    report.votes.downvotes = report.votes.downvotes.filter((vote) => vote.user.toString() !== req.user._id.toString())

    // Add new vote
    if (voteType === "up") {
      report.votes.upvotes.push({ user: req.user._id })
    } else if (voteType === "down") {
      report.votes.downvotes.push({ user: req.user._id })
    }

    await report.save()
    res.json({ message: "Vote recorded" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add comment to report
router.post(
  "/:id/comment",
  auth,
  [body("text").trim().isLength({ min: 1 }).withMessage("Comment cannot be empty")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const report = await Report.findById(req.params.id)
      if (!report) {
        return res.status(404).json({ message: "Report not found" })
      }

      report.comments.push({
        user: req.user._id,
        text: req.body.text,
      })

      await report.save()
      await report.populate("comments.user", "name")

      res.json(report.comments[report.comments.length - 1])
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
