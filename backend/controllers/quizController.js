// ===== 3. Quiz Controller (controllers/quizController.js) =====
/* eslint-disable @typescript-eslint/no-require-imports */
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');

// Get all quizzes
const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter)
      .select('title description category difficulty totalPoints createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes'
    });
  }
};

// Get specific quiz
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name');

    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Remove correct answers from response
    const quizData = quiz.toObject();
    quizData.questions = quizData.questions.map(q => ({
      question: q.question,
      options: q.options,
      points: q.points
    }));

    res.json({
      success: true,
      data: quizData
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
};

// Submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(id);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user already submitted
    const existingSubmission = await QuizSubmission.findOne({
      quiz: id,
      user: userId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this quiz'
      });
    }

    // Validate answers
    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers provided'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalScore = 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer && userAnswer.selectedOption === question.correctAnswer) {
        correctAnswers++;
        totalScore += question.points;
      }
    });

    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Create submission
    const submission = new QuizSubmission({
      quiz: id,
      user: userId,
      answers,
      score: totalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      percentage
    });

    await submission.save();

    // Update user points
    await User.findByIdAndUpdate(userId, {
      $inc: { points: totalScore }
    });

    res.json({
      success: true,
      data: {
        score: totalScore,
        totalScore,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

// Create quiz (admin only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions } = req.body;
    const userId = req.user.id;

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz must have at least one question'
      });
    }

    // Validate each question
    for (let question of questions) {
      if (!question.question || !question.options || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and at least 2 options'
        });
      }
      if (question.correctAnswer === undefined || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have a valid correct answer'
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      questions,
      createdBy: userId
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalPoints: quiz.totalPoints
      }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz'
    });
  }
};

// Get user's quiz history
const getUserQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const submissions = await QuizSubmission.find({ user: userId })
      .populate('quiz', 'title category difficulty')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz history'
    });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  submitQuiz,
  createQuiz,
  getUserQuizHistory
};