import React, { useState, useEffect, createContext, useContext } from "react";
import api from "../api/api.js";

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AuthProvider initialization - token exists:", !!token);

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const response = await api.get("/users/profile");
      console.log("User profile fetched:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login...");
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      console.log("Login successful:", user);
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Attempting registration...");
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { token, user } = response.data;

      console.log("Registration successful:", user);
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logout called");
    try {
      // Clear token and headers
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];

      // Clear user state
      setUser(null);

      console.log("Logout completed successfully");

      // Force redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    // Add a method to refresh user data
    refreshUser: fetchUserProfile,
  };

  console.log("AuthProvider render - user:", user, "loading:", loading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
