import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/api.js";

const Dashboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserReports();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get("/users/leaderboard");
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchUserReports = async () => {
    try {
      const response = await api.get("/reports?limit=5");
      setUserReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>
        Welcome back, {user.name}!
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
            Leaderboard
          </h3>
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom:
                  index < leaderboard.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "1.2rem" }}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`}
                </span>
                {user.name}
              </span>
              <span style={{ fontWeight: "bold", color: "#059669" }}>
                {user.points} pts
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>Your Stats</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Points:</span>
              <span style={{ fontWeight: "bold", color: "#059669" }}>
                {user.points}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Badges Earned:</span>
              <span style={{ fontWeight: "bold", color: "#d97706" }}>
                {user.badges?.length || 0}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Member Since:</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Link
              to="/create-report"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                textDecoration: "none",
                display: "inline-block",
                width: "100%",
                textAlign: "center",
              }}
            >
              Report New Issue
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
          Recent Reports
        </h3>
        {userReports.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {userReports.map((report) => (
              <div
                key={report._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>
                    {report.title}
                  </h4>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "#6b7280",
                      fontSize: "0.9rem",
                    }}
                  >
                    {report.category.replace("_", " ")} •{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      background:
                        report.status === "resolved"
                          ? "#d1fae5"
                          : report.status === "in_progress"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        report.status === "resolved"
                          ? "#059669"
                          : report.status === "in_progress"
                          ? "#d97706"
                          : "#dc2626",
                    }}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                  <span style={{ color: "#6b7280" }}>
                    {report.votes?.upvotes?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
            No reports yet. Be the first to report an issue!
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
