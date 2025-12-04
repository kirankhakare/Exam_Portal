import { Navigate } from "react-router-dom";

export default function StudentPrivateRoute({ children }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return token && role === "student" ? children : <Navigate to="/" />;
}
