import { Navigate, useLocation } from "react-router-dom";
import { isTeacher } from "../api.js";

export default function RequireTeacher({ children }) {
  const location = useLocation();
  if (!isTeacher()) {
    return <Navigate to="/teacher-login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
