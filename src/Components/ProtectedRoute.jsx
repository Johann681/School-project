import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { getAuthSession } from "../api/axiosClient";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authSession = getAuthSession();
  const token = authSession?.token;
  const currentRole = authSession?.role;
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!token) {
        setIsInvalid(true);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const serverRole = response.data.user?.role?.toString?.().toUpperCase();
        const allowed = (allowedRoles || []).map((r) => r.toString().toUpperCase());

        if (allowed.length > 0 && !allowed.includes(serverRole)) {
          localStorage.removeItem("lmsAuth");
          if (isMounted) setIsInvalid(true);
          return;
        }
      } catch {
        // keep the route available for frontend work if the backend is offline,
        // but still clear invalid auth on explicit authorization failures.
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, allowedRoles]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const normalizedAllowed = (allowedRoles || []).map((r) => r.toString().toUpperCase());
  const normalizedCurrent = (currentRole || "").toString().toUpperCase();

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(normalizedCurrent)) {
    localStorage.removeItem("lmsAuth");
    return <Navigate to="/login" replace />;
  }

  if (isInvalid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
