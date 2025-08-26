// ===== 1. Quiz Model (models/Quiz.js) =====
/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['waste_management', 'recycling', 'environment', 'sustainability'],
    default: 'environment'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      text: {
        type: String,
        required: true
      }
    }],
    correctAnswer: {
      type: Number,
      required: true // Index of correct option
    },
    points: {
      type: Number,
      default: 10
    }
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function() {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
});

module.exports = mongoose.model('Quiz', quizSchema);