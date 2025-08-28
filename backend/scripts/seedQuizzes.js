const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/cleanleb"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

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
          { text: "Excessive composting" },
        ],
        correctAnswer: 1,
        points: 10,
      },
      {
        question: "Which of these is a recyclable material?",
        options: [
          { text: "Plastic bottles" },
          { text: "Food waste" },
          { text: "Dirty diapers" },
          { text: "Broken glass mixed with food" },
        ],
        correctAnswer: 0,
        points: 10,
      },
      {
        question: "What should you do when you see illegal dumping?",
        options: [
          { text: "Ignore it" },
          { text: "Add your trash to the pile" },
          { text: "Report it through CleanLeb app" },
          { text: "Move it to another location" },
        ],
        correctAnswer: 2,
        points: 15,
      },
    ],
    createdBy: new mongoose.Types.ObjectId(),
    isActive: true,
  },
  {
    title: "Recycling Champions Quiz",
    description:
      "Advanced quiz about recycling practices and environmental impact",
    category: "recycling",
    difficulty: "medium",
    questions: [
      {
        question: "How long does it take for a plastic bottle to decompose?",
        options: [
          { text: "1 year" },
          { text: "10 years" },
          { text: "100 years" },
          { text: "450+ years" },
        ],
        correctAnswer: 3,
        points: 15,
      },
      {
        question: "Which recycling symbol indicates PET plastic?",
        options: [
          { text: "Symbol 1" },
          { text: "Symbol 3" },
          { text: "Symbol 5" },
          { text: "Symbol 7" },
        ],
        correctAnswer: 0,
        points: 20,
      },
      {
        question:
          "What percentage of plastic waste is actually recycled globally?",
        options: [
          { text: "Less than 10%" },
          { text: "Around 25%" },
          { text: "About 50%" },
          { text: "Over 75%" },
        ],
        correctAnswer: 0,
        points: 15,
      },
    ],
    createdBy: new mongoose.Types.ObjectId(),
    isActive: true,
  },
  {
    title: "Environmental Sustainability Expert",
    description: "Challenge yourself with advanced environmental concepts",
    category: "sustainability",
    difficulty: "hard",
    questions: [
      {
        question: "What is the primary cause of ocean acidification?",
        options: [
          { text: "Industrial waste" },
          { text: "CO2 absorption by oceans" },
          { text: "Oil spills" },
          { text: "Plastic pollution" },
        ],
        correctAnswer: 1,
        points: 25,
      },
      {
        question:
          "Which renewable energy source has the lowest carbon footprint over its lifecycle?",
        options: [
          { text: "Solar panels" },
          { text: "Wind turbines" },
          { text: "Hydroelectric" },
          { text: "Nuclear power" },
        ],
        correctAnswer: 3,
        points: 25,
      },
    ],
    createdBy: new mongoose.Types.ObjectId(),
    isActive: true,
  },
];

const seedQuizzes = async () => {
  try {
    console.log("Starting quiz seeding process...");
    await connectDB();

    console.log("Clearing existing quizzes...");
    await Quiz.deleteMany({});

    console.log("Inserting sample quizzes...");

    // Insert quizzes one by one to ensure pre-save hooks work
    const insertedQuizzes = [];
    for (let quizData of sampleQuizzes) {
      const quiz = new Quiz(quizData);
      await quiz.save(); // This will trigger the pre-save hook
      insertedQuizzes.push(quiz);
    }

    console.log(`Successfully seeded ${insertedQuizzes.length} quizzes:`);
    insertedQuizzes.forEach((quiz) => {
      console.log(
        `   - ${quiz.title} (${quiz.difficulty}) - ${quiz.questions.length} questions - ${quiz.totalPoints} points`
      );
    });

    mongoose.connection.close();
    console.log("Database connection closed.");
    console.log("Seeding complete! You can now test your quiz functionality.");
  } catch (error) {
    console.error("Error seeding quizzes:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedQuizzes();
