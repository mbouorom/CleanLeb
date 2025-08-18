"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { educationAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const Quiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await educationAPI.getQuiz(id)
      setQuiz(response.data)
      setAnswers(new Array(response.data.questions.length).fill(null))
    } catch (error) {
      console.error("Error fetching quiz:", error)
      toast.error("Failed to load quiz")
      navigate("/education")
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer")
      return
    }

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = { selectedOption }
    setAnswers(newAnswers)

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(newAnswers[currentQuestion + 1]?.selectedOption ?? null)
    } else {
      handleSubmitQuiz(newAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedOption(answers[currentQuestion - 1]?.selectedOption ?? null)
    }
  }

  const handleSubmitQuiz = async (finalAnswers) => {
    try {
      setSubmitting(true)
      const response = await educationAPI.submitQuiz(id, finalAnswers)
      setResult(response.data)
      setShowResult(true)

      // Update user points in context
      if (user) {
        updateUser({
          ...user,
          points: user.points + response.data.totalScore,
        })
      }

      toast.success(`Quiz completed! You earned ${response.data.totalScore} points!`)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! You're an eco-expert!"
    if (percentage >= 70) return "Great job! You have solid environmental knowledge."
    if (percentage >= 50) return "Good effort! Keep learning to improve."
    return "Keep studying! There's always room to grow."
  }

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="card text-center py-8">
          <h3 className="text-xl font-semibold mb-4">Quiz not found</h3>
          <Link to="/education" className="btn btn-primary">
            Back to Education
          </Link>
        </div>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <div className="card text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.percentage)}`}>{result.percentage}%</div>
            <div className="text-lg text-gray-600 mb-4">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </div>
            <div className="text-lg font-semibold text-blue-600 mb-2">+{result.totalScore} Points Earned!</div>
            <p className="text-gray-700">{getScoreMessage(result.percentage)}</p>
          </div>

          {result.percentage >= 90 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-6">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold">Badge Earned: Eco Expert!</div>
              <div className="text-sm opacity-90">Scored 90% or higher on a quiz</div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link to="/education" className="btn btn-primary">
              Take Another Quiz
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="container" style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div className="mb-4">
        <Link to="/education" className="text-blue-600 hover:underline">
          ← Back to Education
        </Link>
      </div>

      <div className="card">
        {/* Quiz Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>•</span>
            <span>{question.points} points</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                  selectedOption === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedOption === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {selectedOption === index && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button onClick={handlePrevious} disabled={currentQuestion === 0} className="btn btn-secondary">
            Previous
          </button>

          <div className="text-sm text-gray-600">
            {currentQuestion + 1} / {quiz.questions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedOption === null || submitting}
            className={`btn btn-primary ${submitting ? "loading" : ""}`}
          >
            {submitting ? "Submitting..." : currentQuestion === quiz.questions.length - 1 ? "Submit Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Quiz
