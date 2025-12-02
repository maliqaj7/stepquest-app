import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // not logged in → send to login page
    return <Navigate to="/login" replace />;
  }

  return children;
}
