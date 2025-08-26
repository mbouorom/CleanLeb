/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "illegal_dumping",
        "overflowing_bins",
        "missed_collection",
        "hazardous_waste",
        "littering",
        "recycling",
        "other",
      ],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      city: String,
      region: String,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    votes: {
      upvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          votedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      downvotes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          votedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
ReportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", ReportSchema);
