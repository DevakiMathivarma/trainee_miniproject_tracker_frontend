// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
