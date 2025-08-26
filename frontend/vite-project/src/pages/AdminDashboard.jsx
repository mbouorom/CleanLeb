import React, { useState, useEffect } from "react";
import api from "../api/api.js";

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

export default AdminDashboard;
