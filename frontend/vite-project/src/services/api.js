import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, location) => api.post("/auth/register", { name, email, password, location }),
  getCurrentUser: () => api.get("/auth/me"),
}

// Reports API
export const reportsAPI = {
  getReports: (params) => api.get("/reports", { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  createReport: (formData) =>
    api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  voteOnReport: (id, voteType) => api.post(`/reports/${id}/vote`, { voteType }),
  addComment: (id, text) => api.post(`/reports/${id}/comment`, { text }),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getLeaderboard: () => api.get("/users/leaderboard"),
}

// Education API
export const educationAPI = {
  getQuizzes: () => api.get("/education/quizzes"),
  getQuiz: (id) => api.get(`/education/quizzes/${id}`),
  submitQuiz: (id, answers) => api.post(`/education/quizzes/${id}/submit`, { answers }),
  getTips: () => api.get("/education/tips"),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  updateReportStatus: (id, status, priority) => api.put(`/admin/reports/${id}/status`, { status, priority }),
  assignReport: (id, assignedTo) => api.put(`/admin/reports/${id}/assign`, { assignedTo }),
  createQuiz: (quizData) => api.post("/admin/quizzes", quizData),
}

export default api
