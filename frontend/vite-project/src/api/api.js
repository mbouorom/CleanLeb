import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 error detected, clearing auth state");

      // Clear token from localStorage
      localStorage.removeItem("token");

      // Clear axios default headers
      delete api.defaults.headers.common["Authorization"];

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        console.log("Redirecting to login");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
