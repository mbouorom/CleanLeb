"use client"

import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    region: "",
  })
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const location = {
      city: formData.city,
      region: formData.region,
    }

    const result = await register(formData.name, formData.email, formData.password, location)

    if (result.success) {
      toast.success("Registration successful! Welcome to Lebanon Clean!")
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Join Lebanon Clean</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="e.g., Beirut, Tripoli, Sidon"
            />
          </div>

          <div className="form-group">
            <label htmlFor="region" className="form-label">
              Region
            </label>
            <select id="region" name="region" className="form-select" value={formData.region} onChange={handleChange}>
              <option value="">Select Region</option>
              <option value="Beirut">Beirut</option>
              <option value="Mount Lebanon">Mount Lebanon</option>
              <option value="North Lebanon">North Lebanon</option>
              <option value="South Lebanon">South Lebanon</option>
              <option value="Bekaa">Bekaa</option>
              <option value="Nabatieh">Nabatieh</option>
            </select>
          </div>

          <button type="submit" className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
