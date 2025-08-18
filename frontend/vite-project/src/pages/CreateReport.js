"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { reportsAPI } from "../services/api"
import { toast } from "react-toastify"

const CreateReport = () => {
  const navigate = useNavigate()
  const locationState = useLocation().state

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    city: "",
    region: "",
  })
  const [images, setImages] = useState([])
  const [location, setLocation] = useState(
    locationState?.latitude && locationState?.longitude
      ? {
          latitude: locationState.latitude,
          longitude: locationState.longitude,
        }
      : null,
  )
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  const categories = [
    { value: "illegal_dumping", label: "Illegal Dumping" },
    { value: "overflowing_bins", label: "Overflowing Bins" },
    { value: "missed_collection", label: "Missed Collection" },
    { value: "hazardous_waste", label: "Hazardous Waste" },
    { value: "other", label: "Other" },
  ]

  const regions = ["Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon", "Bekaa", "Nabatieh"]

  useEffect(() => {
    // If location wasn't provided from map, try to get current location
    if (!location) {
      getCurrentLocation()
    }
  }, [location])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGettingLocation(false)
        toast.success("Location detected successfully!")
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Could not get your location. Please enter address manually.")
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    setImages([...images, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!location) {
      toast.error("Location is required. Please allow location access or enter address manually.")
      return
    }

    if (images.length === 0) {
      toast.error("At least one image is required")
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("description", formData.description)
      submitData.append("category", formData.category)
      submitData.append("latitude", location.latitude)
      submitData.append("longitude", location.longitude)
      submitData.append("address", formData.address)
      submitData.append("city", formData.city)
      submitData.append("region", formData.region)

      images.forEach((image) => {
        submitData.append("images", image)
      })

      const response = await reportsAPI.createReport(submitData)
      toast.success("Report submitted successfully!")
      navigate(`/reports/${response.data._id}`)
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error(error.response?.data?.message || "Failed to create report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Report a Waste Issue</h2>

        {locationState?.latitude && locationState?.longitude && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 text-sm">
              ✓ Location selected from map: {locationState.latitude.toFixed(4)}, {locationState.longitude.toFixed(4)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Issue Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed description of the waste issue..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Photos * (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
              disabled={images.length >= 5}
            />
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{images.length} image(s) selected:</p>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                className={`btn btn-secondary ${gettingLocation ? "loading" : ""}`}
                disabled={gettingLocation}
              >
                {gettingLocation ? "Getting Location..." : "Use Current Location"}
              </button>
              {location && (
                <span className="text-sm text-green-600 flex items-center">
                  ✓ Location detected ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address or landmark"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Beirut, Tripoli"
              />
            </div>

            <div className="form-group">
              <label htmlFor="region" className="form-label">
                Region
              </label>
              <select id="region" name="region" className="form-select" value={formData.region} onChange={handleChange}>
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Submitting Report..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateReport
