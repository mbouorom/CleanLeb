/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["citizen", "admin", "municipal"],
      default: "citizen",
    },
    points: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportsCount: {
      type: Number,
      default: 0,
    },
    location: {
      city: String,
      region: String,
    },
    avatar: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)
