/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require("mongoose")

const UserQuizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        selectedOption: Number,
        isCorrect: Boolean,
        points: Number,
      },
    ],
    totalScore: Number,
    percentage: Number,
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("UserQuizResult", UserQuizResultSchema)
