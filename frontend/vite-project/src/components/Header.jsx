import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{ background: "#2563eb", color: "white", padding: "1rem" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          🇱🇧 CleanLeb
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/reports"
            style={{ color: "white", textDecoration: "none" }}
          >
            Reports
          </Link>
          <Link to="/map" style={{ color: "white", textDecoration: "none" }}>
            Map
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{ color: "white", textDecoration: "none" }}
              >
                Dashboard
              </Link>
              <Link
                to="/create-report"
                style={{ color: "white", textDecoration: "none" }}
              >
                Report Issue
              </Link>
              {(user.role === "admin" || user.role === "municipal") && (
                <Link
                  to="/admin"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  {user.role === "admin" ? "Admin" : "Municipal Panel"}
                </Link>
              )}
              <span style={{ color: "#93c5fd" }}>
                👋 {user.name} ({user.points} pts)
              </span>
              <button
                onClick={logout}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: "white", textDecoration: "none" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{ color: "white", textDecoration: "none" }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
