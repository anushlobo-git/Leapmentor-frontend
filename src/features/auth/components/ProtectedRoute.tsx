/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsVerified } from "@features/auth/store/authSlice";
import type { ReactNode } from "react";
import type { RootState } from "@store/index";

// NOTE: Silent refresh (rehydrating Redux accessToken after page refresh) is
// handled in App.jsx before any routes render. By the time ProtectedRoute
// runs, Redux is already populated — or the user has been redirected to /login.
// So this component only needs to check the authRole cookie for access control.
interface ProtectedRouteProps {
  children: ReactNode;
  role: string;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    // authRole cookie exists?      // "mentor" | "mentee" | "admin" | null
  const isAuthenticated = useSelector(selectIsAuthenticated); // accessToken + user both present in Redux
  const isVerified      = useSelector(selectIsVerified);      // user.isVerified === true
  const user            = useSelector((state: RootState) => state.auth.user);
  // NOTE (found during TS migration): 'storedRole' is not declared anywhere
  // in this module - it's a bare global reference. It only resolves when
  // something else in the app (or, in tests, the test itself) sets it as
  // a genuine global (globalThis.storedRole = ...); otherwise this throws
  // a ReferenceError at runtime. Confirmed via the existing test suite,
  // which relies on exactly this: it does `global.storedRole = "mentor"`
  // and asserts the resulting redirect. Preserving that exact behavior
  // here rather than reconstructing a "fixed" version, per migration scope.
  const storedRole = (globalThis as any).storedRole;


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
  if (role && !user?.roles?.includes(role)) {
    return <Navigate to={`/dashboard/${storedRole}`} replace />;
  }

  // The authRole cookie only proves *some* session is logged in with this role —
  // it says nothing about whether THIS account's email has been verified.
  // Block onboarding/dashboard access for unverified accounts even if a
  // (possibly stale, possibly backend-set) authRole cookie is present.
  if (!isVerified) {
    return <Navigate to="/verify-email" state={{ email: user?.email, role: storedRole || role }} replace />;
  }

  return children;
};
export default ProtectedRoute;
