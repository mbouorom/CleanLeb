"use client";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReportsProvider } from "./contexts/ReportsContext";

// Import contexts and components
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Map from "./pages/Map";
import CreateReport from "./pages/CreateReport";
import AdminDashboard from "./pages/AdminDashboard";
import Quiz from "./pages/Quiz";
import Education from "./pages/Education";

// Import CSS for Leaflet
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ReportsProvider>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/map" element={<Map />} />
                <Route path="/education" element={<Education />} />
                <Route path="/quiz/:id" element={<Quiz />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-report"
                  element={
                    <ProtectedRoute>
                      <CreateReport />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </ReportsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
