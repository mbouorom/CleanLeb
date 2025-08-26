const Quiz = require('../models/Quiz');

const sampleQuizzes = [
  {
    title: "Lebanon Waste Management Basics",
    description: "Test your knowledge about waste management in Lebanon",
    category: "waste_management",
    difficulty: "easy",
    questions: [
      {
        question: "What is the main waste management challenge in Lebanon?",
        options: [
          { text: "Too much recycling" },
          { text: "Lack of proper waste collection systems" },
          { text: "Too many landfills" },
          { text: "Excessive composting" }
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: "Which of these is a recyclable material?",
        options: [
          { text: "Plastic bottles" },
          { text: "Food waste" },
          { text: "Dirty diapers" },
          { text: "Broken glass mixed with food" }
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        question: "What should you do when you see illegal dumping?",
        options: [
          { text: "Ignore it" },
          { text: "Add your trash to the pile" },
          { text: "Report it through CleanLeb app" },
          { text: "Move it to another location" }
        ],
        correctAnswer: 2,
        points: 15
      }
    ],
    createdBy: null, // You'll need to set this to an admin user ID
    isActive: true
  },
  {
    title: "Recycling Champions Quiz",
    description: "Advanced quiz about recycling practices and environmental impact",
    category: "recycling",
    difficulty: "medium",
    questions: [
      {
        question: "How long does it take for a plastic bottle to decompose?",
        options: [
          { text: "1 year" },
          { text: "10 years" },
          { text: "100 years" },
          { text: "450+ years" }
        ],
        correctAnswer: 3,
        points: 15
      },
      {
        question: "Which recycling symbol indicates PET plastic?",
        options: [
          { text: "Symbol 1" },
          { text: "Symbol 3" },
          { text: "Symbol 5" },
          { text: "Symbol 7" }
        ],
        correctAnswer: 0,
        points: 20
      }
    ],
    createdBy: null,
    isActive: true
  }
];

const seedQuizzes = async () => {
  try {
    await Quiz.deleteMany({}); // Clear existing quizzes
    await Quiz.insertMany(sampleQuizzes);
    console.log('Sample quizzes seeded successfully');
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  }
};

module.exports = seedQuizzes;