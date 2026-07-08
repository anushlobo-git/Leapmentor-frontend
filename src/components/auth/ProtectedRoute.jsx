/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "@utils/cookies";

// NOTE: Silent refresh (rehydrating Redux accessToken after page refresh) is
// handled in App.jsx before any routes render. By the time ProtectedRoute
// runs, Redux is already populated — or the user has been redirected to /login.
// So this component only needs to check the authRole cookie for access control.
import PropTypes from "prop-types";
const ProtectedRoute = ({ children, role }) => {
  const loggedIn   = isLoggedIn();   // authRole cookie exists?
  const storedRole = getRole();      // "mentor" | "mentee" | "admin" | null

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
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired,
};
export default ProtectedRoute;
