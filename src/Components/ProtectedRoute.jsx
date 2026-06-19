import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { getAuthSession } from "../api/axiosClient";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authSession = getAuthSession();
  const token = authSession?.token;
  const currentRole = authSession?.role;
  const [isVerified, setIsVerified] = useState(false);
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
        const serverRole = response.data.user?.role;

        if (allowedRoles.length > 0 && !allowedRoles.includes(serverRole)) {
          localStorage.removeItem("lmsAuth");
          if (isMounted) setIsInvalid(true);
          return;
        }

        if (isMounted) setIsVerified(true);
      } catch {
        if (isMounted) setIsInvalid(true);
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

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  if (isInvalid) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-600">
        Verifying session...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
