"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { educationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Education = () => {
  const { isAuthenticated } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    fetchEducationContent();
  }, []);

  const fetchEducationContent = async () => {
    try {
      setLoading(true);
      const [quizzesResponse, tipsResponse] = await Promise.all([
        educationAPI.getQuizzes(),
        educationAPI.getTips(),
      ]);

      // Handle both response formats from your controllers
      const quizzesData =
        quizzesResponse.data.quizzes || quizzesResponse.data || [];
      setQuizzes(quizzesData);
      setTips(tipsResponse.data);
    } catch (error) {
      console.error("Error fetching education content:", error);
      toast.error("Failed to load educational content");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "waste_management":
        return "🗑️";
      case "recycling":
        return "♻️";
      case "environment":
        return "🌱";
      case "sustainability":
        return "🌍";
      default:
        return "📚";
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const categoryMatch =
      selectedCategory === "all" || quiz.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  if (loading) {
    return (
      <div
        className="container"
        style={{ margin: "2rem auto", textAlign: "center" }}
      >
        <div style={{ padding: "2rem" }}>
          <h2>Loading quizzes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          🌱 Environmental Education & Quizzes
        </h1>
        <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem" }}>
          Test your environmental knowledge and earn points!
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div>
          <label style={{ marginRight: "0.5rem", fontWeight: "500" }}>
            Category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              backgroundColor: "white",
            }}
          >
            <option value="all">All Categories</option>
            <option value="waste_management">Waste Management</option>
            <option value="recycling">Recycling</option>
            <option value="environment">Environment</option>
            <option value="sustainability">Sustainability</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: "0.5rem", fontWeight: "500" }}>
            Difficulty:
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              backgroundColor: "white",
            }}
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <h3>No quizzes available</h3>
          <p style={{ color: "#666" }}>
            {quizzes.length === 0
              ? "No quizzes have been created yet."
              : "No quizzes match your current filters."}
          </p>
          {quizzes.length === 0 && (
            <p style={{ color: "#666", marginTop: "1rem" }}>
              Make sure to run the seed script to populate sample quizzes!
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "2rem", marginRight: "0.5rem" }}>
                  {getCategoryIcon(quiz.category)}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: "0",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  >
                    {quiz.title}
                  </h3>
                  <span
                    className={getDifficultyColor(quiz.difficulty)}
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      marginTop: "0.5rem",
                    }}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: "#666",
                  marginBottom: "1rem",
                  lineHeight: "1.5",
                }}
              >
                {quiz.description}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "#666",
                }}
              >
                <span>📝 {quiz.questionCount || 0} Questions</span>
                <span>⭐ {quiz.totalPoints || 0} Points</span>
              </div>

              <Link
                to={`/quiz/${quiz._id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
              >
                Start Quiz →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Education;
