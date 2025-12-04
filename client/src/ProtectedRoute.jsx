import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (allowedRole === "student" && localStorage.getItem("hasSubmitted") === "true") {
  return <Navigate to="/student/thank-you" replace />;
}


  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
