const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const cloudinary = require("cloudinary").v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ storage })

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
})

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["illegal_dumping", "overflowing_bins", "littering", "recycling", "other"],
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String,
  },
  images: [String],
  status: {
    type: String,
    enum: ["pending", "in_progress", "resolved", "rejected"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  votes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)
const Report = mongoose.model("Report", reportSchema)

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" })
    req.user = user
    next()
  })
}

// Middleware for admin authentication
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      })
      .end(buffer)
  })
}

// AUTH ROUTES
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ name, email, password: hashedPassword })
    await user.save()

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// REPORT ROUTES
app.get("/api/reports", async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query
    const filter = {}

    if (category) filter.category = category
    if (status) filter.status = status

    const reports = await Report.find(filter)
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Report.countDocuments(filter)

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/reports/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("reportedBy", "name").populate("votedBy", "name")

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json(report)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.post("/api/reports", authenticateToken, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body

    const imageUrls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file.buffer)
        imageUrls.push(imageUrl)
      }
    }

    const report = new Report({
      title,
      description,
      category,
      location: { latitude: Number.parseFloat(latitude), longitude: Number.parseFloat(longitude), address },
      images: imageUrls,
      reportedBy: req.user.userId,
    })

    await report.save()
    await report.populate("reportedBy", "name")

    // Award points to user
    await User.findByIdAndUpdate(req.user.userId, { $inc: { points: 10 } })

    res.status(201).json({ message: "Report created successfully", report })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.put("/api/reports/:id/vote", authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    const hasVoted = report.votedBy.includes(req.user.userId)

    if (hasVoted) {
      // Remove vote
      report.votes -= 1
      report.votedBy = report.votedBy.filter((id) => id.toString() !== req.user.userId)
    } else {
      // Add vote
      report.votes += 1
      report.votedBy.push(req.user.userId)
    }

    await report.save()
    res.json({ message: hasVoted ? "Vote removed" : "Vote added", votes: report.votes })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// USER ROUTES
app.get("/api/users/leaderboard", async (req, res) => {
  try {
    const users = await User.find().select("name points badges").sort({ points: -1 }).limit(10)

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    const userReports = await Report.find({ reportedBy: req.user.userId }).countDocuments()

    res.json({ user, reportsCount: userReports })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// STATS ROUTE
app.get("/api/stats", async (req, res) => {
  try {
    const totalReports = await Report.countDocuments()
    const pendingReports = await Report.countDocuments({ status: "pending" })
    const resolvedReports = await Report.countDocuments({ status: "resolved" })
    const totalUsers = await User.countDocuments()

    res.json({
      totalReports,
      pendingReports,
      resolvedReports,
      totalUsers,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// ADMIN ROUTES
app.put("/api/admin/reports/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, priority } = req.body
    const report = await Report.findByIdAndUpdate(req.params.id, { status, priority }, { new: true }).populate(
      "reportedBy",
      "name",
    )

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    res.json({ message: "Report updated successfully", report })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
