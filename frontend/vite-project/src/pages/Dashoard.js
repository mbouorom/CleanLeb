"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { reportsAPI, usersAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const Dashboard = () => {
  const { user } = useAuth()
  const [userReports, setUserReports] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [reportsResponse, leaderboardResponse] = await Promise.all([
        reportsAPI.getReports({ reporter: user.id, limit: 5 }),
        usersAPI.getLeaderboard(),
      ])

      setUserReports(reportsResponse.data.reports)
      setLeaderboard(leaderboardResponse.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getUserRank = () => {
    const userIndex = leaderboard.findIndex((u) => u._id === user.id)
    return userIndex !== -1 ? userIndex + 1 : null
  }

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{user.points}</div>
          <div className="text-gray-600">Total Points</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{user.reportsCount}</div>
          <div className="text-gray-600">Reports Made</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{user.badges?.length || 0}</div>
          <div className="text-gray-600">Badges Earned</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">#{getUserRank() || "N/A"}</div>
          <div className="text-gray-600">Leaderboard Rank</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Recent Reports</h2>
            <Link to="/reports" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>

          {userReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't made any reports yet.</p>
              <Link to="/create-report" className="btn btn-primary">
                Create Your First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userReports.map((report) => (
                <div key={report._id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">
                      <Link to={`/reports/${report._id}`} className="text-blue-600 hover:underline">
                        {report.title}
                      </Link>
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{formatDate(report.createdAt)}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Community Leaderboard</h2>

          {leaderboard.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No leaderboard data available.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((leader, index) => (
                <div
                  key={leader._id}
                  className={`flex items-center justify-between p-3 rounded ${
                    leader._id === user.id ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {leader.name}
                        {leader._id === user.id && <span className="text-blue-600 ml-1">(You)</span>}
                      </div>
                      <div className="text-sm text-gray-600">{leader.reportsCount} reports</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{leader.points} pts</div>
                    <div className="text-sm text-gray-600">{leader.badges?.length || 0} badges</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-sm opacity-90">{badge.description}</p>
                <p className="text-xs opacity-75 mt-2">Earned {formatDate(badge.earnedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/create-report" className="btn btn-primary text-center">
            Report New Issue
          </Link>
          <Link to="/map" className="btn btn-secondary text-center">
            View Map
          </Link>
          <Link to="/education" className="btn btn-secondary text-center">
            Take Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
