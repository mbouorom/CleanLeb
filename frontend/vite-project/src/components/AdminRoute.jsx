import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user && (user.role === "admin" || user.role === "municipal") ? (
    children
  ) : (
    <Navigate to="/" />
  );
};

export default AdminRoute;
