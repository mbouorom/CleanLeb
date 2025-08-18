"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Link, useNavigate } from "react-router-dom"
import L from "leaflet"
import { reportsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons for different statuses
const createCustomIcon = (status) => {
  const colors = {
    pending: "#f59e0b", // yellow
    in_progress: "#3b82f6", // blue
    resolved: "#10b981", // green
    rejected: "#ef4444", // red
  }

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
  })
}

// Component to handle map clicks for creating new reports
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const Map = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    category: "",
  })
  const [showCreateMode, setShowCreateMode] = useState(false)

  // Lebanon center coordinates
  const lebanonCenter = [33.8547, 35.8623]

  const categories = [
    { value: "illegal_dumping", label: "Illegal Dumping" },
    { value: "overflowing_bins", label: "Overflowing Bins" },
    { value: "missed_collection", label: "Missed Collection" },
    { value: "hazardous_waste", label: "Hazardous Waste" },
    { value: "other", label: "Other" },
  ]

  const statuses = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ]

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReports({ ...filters, limit: 1000 }) // Get all reports for map
      setReports(response.data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  const handleMapClick = (latlng) => {
    if (!showCreateMode) return

    if (!isAuthenticated) {
      toast.error("Please login to create reports")
      return
    }

    // Navigate to create report with pre-filled location
    navigate("/create-report", {
      state: {
        latitude: latlng.lat,
        longitude: latlng.lng,
      },
    })
  }

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "in_progress":
        return "#3b82f6"
      case "resolved":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Waste Reports Map</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateMode(!showCreateMode)}
              className={`btn ${showCreateMode ? "btn-success" : "btn-secondary"}`}
            >
              {showCreateMode ? "Exit Create Mode" : "Create Mode"}
            </button>
          )}
          <Link to="/create-report" className="btn btn-primary">
            Report Issue
          </Link>
        </div>
      </div>

      {showCreateMode && (
        <div className="card mb-4 bg-blue-50 border-blue-200">
          <p className="text-blue-800">
            <strong>Create Mode Active:</strong> Click anywhere on the map to create a new report at that location.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={() => setFilters({ status: "", category: "" })} className="btn btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Map Legend</h3>
        <div className="flex flex-wrap gap-4">
          {statuses.map((status) => (
            <div key={status.value} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{
                  backgroundColor: getStatusColor(status.value),
                  boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              ></div>
              <span className="text-sm">{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="card">
        <div className="map-container" style={{ height: "600px" }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-xl">Loading map...</div>
            </div>
          ) : (
            <MapContainer
              center={lebanonCenter}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Map click handler for create mode */}
              <MapClickHandler onMapClick={handleMapClick} />

              {/* Report markers */}
              {reports.map((report) => (
                <Marker
                  key={report._id}
                  position={[report.location.coordinates[1], report.location.coordinates[0]]}
                  icon={createCustomIcon(report.status)}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2">
                      <h3 className="font-semibold text-lg mb-2">
                        <Link to={`/reports/${report._id}`} className="text-blue-600 hover:underline">
                          {report.title}
                        </Link>
                      </h3>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getStatusColor(report.status) }}
                          >
                            {report.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {getCategoryLabel(report.category)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">{report.description}</p>

                      {report.images && report.images.length > 0 && (
                        <div className="mb-3">
                          <img
                            src={report.images[0].url || "/placeholder.svg"}
                            alt="Report"
                            className="w-full h-32 object-cover rounded border"
                          />
                          {report.images.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">+{report.images.length - 1} more images</p>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mb-3">
                        <p>Reported by {report.reporter?.name}</p>
                        <p>{formatDate(report.createdAt)}</p>
                        {report.location?.address && <p>{report.location.address}</p>}
                        {report.location?.city && (
                          <p>
                            {report.location.city}
                            {report.location.region && `, ${report.location.region}`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <span>👍 {report.votes?.upvotes?.length || 0}</span>
                        <span>👎 {report.votes?.downvotes?.length || 0}</span>
                        <span>💬 {report.comments?.length || 0}</span>
                      </div>

                      <Link to={`/reports/${report._id}`} className="btn btn-primary w-full text-sm">
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">{reports.length}</div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {reports.filter((r) => r.status === "pending").length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {reports.filter((r) => r.status === "in_progress").length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {reports.filter((r) => r.status === "resolved").length}
          </div>
          <div className="text-gray-600">Resolved</div>
        </div>
      </div>
    </div>
  )
}

export default Map
