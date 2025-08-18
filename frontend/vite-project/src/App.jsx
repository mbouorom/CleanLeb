"use client"
import { useState, useEffect, createContext, useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"
import axios from "axios"

// Create Auth Context
const AuthContext = createContext()

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      // Verify token and get user info
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/users/profile")
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await axios.post("/api/login", { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(user)

    return response.data
  }

  const register = async (name, email, password) => {
    const response = await axios.post("/api/register", { name, email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(user)

    return response.data
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

// Header Component
const Header = () => {
  const { user, logout } = useAuth()

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
        <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold" }}>
          🇱🇧 Lebanon Clean
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/reports" style={{ color: "white", textDecoration: "none" }}>
            Reports
          </Link>
          <Link to="/map" style={{ color: "white", textDecoration: "none" }}>
            Map
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link to="/create-report" style={{ color: "white", textDecoration: "none" }}>
                Report Issue
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
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
              <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
                Login
              </Link>
              <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  return user && user.role === "admin" ? children : <Navigate to="/" />
}

// Home Page Component
const Home = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#1e40af", marginBottom: "1rem" }}>🇱🇧 Lebanon Waste Management</h1>
        <p style={{ fontSize: "1.2rem", color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
          Help keep Lebanon clean by reporting waste issues in your community. Together, we can build a cleaner,
          healthier environment for everyone.
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
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#1e40af", margin: "0" }}>{stats.totalReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Total Reports</p>
          </div>
          <div style={{ background: "#fef3c7", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#d97706", margin: "0" }}>{stats.pendingReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Pending</p>
          </div>
          <div style={{ background: "#d1fae5", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#059669", margin: "0" }}>{stats.resolvedReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Resolved</p>
          </div>
          <div style={{ background: "#e0e7ff", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#5b21b6", margin: "0" }}>{stats.totalUsers}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Active Users</p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <div
          style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>📍 Report Issues</h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Spotted illegal dumping, overflowing bins, or other waste issues? Report them with photos and GPS location.
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
          style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>🗺️ View Map</h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Explore waste reports across Lebanon on our interactive map. See what's happening in your area.
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
          style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>🏆 Earn Points</h3>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Get rewarded for your contributions! Earn points for reporting issues and climb the leaderboard.
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
  )
}

// Login Component
const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", color: "#1e40af", marginBottom: "2rem" }}>Login</h2>

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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
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
  )
}

// Register Component
const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await register(name, email, password)
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", color: "#1e40af", marginBottom: "2rem" }}>Register</h2>

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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
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
  )
}

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [userReports, setUserReports] = useState([])

  useEffect(() => {
    fetchLeaderboard()
    fetchUserReports()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("/api/users/leaderboard")
      setLeaderboard(response.data)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    }
  }

  const fetchUserReports = async () => {
    try {
      const response = await axios.get("/api/reports?limit=5")
      setUserReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Welcome back, {user.name}! 👋</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <div
          style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>🏆 Leaderboard</h3>
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: index < leaderboard.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                </span>
                {user.name}
              </span>
              <span style={{ fontWeight: "bold", color: "#059669" }}>{user.points} pts</span>
            </div>
          ))}
        </div>

        <div
          style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>📊 Your Stats</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Points:</span>
              <span style={{ fontWeight: "bold", color: "#059669" }}>{user.points}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Badges Earned:</span>
              <span style={{ fontWeight: "bold", color: "#d97706" }}>{user.badges?.length || 0}</span>
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
        <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>📍 Recent Reports</h3>
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
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{report.title}</h4>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280", fontSize: "0.9rem" }}>
                    {report.category.replace("_", " ")} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
                  <span style={{ color: "#6b7280" }}>👍 {report.votes}</span>
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
  )
}

// Reports Component
const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ category: "", status: "" })

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.category) params.append("category", filter.category)
      if (filter.status) params.append("status", filter.status)

      const response = await axios.get(`/api/reports?${params}`)
      setReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (reportId) => {
    try {
      await axios.put(`/api/reports/${reportId}/vote`)
      fetchReports() // Refresh reports
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Waste Reports</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        >
          <option value="">All Categories</option>
          <option value="illegal_dumping">Illegal Dumping</option>
          <option value="overflowing_bins">Overflowing Bins</option>
          <option value="littering">Littering</option>
          <option value="recycling">Recycling</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading reports...</div>
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
                style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{report.title}</h3>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280" }}>{report.description}</p>
                  <p style={{ margin: "0", color: "#9ca3af", fontSize: "0.9rem" }}>
                    By {report.reportedBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
                    👍 {report.votes}
                  </button>
                </div>
              </div>

              {report.images && report.images.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {report.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Report ${index + 1}`}
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Create Report Component
const CreateReport = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    address: "",
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key])
      })

      images.forEach((image) => {
        submitData.append("images", image)
      })

      await axios.post("/api/reports", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSuccess(true)
      setTimeout(() => {
        navigate("/reports")
      }, 2000)
    } catch (error) {
      console.error("Error creating report:", error)
      alert("Error creating report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: "2rem", maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
        <div style={{ background: "#d1fae5", color: "#059669", padding: "2rem", borderRadius: "8px" }}>
          <h2>✅ Report Submitted Successfully!</h2>
          <p>Thank you for helping keep Lebanon clean. You earned 10 points!</p>
          <p>Redirecting to reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Report Waste Issue</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Issue Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        />

        <textarea
          placeholder="Describe the issue in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows="4"
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", resize: "vertical" }}
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
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
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151" }}>
            Upload Photos (optional, max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            style={{ padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%" }}
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
  )
}

// Map Component (Simplified without actual map library)
const Map = () => {
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/reports")
      setReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Waste Reports Map</h1>

      <div
        style={{
          background: "#f3f4f6",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ color: "#6b7280", margin: "0 0 1rem 0" }}>🗺️ Interactive Map</h3>
        <p style={{ color: "#6b7280", margin: "0" }}>
          Map visualization would be displayed here using Leaflet or Google Maps. For this simplified version, reports
          are listed below.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {reports.map((report) => (
          <div
            key={report._id}
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{report.title}</h4>
            <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280", fontSize: "0.9rem" }}>
              📍 {report.location.address || `${report.location.latitude}, ${report.location.longitude}`}
            </p>
            <p style={{ margin: "0", color: "#9ca3af", fontSize: "0.8rem" }}>
              {report.category.replace("_", " ")} • {report.status.replace("_", " ")} • 👍 {report.votes}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Admin Dashboard Component
const AdminDashboard = () => {
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchReports()
    fetchStats()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/reports")
      setReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const updateReport = async (reportId, status, priority) => {
    try {
      await axios.put(`/api/admin/reports/${reportId}`, { status, priority })
      fetchReports() // Refresh reports
    } catch (error) {
      console.error("Error updating report:", error)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>Admin Dashboard</h1>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ background: "#f3f4f6", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#1e40af", margin: "0" }}>{stats.totalReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Total Reports</p>
          </div>
          <div style={{ background: "#fef3c7", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#d97706", margin: "0" }}>{stats.pendingReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Pending</p>
          </div>
          <div style={{ background: "#d1fae5", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#059669", margin: "0" }}>{stats.resolvedReports}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Resolved</p>
          </div>
          <div style={{ background: "#e0e7ff", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
            <h3 style={{ fontSize: "2rem", color: "#5b21b6", margin: "0" }}>{stats.totalUsers}</h3>
            <p style={{ color: "#6b7280", margin: "0.5rem 0 0 0" }}>Users</p>
          </div>
        </div>
      )}

      <div
        style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <h3 style={{ color: "#1e40af", marginBottom: "1rem" }}>Manage Reports</h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {reports.map((report) => (
            <div key={report._id} style={{ border: "1px solid #e5e7eb", borderRadius: "4px", padding: "1rem" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}
              >
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#1f2937" }}>{report.title}</h4>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#6b7280", fontSize: "0.9rem" }}>{report.description}</p>
                  <p style={{ margin: "0", color: "#9ca3af", fontSize: "0.8rem" }}>
                    By {report.reportedBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <select
                    value={report.status}
                    onChange={(e) => updateReport(report._id, e.target.value, report.priority)}
                    style={{ padding: "0.25rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={report.priority}
                    onChange={(e) => updateReport(report._id, report.status, e.target.value)}
                    style={{ padding: "0.25rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem" }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {report.images && report.images.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {report.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Report ${index + 1}`}
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  )
}

export default App
