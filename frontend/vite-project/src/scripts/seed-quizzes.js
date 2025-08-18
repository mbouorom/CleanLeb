// This script seeds the database with sample quizzes for testing
// Run this from the backend: node scripts/seed-quizzes.js

const mongoose = require("mongoose")
const Quiz = require("../models/Quiz")
require("dotenv").config()

const sampleQuizzes = [
  {
    title: "Recycling Basics",
    description: "Test your knowledge about proper recycling practices",
    category: "recycling",
    difficulty: "easy",
    questions: [
      {
        question: "Which of these materials can be recycled in most municipal programs?",
        options: [
          { text: "Pizza boxes with grease stains", isCorrect: false },
          { text: "Clean aluminum cans", isCorrect: true },
          { text: "Broken glass mirrors", isCorrect: false },
          { text: "Plastic bags", isCorrect: false },
        ],
        explanation:
          "Clean aluminum cans are widely recyclable. Pizza boxes with grease, broken mirrors, and plastic bags require special handling.",
        points: 10,
      },
      {
        question: "What should you do before recycling a plastic bottle?",
        options: [
          { text: "Remove the cap and label", isCorrect: false },
          { text: "Rinse it clean", isCorrect: true },
          { text: "Cut it into pieces", isCorrect: false },
          { text: "Nothing, just throw it in", isCorrect: false },
        ],
        explanation: "Rinsing containers clean helps prevent contamination in the recycling process.",
        points: 10,
      },
      {
        question: "Which number plastic is most commonly recycled?",
        options: [
          { text: "#1 (PET)", isCorrect: true },
          { text: "#3 (PVC)", isCorrect: false },
          { text: "#6 (PS)", isCorrect: false },
          { text: "#7 (Other)", isCorrect: false },
        ],
        explanation: "#1 PET plastics (like water bottles) are the most commonly recycled plastic type.",
        points: 10,
      },
    ],
    totalPoints: 30,
  },
  {
    title: "Composting Fundamentals",
    description: "Learn the basics of home composting",
    category: "composting",
    difficulty: "medium",
    questions: [
      {
        question: "What is the ideal carbon to nitrogen ratio for composting?",
        options: [
          { text: "1:1", isCorrect: false },
          { text: "30:1", isCorrect: true },
          { text: "10:1", isCorrect: false },
          { text: "50:1", isCorrect: false },
        ],
        explanation:
          "The ideal C:N ratio for composting is about 30:1, which provides the right balance for decomposition.",
        points: 15,
      },
      {
        question: "Which of these should NOT go in a home compost bin?",
        options: [
          { text: "Fruit peels", isCorrect: false },
          { text: "Coffee grounds", isCorrect: false },
          { text: "Meat scraps", isCorrect: true },
          { text: "Dry leaves", isCorrect: false },
        ],
        explanation: "Meat scraps can attract pests and create odors. They should not go in home compost bins.",
        points: 15,
      },
      {
        question: "How often should you turn your compost pile?",
        options: [
          { text: "Daily", isCorrect: false },
          { text: "Weekly", isCorrect: false },
          { text: "Every 2-3 weeks", isCorrect: true },
          { text: "Never", isCorrect: false },
        ],
        explanation: "Turning compost every 2-3 weeks provides adequate aeration without being too labor-intensive.",
        points: 15,
      },
    ],
    totalPoints: 45,
  },
  {
    title: "Waste Reduction Strategies",
    description: "Advanced techniques for minimizing waste",
    category: "waste_reduction",
    difficulty: "hard",
    questions: [
      {
        question: "What does the 'R' hierarchy stand for in waste management?",
        options: [
          { text: "Recycle, Reuse, Reduce", isCorrect: false },
          { text: "Reduce, Reuse, Recycle", isCorrect: true },
          { text: "Reuse, Reduce, Recycle", isCorrect: false },
          { text: "Refuse, Reduce, Reuse, Recycle", isCorrect: false },
        ],
        explanation: "The correct order is Reduce, Reuse, Recycle - in order of environmental impact.",
        points: 20,
      },
      {
        question: "Which packaging material has the lowest environmental impact?",
        options: [
          { text: "Plastic", isCorrect: false },
          { text: "Aluminum", isCorrect: false },
          { text: "Glass", isCorrect: false },
          { text: "None - avoiding packaging is best", isCorrect: true },
        ],
        explanation:
          "The best packaging is no packaging. Buying in bulk or choosing unpackaged items reduces waste most effectively.",
        points: 20,
      },
    ],
    totalPoints: 40,
  },
]

async function seedQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lebanon-waste-management")
    console.log("Connected to MongoDB")

    // Clear existing quizzes
    await Quiz.deleteMany({})
    console.log("Cleared existing quizzes")

    // Insert sample quizzes
    const insertedQuizzes = await Quiz.insertMany(sampleQuizzes)
    console.log(`Inserted ${insertedQuizzes.length} sample quizzes`)

    console.log("Quiz seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding quizzes:", error)
    process.exit(1)
  }
}

seedQuizzes()
