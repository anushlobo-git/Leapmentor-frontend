/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsVerified } from "@features/auth/store/authSlice";

// NOTE: Silent refresh (rehydrating Redux accessToken after page refresh) is
// handled in App.jsx before any routes render. By the time ProtectedRoute
// runs, Redux is already populated — or the user has been redirected to /login.
// So this component only needs to check the authRole cookie for access control.
import PropTypes from "prop-types";
const ProtectedRoute = ({ children, role }) => {
    // authRole cookie exists?      // "mentor" | "mentee" | "admin" | null
  const isAuthenticated = useSelector(selectIsAuthenticated); // accessToken + user both present in Redux
  const isVerified      = useSelector(selectIsVerified);      // user.isVerified === true
  const user            = useSelector((state) => state.auth.user);


  if (!isAuthenticated) {
    let redirectTo = "/login";

    if (role === "mentor") {
      redirectTo = "/login/mentor";
    } else if (role === "mentee") {
      redirectTo = "/login/mentee";
    }

    return <Navigate to={redirectTo} replace />;
  }

  // Prevent wrong role accessing wrong dashboard
  if (role && !user.roles?.includes(role)) {
    return <Navigate to={`/dashboard/${storedRole}`} replace />;
  }

  // The authRole cookie only proves *some* session is logged in with this role —
  // it says nothing about whether THIS account's email has been verified.
  // Block onboarding/dashboard access for unverified accounts even if a
  // (possibly stale, possibly backend-set) authRole cookie is present.
  if (!isVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email, role: storedRole || role }} replace />;
  }

  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired,
};
export default ProtectedRoute;
