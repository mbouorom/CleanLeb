"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { educationAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await educationAPI.getQuiz(id);
      console.log("Quiz response:", response.data);

      // Handle both response formats (educationController vs quizController)
      const quizData = response.data.data || response.data;
      setQuiz(quizData);
      setAnswers(new Array(quizData.questions.length).fill(null));
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
      navigate("/education");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer");
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { selectedOption };
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(
        newAnswers[currentQuestion + 1]?.selectedOption ?? null
      );
    } else {
      handleSubmitQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]?.selectedOption ?? null);
    }
  };

  const handleSubmitQuiz = async (finalAnswers) => {
    try {
      setSubmitting(true);
      const response = await educationAPI.submitQuiz(id, finalAnswers);
      console.log("Submit response:", response.data);

      // Handle both response formats
      const resultData = response.data.data || response.data;
      setResult({
        totalScore: resultData.totalScore || resultData.score,
        percentage: resultData.percentage,
        correctAnswers: resultData.correctAnswers,
        totalQuestions: resultData.totalQuestions,
      });
      setShowResult(true);

      // Update user points in context
      if (user) {
        const pointsEarned = resultData.totalScore || resultData.score;
        updateUser({
          ...user,
          points: user.points + pointsEarned,
        });
      }

      toast.success(
        `Quiz completed! You earned ${
          resultData.totalScore || resultData.score
        } points!`
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("already completed")
      ) {
        toast.error("You have already completed this quiz!");
      } else {
        toast.error("Failed to submit quiz");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return "Excellent! You're an eco-expert!";
    if (percentage >= 70)
      return "Great job! You have solid environmental knowledge.";
    if (percentage >= 50) return "Good effort! Keep learning to improve.";
    return "Keep studying! There's always room to grow.";
  };

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div style={{ fontSize: "1.25rem" }}>Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            Quiz not found
          </h3>
          <Link
            to="/education"
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Back to Education
          </Link>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div
        className="container"
        style={{ maxWidth: "600px", margin: "2rem auto" }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Quiz Complete!
          </h2>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              className={`${getScoreColor(result.percentage)}`}
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {result.percentage}%
            </div>
            <div
              style={{
                fontSize: "1.125rem",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              {result.correctAnswers} out of {result.totalQuestions} correct
            </div>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#2563eb",
                marginBottom: "0.5rem",
              }}
            >
              +{result.totalScore} Points Earned!
            </div>
            <p style={{ color: "#374151" }}>
              {getScoreMessage(result.percentage)}
            </p>
          </div>

          {result.percentage >= 90 && (
            <div
              style={{
                background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                color: "white",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                🏆
              </div>
              <div style={{ fontWeight: "600" }}>Badge Earned: Eco Expert!</div>
              <div style={{ fontSize: "0.875rem", opacity: "0.9" }}>
                Scored 90% or higher on a quiz
              </div>
            </div>
          )}

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
          >
            <Link
              to="/education"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Take Another Quiz
            </Link>
            <Link
              to="/dashboard"
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div
      className="container"
      style={{ maxWidth: "700px", margin: "2rem auto" }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <Link
          to="/education"
          style={{ color: "#2563eb", textDecoration: "none" }}
        >
          ← Back to Education
        </Link>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Quiz Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            {quiz.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>•</span>
            <span>{question.points} points</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.875rem",
              color: "#6b7280",
              marginBottom: "0.5rem",
            }}
          >
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              width: "100%",
              backgroundColor: "#e5e7eb",
              borderRadius: "1rem",
              height: "8px",
            }}
          >
            <div
              style={{
                backgroundColor: "#2563eb",
                height: "8px",
                borderRadius: "1rem",
                transition: "all 0.3s",
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
            }}
          >
            {question.question}
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  textAlign: "left",
                  border: `2px solid ${
                    selectedOption === index ? "#2563eb" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  backgroundColor:
                    selectedOption === index ? "#eff6ff" : "white",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (selectedOption !== index) {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOption !== index) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: `2px solid ${
                        selectedOption === index ? "#2563eb" : "#d1d5db"
                      }`,
                      backgroundColor:
                        selectedOption === index ? "#2563eb" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedOption === index && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                        }}
                      ></div>
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              backgroundColor: currentQuestion === 0 ? "#f3f4f6" : "#6b7280",
              color: currentQuestion === 0 ? "#9ca3af" : "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {currentQuestion + 1} / {quiz.questions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedOption === null || submitting}
            style={{
              backgroundColor:
                selectedOption === null || submitting ? "#f3f4f6" : "#2563eb",
              color:
                selectedOption === null || submitting ? "#9ca3af" : "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              cursor:
                selectedOption === null || submitting
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting
              ? "Submitting..."
              : currentQuestion === quiz.questions.length - 1
              ? "Submit Quiz"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
