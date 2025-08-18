"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { usersAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    region: "",
  })
  const [saving, setSaving] = useState(false)

  const regions = ["Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon", "Bekaa", "Nabatieh"]

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        city: user.location?.city || "",
        region: user.location?.region || "",
      })
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getProfile()
      setProfileData(response.data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updateData = {
        name: formData.name,
        location: {
          city: formData.city,
          region: formData.region,
        },
      }

      const response = await usersAPI.updateProfile(updateData)
      updateUser(response.data)
      setEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input text-center"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input text-center"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="form-select text-center"
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`btn btn-primary flex-1 ${saving ? "loading" : ""}`}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
                  <p className="text-gray-600 mb-4">
                    {user?.location?.city && `${user.location.city}, `}
                    {user?.location?.region}
                  </p>
                  <button onClick={() => setEditing(true)} className="btn btn-secondary">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user?.points || 0}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user?.reportsCount || 0}</div>
                <div className="text-sm text-gray-600">Reports</div>
              </div>
            </div>

            {/* Role Badge */}
            <div className="text-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user?.role === "citizen" ? "Community Member" : user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Badges */}
          {user?.badges && user.badges.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Badges ({user.badges.length})</h3>
              <div className="space-y-3">
                {user.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-semibold text-yellow-800">{badge.name}</div>
                      <div className="text-sm text-yellow-700">{badge.description}</div>
                      <div className="text-xs text-yellow-600">Earned {formatDate(badge.earnedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Recent Reports</h3>
              <Link to="/create-report" className="btn btn-primary">
                Create New Report
              </Link>
            </div>

            {profileData?.recentReports && profileData.recentReports.length > 0 ? (
              <div className="space-y-4">
                {profileData.recentReports.map((report) => (
                  <div key={report._id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        <Link to={`/reports/${report._id}`} className="text-blue-600 hover:underline">
                          {report.title}
                        </Link>
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(report.createdAt)}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>👍 {report.votes?.upvotes?.length || 0}</span>
                      <span>👎 {report.votes?.downvotes?.length || 0}</span>
                      <span>💬 {report.comments?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-semibold mb-2">No reports yet</h4>
                <p className="text-gray-600 mb-4">
                  Start making a difference by reporting waste issues in your community.
                </p>
                <Link to="/create-report" className="btn btn-primary">
                  Create Your First Report
                </Link>
              </div>
            )}
          </div>

          {/* Achievement Progress */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-6">Achievement Progress</h3>

            <div className="space-y-6">
              {/* Reporter Badge Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Reporter Badge</span>
                  <span className="text-sm text-gray-600">{user?.reportsCount || 0}/5 reports</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((user?.reportsCount || 0) / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Create 5 reports to earn the Reporter badge</p>
              </div>

              {/* Points Milestone */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Point Collector</span>
                  <span className="text-sm text-gray-600">{user?.points || 0}/100 points</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((user?.points || 0) / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Earn 100 points to unlock special features</p>
              </div>

              {/* Community Helper */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Community Helper</span>
                  <span className="text-sm text-gray-600">0/10 votes cast</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Vote on 10 reports to earn the Community Helper badge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
