import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Role validation gate
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "interviewer" ? "/interviewer/dashboard" : "/dashboard"} replace />;
  }

  return children;
}
