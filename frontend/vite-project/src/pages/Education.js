"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { educationAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const Education = () => {
  const { isAuthenticated } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("quizzes")

  useEffect(() => {
    fetchEducationContent()
  }, [])

  const fetchEducationContent = async () => {
    try {
      setLoading(true)
      const [quizzesResponse, tipsResponse] = await Promise.all([educationAPI.getQuizzes(), educationAPI.getTips()])

      setQuizzes(quizzesResponse.data)
      setTips(tipsResponse.data)
    } catch (error) {
      console.error("Error fetching education content:", error)
      toast.error("Failed to load educational content")
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "recycling":
        return "♻️"
      case "composting":
        return "🌱"
      case "waste_reduction":
        return "📉"
      case "general":
        return "🌍"
      default:
        return "📚"
    }
  }

  const getCategoryLabel = (category) => {
    const categories = {
      recycling: "Recycling",
      composting: "Composting",
      waste_reduction: "Waste Reduction",
      general: "General",
    }
    return categories[category] || category
  }

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading educational content...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Learn & Earn</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Expand your knowledge about waste management and environmental sustainability. Take quizzes to earn points and
          badges!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "quizzes" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === "tips" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tips & Guides ({tips.length})
          </button>
        </div>
      </div>

      {/* Quizzes Tab */}
      {activeTab === "quizzes" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Environmental Quizzes</h2>
            {!isAuthenticated && (
              <div className="text-sm text-gray-600">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>{" "}
                to take quizzes and earn points
              </div>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="card text-center py-8">
              <h3 className="text-xl font-semibold mb-4">No quizzes available</h3>
              <p className="text-gray-600">Check back later for new educational content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{getCategoryIcon(quiz.category)}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}
                        >
                          {quiz.difficulty.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{getCategoryLabel(quiz.category)}</span>
                      </div>
                    </div>
                  </div>

                  {quiz.description && <p className="text-gray-700 mb-4">{quiz.description}</p>}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{quiz.questions?.length || 0} questions</span>
                    <span>{quiz.totalPoints || 0} points</span>
                  </div>

                  {isAuthenticated ? (
                    <Link to={`/quiz/${quiz._id}`} className="btn btn-primary w-full">
                      Take Quiz
                    </Link>
                  ) : (
                    <Link to="/login" className="btn btn-secondary w-full">
                      Login to Take Quiz
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === "tips" && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Environmental Tips & Guides</h2>

          {tips.length === 0 ? (
            <div className="card text-center py-8">
              <h3 className="text-xl font-semibold mb-4">No tips available</h3>
              <p className="text-gray-600">Check back later for new tips and guides!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((tip) => (
                <div key={tip.id} className="card hover:shadow-lg transition-shadow">
                  {tip.image && (
                    <img
                      src={tip.image || "/placeholder.svg?height=200&width=400&query=environmental tip"}
                      alt={tip.title}
                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                    />
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getCategoryIcon(tip.category)}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{tip.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{tip.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className="card mt-12 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
          <p className="text-gray-700 mb-6">
            Put your knowledge into action by reporting waste issues in your community.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/create-report" className="btn btn-primary">
              Report an Issue
            </Link>
            <Link to="/map" className="btn btn-secondary">
              View Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Education
