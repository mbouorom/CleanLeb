import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1
          style={{ fontSize: "3rem", color: "#1e40af", marginBottom: "1rem" }}
        >
          🇱🇧 Lebanon Waste Management
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#6b7280",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Help keep Lebanon clean by reporting waste issues in your community.
          Together, we can build a cleaner, healthier environment for everyone.
        </p>
      </div>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              background: "#f3f4f6",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "2rem", color: "#1e40af", margin: "0" }}>
              {stats.totalReports}
            </h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>
              Total Reports
            </p>
          </div>
          <div
            style={{
              background: "#fef3c7",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "2rem", color: "#d97706", margin: "0" }}>
              {stats.pendingReports}
            </h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Pending</p>
          </div>
          <div
            style={{
              background: "#d1fae5",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "2rem", color: "#059669", margin: "0" }}>
              {stats.resolvedReports}
            </h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Resolved</p>
          </div>
          <div
            style={{
              background: "#e0e7ff",
              padding: "1.5rem",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "2rem", color: "#5b21b6", margin: "0" }}>
              {stats.totalUsers}
            </h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>
              Active Users
            </p>
          </div>
        </div>
      )}

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
            📍 Report Issues
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Spotted illegal dumping, overflowing bins, or other waste issues?
            Report them with photos and GPS location.
          </p>
          <Link
            to="/create-report"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Report Now
          </Link>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
            🗺️ View Map
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Explore waste reports across Lebanon on our interactive map. See
            what's happening in your area.
          </p>
          <Link
            to="/map"
            style={{
              background: "#059669",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            View Map
          </Link>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
            🏆 Earn Points
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Get rewarded for your contributions! Earn points for reporting
            issues and climb the leaderboard.
          </p>
          <Link
            to="/dashboard"
            style={{
              background: "#d97706",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
