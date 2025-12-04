import { Navigate } from "react-router-dom";

export default function AdminPrivateRoute({ children }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return token && role === "admin" ? children : <Navigate to="/" />;
}
