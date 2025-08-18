"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { adminAPI, reportsAPI, usersAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports()
    } else if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab, filters])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getStats()
      setStats(response.data.stats)
      setRecentReports(response.data.recentReports)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getReports({ ...filters, limit: 50 })
      setReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getLeaderboard()
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    }
  }

  const handleStatusUpdate = async (reportId, status, priority) => {
    try {
      await adminAPI.updateReportStatus(reportId, status, priority)
      toast.success("Report status updated successfully!")
      if (activeTab === "reports") {
        fetchReports()
      } else {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error updating report status:", error)
      toast.error("Failed to update report status")
    }
  }

  const handleAssignReport = async (reportId, assignedTo) => {
    try {
      await adminAPI.assignReport(reportId, assignedTo)
      toast.success("Report assigned successfully!")
      if (activeTab === "reports") {
        fetchReports()
      } else {
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error assigning report:", error)
      toast.error("Failed to assign report")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {user?.role === "admin" ? "System Admin" : "Municipal Official"}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "overview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "reports" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manage Reports
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "users" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "content" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Content Management
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalReports || 0}</div>
              <div className="text-gray-600">Total Reports</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats?.pendingReports || 0}</div>
              <div className="text-gray-600">Pending Reports</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats?.resolvedReports || 0}</div>
              <div className="text-gray-600">Resolved Reports</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats?.totalUsers || 0}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Reports</h2>
              <button onClick={() => setActiveTab("reports")} className="text-blue-600 hover:underline">
                View All Reports
              </button>
            </div>

            {recentReports.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No recent reports</p>
            ) : (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report._id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">
                          <Link to={`/reports/${report._id}`} className="text-blue-600 hover:underline">
                            {report.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">
                          By {report.reporter?.name} • {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.replace("_", " ").toUpperCase()}
                        </span>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report._id, e.target.value, report.priority)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Management Tab */}
      {activeTab === "reports" && (
        <div>
          {/* Filters */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: "", priority: "", assignedTo: "" })}
                  className="btn btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">All Reports ({reports.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Report</th>
                    <th className="text-left py-3 px-4">Reporter</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Priority</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <Link to={`/reports/${report._id}`} className="font-medium text-blue-600 hover:underline">
                            {report.title}
                          </Link>
                          <p className="text-sm text-gray-600 line-clamp-1">{report.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{report.reporter?.name}</div>
                          <div className="text-gray-600">
                            {report.location?.city && `${report.location.city}, `}
                            {report.location?.region}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report._id, e.target.value, report.priority)}
                          className={`text-xs border rounded px-2 py-1 ${getStatusColor(report.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={report.priority}
                          onChange={(e) => handleStatusUpdate(report._id, report.status, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 ${getPriorityColor(report.priority)}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(report.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link to={`/reports/${report._id}`} className="btn btn-secondary text-xs">
                            View
                          </Link>
                          {report.status !== "resolved" && (
                            <button
                              onClick={() => handleStatusUpdate(report._id, "resolved", report.priority)}
                              className="btn btn-success text-xs"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Points</th>
                  <th className="text-left py-3 px-4">Reports</th>
                  <th className="text-left py-3 px-4">Badges</th>
                  <th className="text-left py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">Rank #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-600">{user.points}</span>
                    </td>
                    <td className="py-3 px-4">{user.reportsCount}</td>
                    <td className="py-3 px-4">{user.badges?.length || 0}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {user.role || "citizen"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Management Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quiz Management</h3>
            <p className="text-gray-600 mb-4">Create and manage educational quizzes for the community.</p>
            <div className="flex gap-4">
              <button className="btn btn-primary">Create New Quiz</button>
              <button className="btn btn-secondary">Manage Existing Quizzes</button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Educational Content</h3>
            <p className="text-gray-600 mb-4">Manage tips, guides, and educational materials.</p>
            <div className="flex gap-4">
              <button className="btn btn-primary">Add New Tip</button>
              <button className="btn btn-secondary">Manage Content</button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system-wide settings and preferences.</p>
            <div className="flex gap-4">
              <button className="btn btn-secondary">General Settings</button>
              <button className="btn btn-secondary">Notification Settings</button>
              <button className="btn btn-secondary">Badge Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
