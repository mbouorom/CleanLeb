"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { reportsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const ReportDetail = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReport(id)
      setReport(response.data)
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error("Please login to vote")
      return
    }

    try {
      setVoting(true)
      await reportsAPI.voteOnReport(id, voteType)
      await fetchReport() // Refresh to get updated vote counts
      toast.success("Vote recorded!")
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to record vote")
    } finally {
      setVoting(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      setSubmittingComment(true)
      await reportsAPI.addComment(id, commentText)
      setCommentText("")
      await fetchReport() // Refresh to get new comment
      toast.success("Comment added!")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  {["municipal", "admin"].includes(user?.role) && (
  <div className="mt-4">
    <label className="block text-sm font-semibold mb-1">Update Status:</label>
    <select
      value={report.status}
      onChange={async (e) => {
        const newStatus = e.target.value
        try {
          await reportsAPI.updateReportStatus(report._id, newStatus)
          setReport({ ...report, status: newStatus })
          toast.success(`Report status updated to "${newStatus}"`)
        } catch (err) {
          console.error(err)
          toast.error("Failed to update status")
        }
      }}
      className="border px-3 py-2 rounded"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="resolved">Resolved</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
)}


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

  const getCategoryLabel = (category) => {
    const categories = {
      illegal_dumping: "Illegal Dumping",
      overflowing_bins: "Overflowing Bins",
      missed_collection: "Missed Collection",
      hazardous_waste: "Hazardous Waste",
      other: "Other",
    }
    return categories[category] || category
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const hasUserVoted = (voteType) => {
    if (!user || !report) return false
    const votes = voteType === "up" ? report.votes?.upvotes : report.votes?.downvotes
    return votes?.some((vote) => vote.user === user.id)
  }

  if (loading) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="text-center py-8">
          <div className="text-xl">Loading report...</div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container" style={{ margin: "2rem auto" }}>
        <div className="card text-center py-8">
          <h3 className="text-xl font-semibold mb-4">Report not found</h3>
          <Link to="/reports" className="btn btn-primary">
            Back to Reports
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <div className="mb-4">
        <Link to="/reports" className="text-blue-600 hover:underline">
          ← Back to Reports
        </Link>
      </div>

      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{report.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Reported by {report.reporter?.name}</span>
              <span>{formatDate(report.createdAt)}</span>
              <span>
                {report.location?.city && `${report.location.city}, `}
                {report.location?.region}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
              {report.status.replace("_", " ").toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {getCategoryLabel(report.category)}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{report.description}</p>
        </div>

        {/* Images */}
        {report.images && report.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url || "/placeholder.svg"}
                  alt={`Report ${index + 1}`}
                  className="w-full h-64 object-cover rounded border cursor-pointer hover:opacity-90"
                  onClick={() => window.open(image.url, "_blank")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {report.location && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <div className="text-gray-700">
              {report.location.address && <p>{report.location.address}</p>}
              <p>
                {report.location.city && `${report.location.city}, `}
                {report.location.region}
              </p>
              <p className="text-sm text-gray-500">
                Coordinates: {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* Voting */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote("up")}
              disabled={voting || !isAuthenticated}
              className={`btn ${hasUserVoted("up") ? "btn-success" : "btn-secondary"} ${voting ? "loading" : ""}`}
            >
              👍 {report.votes?.upvotes?.length || 0}
            </button>
            <button
              onClick={() => handleVote("down")}
              disabled={voting || !isAuthenticated}
              className={`btn ${hasUserVoted("down") ? "btn-danger" : "btn-secondary"} ${voting ? "loading" : ""}`}
            >
              👎 {report.votes?.downvotes?.length || 0}
            </button>
          </div>
          {!isAuthenticated && <span className="text-sm text-gray-500">Login to vote on this report</span>}
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Comments ({report.comments?.length || 0})</h3>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className={`btn btn-primary ${submittingComment ? "loading" : ""}`}
              >
                {submittingComment ? "Adding Comment..." : "Add Comment"}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 rounded">
              <p className="text-gray-600">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>{" "}
                to add comments
              </p>
            </div>
          )}

          {/* Comments List */}
          {report.comments && report.comments.length > 0 ? (
            <div className="space-y-4">
              {report.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{comment.user?.name}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportDetail
