"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ReportsProvider } from "./contexts/ReportsContext";
// FIXED: Import your configured API instance instead of plain axios
import api from "./api/api.js";
import Quiz from './pages/Quiz';
import Education from './pages/Education'; 

//Maps integration
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AuthProvider initialization - token exists:", !!token);

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const response = await api.get("/users/profile");
      console.log("User profile fetched:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login...");
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      console.log("Login successful:", user);
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Attempting registration...");
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { token, user } = response.data;

      console.log("Registration successful:", user);
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logout called");
    try {
      // Clear token and headers
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      // Clear user state
      setUser(null);

      console.log("Logout completed successfully");

      // Force redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    // Add a method to refresh user data
    refreshUser: fetchUserProfile,
  };

  console.log("AuthProvider render - user:", user, "loading:", loading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{ background: "#2563eb", color: "white", padding: "1rem" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          🇱🇧 CleanLeb
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/reports"
            style={{ color: "white", textDecoration: "none" }}
          >
            Reports
          </Link>
          <Link to="/map" style={{ color: "white", textDecoration: "none" }}>
            Map
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{ color: "white", textDecoration: "none" }}
              >
                Dashboard
              </Link>
              <Link
                to="/create-report"
                style={{ color: "white", textDecoration: "none" }}
              >
                Report Issue
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Admin
                </Link>
              )}
              <span style={{ color: "#93c5fd" }}>
                👋 {user.name} ({user.points} pts)
              </span>
              <button
                onClick={logout}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: "white", textDecoration: "none" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{ color: "white", textDecoration: "none" }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

// Home Page Component
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

// Login Component
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "2rem auto" }}>
      <h2
        style={{ textAlign: "center", color: "#1e40af", marginBottom: "2rem" }}
      >
        Login
      </h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.75rem",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#2563eb" }}>
          Register here
        </Link>
      </p>
    </div>
  );
};
//quiz button


// Register Component
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "2rem auto" }}>
      <h2
        style={{ textAlign: "center", color: "#1e40af", marginBottom: "2rem" }}
      >
        Register
      </h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.75rem",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#2563eb" }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

// Dashboard Component
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
        Welcome back, {user.name}! 👋
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
            🏆 Leaderboard
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
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
            📊 Your Stats
          </h3>
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
          📍 Recent Reports
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
                    👍 {report.votes?.upvotes?.length || 0}
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

// Reports Component
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", status: "" });

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.status) params.append("status", filter.status);

      const response = await api.get(`/reports?${params}`);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId) => {
    try {
      await api.put(`/reports/${reportId}/vote`);
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Helper function to safely get reporter name
  const getReporterName = (report) => {
    // Handle both 'reporter' and 'reportedBy' fields
    if (report.reporter && typeof report.reporter === "object") {
      return report.reporter.name || "Anonymous";
    }
    if (report.reportedBy && typeof report.reportedBy === "object") {
      return report.reportedBy.name || "Anonymous";
    }
    return "Anonymous";
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Waste Reports</h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          style={{
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        >
          <option value="">All Categories</option>
          <option value="illegal_dumping">Illegal Dumping</option>
          <option value="overflowing_bins">Overflowing Bins</option>
          <option value="missed_collection">Missed Collection</option>
          <option value="hazardous_waste">Hazardous Waste</option>
          <option value="littering">Littering</option>
          <option value="recycling">Recycling Issue</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading reports...
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {reports.map((report) => (
            <div
              key={report._id}
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>
                    {report.title || "Untitled Report"}
                  </h3>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280" }}>
                    {report.description || "No description available"}
                  </p>
                  <p
                    style={{
                      margin: "0",
                      color: "#9ca3af",
                      fontSize: "0.9rem",
                    }}
                  >
                    By {getReporterName(report)} •{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
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
                    {(report.status || "pending").replace("_", " ")}
                  </span>
                  <button
                    onClick={() => handleVote(report._id)}
                    style={{
                      background: "none",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      padding: "0.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    👍 {report.votes?.upvotes?.length || 0}
                  </button>
                </div>
              </div>

              {report.images && report.images.length > 0 && (
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {report.images.map((image, index) => {
                    // Handle both string URLs and objects with url property
                    const imageUrl =
                      typeof image === "string" ? image : image?.url;
                    const fullImageUrl = imageUrl
                      ? `http://localhost:5000${imageUrl}`
                      : null;

                    return fullImageUrl ? (
                      <img
                        key={index}
                        src={fullImageUrl}
                        alt={`Report ${index + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none"; // Hide broken images instead of showing placeholder
                        }}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Report Component
const CreateReport = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      images.forEach((image) => {
        submitData.append("images", image);
      });

      // FIXED: Use the configured API instance instead of plain axios
      await api.post("/reports", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/reports");
      }, 2000);
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Error creating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "2rem auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#d1fae5",
            color: "#059669",
            padding: "2rem",
            borderRadius: "8px",
          }}
        >
          <h2>✅ Report Submitted Successfully!</h2>
          <p>Thank you for helping keep Lebanon clean. You earned 10 points!</p>
          <p>Redirecting to reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>
        Report Waste Issue
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Issue Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />

        <textarea
          placeholder="Describe the issue in detail..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows="4"
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />

        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        >
          <option value="">Select Category</option>
          <option value="illegal_dumping">Illegal Dumping</option>
          <option value="overflowing_bins">Overflowing Bins</option>
          <option value="littering">Littering</option>
          <option value="recycling">Recycling Issue</option>
          <option value="other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Address (optional)"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({ ...formData, latitude: e.target.value })
            }
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({ ...formData, longitude: e.target.value })
            }
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#374151",
            }}
          >
            Upload Photos (optional, max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "1rem",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontSize: "1rem",
          }}
        >
          {loading ? "Submitting Report..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

// Map Component (Simplified without actual map library)
const Map = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
  });
  const [showCreateMode, setShowCreateMode] = useState(false);

  // Lebanon center coordinates
  const lebanonCenter = [33.8547, 35.8623];

  // Custom marker icon function
  const createCustomIcon = (status) => {
    const colors = {
      pending: "#f59e0b",
      in_progress: "#3b82f6",
      resolved: "#10b981",
      rejected: "#ef4444",
    };

    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: ${colors[status] || colors.pending};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Component to handle map clicks
  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        onMapClick(e.latlng);
      },
    });
    return null;
  };

  const categories = [
    { value: "illegal_dumping", label: "Illegal Dumping" },
    { value: "overflowing_bins", label: "Overflowing Bins" },
    { value: "missed_collection", label: "Missed Collection" },
    { value: "hazardous_waste", label: "Hazardous Waste" },
    { value: "littering", label: "Littering" },
    { value: "recycling", label: "Recycling Issue" },
    { value: "other", label: "Other" },
  ];

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ];

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      params.append("limit", "1000");

      const response = await api.get(`/reports?${params}`);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleMapClick = (latlng) => {
    if (!showCreateMode) return;

    if (!user) {
      alert("Please login to create reports");
      return;
    }

    // Navigate to create report with pre-filled location
    navigate("/create-report", {
      state: {
        latitude: latlng.lat,
        longitude: latlng.lng,
      },
    });
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "in_progress":
        return "#3b82f6";
      case "resolved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Helper function to get reporter name safely
  const getReporterName = (report) => {
    if (report.reporter && typeof report.reporter === "object") {
      return report.reporter.name || "Anonymous";
    }
    if (report.reportedBy && typeof report.reportedBy === "object") {
      return report.reportedBy.name || "Anonymous";
    }
    return "Anonymous";
  };

  // Helper function to get coordinates safely
  const getCoordinates = (report) => {
    if (
      report.location?.coordinates &&
      Array.isArray(report.location.coordinates)
    ) {
      return [report.location.coordinates[1], report.location.coordinates[0]];
    }
    if (report.location?.latitude && report.location?.longitude) {
      return [report.location.latitude, report.location.longitude];
    }
    return null;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1 style={{ color: "#1e40af", margin: "0" }}>Waste Reports Map</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user && (
            <button
              onClick={() => setShowCreateMode(!showCreateMode)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: showCreateMode ? "#10b981" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showCreateMode ? "Exit Create Mode" : "Create Mode"}
            </button>
          )}
          <Link
            to="/create-report"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Report Issue
          </Link>
        </div>
      </div>

      {showCreateMode && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#dbeafe",
            border: "1px solid #93c5fd",
            borderRadius: "8px",
            marginBottom: "2rem",
            color: "#1e40af",
          }}
        >
          <strong>Create Mode Active:</strong> Click anywhere on the map to
          create a new report at that location.
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
          Filter Reports
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              onClick={() => setFilters({ status: "", category: "" })}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <div style={{ height: "600px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              Loading map...
            </div>
          ) : (
            <MapContainer
              center={lebanonCenter}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onMapClick={handleMapClick} />

              {reports.map((report) => {
                const coordinates = getCoordinates(report);
                if (!coordinates) return null;

                return (
                  <Marker
                    key={report._id}
                    position={coordinates}
                    icon={createCustomIcon(report.status)}
                  >
                    <Popup maxWidth={300}>
                      <div style={{ padding: "0.5rem" }}>
                        <h3
                          style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}
                        >
                          {report.title}
                        </h3>

                        <div style={{ marginBottom: "0.5rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor: getStatusColor(report.status),
                              color: "white",
                              marginRight: "0.5rem",
                            }}
                          >
                            {report.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span
                            style={{ fontSize: "0.8rem", color: "#6b7280" }}
                          >
                            {getCategoryLabel(report.category)}
                          </span>
                        </div>

                        <p
                          style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}
                        >
                          {report.description?.substring(0, 100)}
                          {report.description?.length > 100 && "..."}
                        </p>

                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          <p style={{ margin: "0" }}>
                            By {getReporterName(report)}
                          </p>
                          <p style={{ margin: "0" }}>
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#2563eb" }}
          >
            {reports.length}
          </div>
          <div style={{ color: "#6b7280" }}>Total Reports</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}
          >
            {reports.filter((r) => r.status === "pending").length}
          </div>
          <div style={{ color: "#6b7280" }}>Pending</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}
          >
            {reports.filter((r) => r.status === "in_progress").length}
          </div>
          <div style={{ color: "#6b7280" }}>In Progress</div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}
          >
            {reports.filter((r) => r.status === "resolved").length}
          </div>
          <div style={{ color: "#6b7280" }}>Resolved</div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/reports");
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateReport = async (reportId, status, priority) => {
    try {
      await api.put(`/admin/reports/${reportId}`, { status, priority });
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>
        Admin Dashboard
      </h1>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
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
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Users</p>
          </div>
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>
          Manage Reports
        </h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {reports.map((report) => (
            <div
              key={report._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
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
                    {report.description}
                  </p>
                  <p
                    style={{
                      margin: "0",
                      color: "#9ca3af",
                      fontSize: "0.8rem",
                    }}
                  >
                    By {report.reportedBy.name} •{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <select
                    value={report.status}
                    onChange={(e) =>
                      updateReport(report._id, e.target.value, report.priority)
                    }
                    style={{
                      padding: "0.25rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={report.priority}
                    onChange={(e) =>
                      updateReport(report._id, report.status, e.target.value)
                    }
                    style={{
                      padding: "0.25rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {report.images && report.images.length > 0 && (
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {report.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Report ${index + 1}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/map" element={<Map />} />
              <Route path="/education" element={<Education />} />
              <Route path="/quiz/:id" element={<Quiz />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-report"
                element={
                  <ProtectedRoute>
                    <CreateReport />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
