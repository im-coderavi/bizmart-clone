import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!isAuthed) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}
