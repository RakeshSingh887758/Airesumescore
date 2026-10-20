import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return <p className="auth-loading">Loading...</p>;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const { token, loading } = useAuth();

  if (loading) return <p className="auth-loading">Loading...</p>;

  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}