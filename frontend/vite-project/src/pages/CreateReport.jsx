import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const CreateReport = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      images.forEach((image) => {
        submitData.append("images", image);
      });

      await api.post("/reports", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/reports");
      }, 2000);
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Error creating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "2rem auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#d1fae5",
            color: "#059669",
            padding: "2rem",
            borderRadius: "8px",
          }}
        >
          <h2>Report Submitted Successfully!</h2>
          <p>Thank you for helping keep Lebanon clean. You earned 10 points!</p>
          <p>Redirecting to reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#1e40af", marginBottom: "2rem" }}>
        Report Waste Issue
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Issue Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />

        <textarea
          placeholder="Describe the issue in detail..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows="4"
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />

        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
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
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          style={{
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({ ...formData, latitude: e.target.value })
            }
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({ ...formData, longitude: e.target.value })
            }
            required
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "#374151",
            }}
          >
            Upload Photos (optional, max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              width: "100%",
            }}
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
  );
};

export default CreateReport;
