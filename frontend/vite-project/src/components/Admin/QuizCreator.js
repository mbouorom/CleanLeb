"use client"

import { useState } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"

const QuizCreator = ({ onClose, onQuizCreated }) => {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    category: "general",
    difficulty: "easy",
    questions: [
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: "",
        points: 10,
      },
    ],
  })
  const [saving, setSaving] = useState(false)

  const categories = [
    { value: "recycling", label: "Recycling" },
    { value: "composting", label: "Composting" },
    { value: "waste_reduction", label: "Waste Reduction" },
    { value: "general", label: "General" },
  ]

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ]

  const handleQuizChange = (field, value) => {
    setQuizData({
      ...quizData,
      [field]: value,
    })
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...quizData.questions]
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value,
    }
    setQuizData({
      ...quizData,
      questions: newQuestions,
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...quizData.questions]
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value,
    }

    // If setting this option as correct, make others incorrect
    if (field === "isCorrect" && value) {
      newQuestions[questionIndex].options.forEach((option, index) => {
        if (index !== optionIndex) {
          option.isCorrect = false
        }
      })
    }

    setQuizData({
      ...quizData,
      questions: newQuestions,
    })
  }

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          explanation: "",
          points: 10,
        },
      ],
    })
  }

  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, index) => index !== questionIndex)
      setQuizData({
        ...quizData,
        questions: newQuestions,
      })
    }
  }

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      toast.error("Quiz title is required")
      return false
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i]
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`)
        return false
      }

      const hasCorrectAnswer = question.options.some((option) => option.isCorrect)
      if (!hasCorrectAnswer) {
        toast.error(`Question ${i + 1} must have at least one correct answer`)
        return false
      }

      const hasEmptyOption = question.options.some((option) => !option.text.trim())
      if (hasEmptyOption) {
        toast.error(`All options for question ${i + 1} must be filled`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateQuiz()) return

    try {
      setSaving(true)
      const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0)
      const quizToSubmit = {
        ...quizData,
        totalPoints,
      }

      await adminAPI.createQuiz(quizToSubmit)
      toast.success("Quiz created successfully!")
      onQuizCreated()
      onClose()
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("Failed to create quiz")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Quiz</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="form-group">
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={quizData.title}
                  onChange={(e) => handleQuizChange("title", e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={quizData.category}
                  onChange={(e) => handleQuizChange("category", e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={quizData.difficulty}
                  onChange={(e) => handleQuizChange("difficulty", e.target.value)}
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={quizData.description}
                onChange={(e) => handleQuizChange("description", e.target.value)}
                placeholder="Brief description of the quiz"
                rows="3"
              />
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Questions ({quizData.questions.length})</h3>
                <button type="button" onClick={addQuestion} className="btn btn-secondary">
                  Add Question
                </button>
              </div>

              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Question {questionIndex + 1}</h4>
                    {quizData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                      <label className="form-label">Question Text *</label>
                      <textarea
                        className="form-textarea"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                        placeholder="Enter your question"
                        rows="2"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Points</label>
                      <input
                        type="number"
                        className="form-input"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(questionIndex, "points", Number.parseInt(e.target.value))}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${questionIndex}-correct`}
                          checked={option.isCorrect}
                          onChange={(e) =>
                            handleOptionChange(questionIndex, optionIndex, "isCorrect", e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          className="form-input flex-1"
                          value={option.text}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, "text", e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explanation (Optional)</label>
                    <textarea
                      className="form-textarea"
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(questionIndex, "explanation", e.target.value)}
                      placeholder="Explain why this is the correct answer"
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className={`btn btn-primary ${saving ? "loading" : ""}`}>
                {saving ? "Creating Quiz..." : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuizCreator
