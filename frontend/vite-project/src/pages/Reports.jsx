import React, { useState, useEffect } from "react";
import api from "../api/api.js";

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
                    {report.votes?.upvotes?.length || 0}
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

export default Reports;
