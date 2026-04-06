import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ✅ ProtectedRoute Component
 * Prevents unauthorized access to the admin dashboard.
 * Redirects to /login if no valid token is found in localStorage.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
