import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api/api.js";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

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

export default Map;
