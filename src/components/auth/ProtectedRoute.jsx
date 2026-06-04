import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "@utils/cookies";

const ProtectedRoute = ({ children, role }) => {
  const loggedIn   = isLoggedIn();
  const storedRole = getRole();

  if (!loggedIn) {
    const redirectTo = role === "mentor"
      ? "/login/mentor"
      : role === "mentee"
      ? "/login/mentee"
      : "/login";
    return <Navigate to={redirectTo} replace />;
  }

  // Prevent wrong role accessing wrong dashboard
  if (role && storedRole && storedRole !== role) {
    return <Navigate to={`/dashboard/${storedRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;