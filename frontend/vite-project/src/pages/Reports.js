"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI } from "../services/api";
import { toast } from "react-toastify";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    city: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const categories = [
    { value: "illegal_dumping", label: "Illegal Dumping" },
    { value: "overflowing_bins", label: "Overflowing Bins" },
    { value: "missed_collection", label: "Missed Collection" },
    { value: "hazardous_waste", label: "Hazardous Waste" },
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
      const response = await reportsAPI.getReports(filters);
      // Ensure reports is always an array and has proper structure
      const reportsData = response?.data?.reports || [];
      setReports(reportsData);
      setPagination({
        currentPage: response?.data?.currentPage || 1,
        totalPages: response?.data?.totalPages || 1,
        total: response?.data?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      // Set empty array on error to prevent rendering issues
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1, // Reset to first page when filtering
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to safely get reporter name
  const getReporterName = (reporter) => {
    return reporter?.name || "Anonymous";
  };

  // Helper function to safely get location string
  const getLocationString = (location) => {
    if (!location) return "";
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    return parts.join(", ");
  };

  return (
    <div className="container" style={{ margin: "2rem auto" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Waste Reports</h1>
        <Link to="/create-report" className="btn btn-primary">
          Report New Issue
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
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
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              className="form-input"
              value={filters.city}
              onChange={handleFilterChange}
              placeholder="Enter city name"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({ status: "", category: "", city: "", page: 1 })
              }
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {reports.length} of {pagination.total} reports
        </p>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-xl">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-8">
          <h3 className="text-xl font-semibold mb-4">No reports found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or be the first to report an issue!
          </p>
          <Link to="/create-report" className="btn btn-primary">
            Create First Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <div key={report._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    <Link
                      to={`/reports/${report._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {report.title || "Untitled Report"}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>By {getReporterName(report.reporter)}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    {getLocationString(report.location) && (
                      <span>{getLocationString(report.location)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {(report.status || "pending")
                      .replace("_", " ")
                      .toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {getCategoryLabel(report.category)}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">
                {report.description || "No description available"}
              </p>

              {report.images && report.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {report.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image?.url || "/placeholder.svg"}
                      alt={`Report ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  ))}
                  {report.images.length > 3 && (
                    <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-600">
                      +{report.images.length - 3} more
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👍 {report.votes?.upvotes?.length || 0}</span>
                  <span>👎 {report.votes?.downvotes?.length || 0}</span>
                  <span>💬 {report.comments?.length || 0} comments</span>
                </div>
                <Link
                  to={`/reports/${report._id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn ${
                  page === pagination.currentPage
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;
