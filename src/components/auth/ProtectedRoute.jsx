// Updated ProtectedRoute — accepts role prop

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    const redirectTo = role === "mentor"
      ? "/login/mentor"
      : role === "mentee"
      ? "/login/mentee"
      : "/login";
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};
export default ProtectedRoute;