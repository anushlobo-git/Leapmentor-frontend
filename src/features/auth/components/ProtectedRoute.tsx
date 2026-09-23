/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/ProtectedRoute.jsx
//
// Single route guard for the whole app — mentor, mentee, and admin routes
// all go through this one component. Admin routes previously had their own
// guard (AdminRoute.tsx) reading a separate Context; now everything reads
// the same Redux auth slice, keyed by `role`.
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsVerified, selectRole } from "@features/auth/models/authSlice";
import type { ReactNode } from "react";
import type { RootState } from "@store/index";

// NOTE: Silent refresh (rehydrating Redux accessToken after page refresh, or
// bootstrapping the admin cookie session) is handled in App.jsx before any
// routes render. By the time ProtectedRoute runs, Redux is already populated
// — or the user has been redirected to the appropriate login page.
interface ProtectedRouteProps {
  children: ReactNode;
  role: "mentor" | "mentee" | "admin";
}

const LOGIN_PATH_BY_ROLE: Record<string, string> = {
  mentor: "/login/mentor",
  mentee: "/login/mentee",
  admin: "/admin/login",
};

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified       = useSelector(selectIsVerified);
  const currentRole      = useSelector(selectRole);
  const user             = useSelector((state: RootState) => state.auth.user);
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
    return <Navigate to={LOGIN_PATH_BY_ROLE[role] ?? "/login"} replace />;
  }

  // Admin sessions don't have mentor/mentee roles, an email-verification
  // flow, or the storedRole redirect-back-to-your-own-dashboard behavior —
  // they're a distinct, simpler session. Keep that check self-contained.
  if (role === "admin") {
    if (currentRole !== "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
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
