/* eslint-disable @typescript-eslint/no-require-imports */
// ===== 2. Quiz Submission Model (models/QuizSubmission.js) =====
const mongoose = require('mongoose'); 

const submissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    selectedOption: Number
  }],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate submissions
submissionSchema.index({ quiz: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', submissionSchema);


