/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/ProtectedRoute.jsx
//
// Single route guard for the whole app — mentor, mentee, and admin routes
// all go through this one component. Admin routes previously had their own
// guard (AdminRoute.tsx) reading a separate Context; now everything reads
// the same Redux auth slice.
//
// A route declares WHO may enter in either (or both) of two ways:
//   roles        — "any of these roles" (ROLE-based access)
//   permissions  — "any of these permissions" (PERMISSION-based access,
//                  same OR semantics as the backend's requirePermission)
// When both are given the user must satisfy both. `role` (singular) is kept
// as shorthand for `roles={[role]}`. With neither, any authenticated,
// verified user may enter.
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsVerified, selectRole } from "@features/auth/models/authSlice";
import {
  ROLE_CONFIG,
  getPrimaryRole,
  hasAnyPermission,
  type Permission,
  type RouteRole,
} from "@constants/roles";
import type { ReactNode } from "react";
import type { RootState } from "@store/index";

// NOTE: Silent refresh (rehydrating Redux accessToken after page refresh, or
// bootstrapping the admin cookie session) is handled in App.jsx before any
// routes render. By the time ProtectedRoute runs, Redux is already populated
// — or the user has been redirected to the appropriate login page.
interface ProtectedRouteProps {
  children: ReactNode;
  /** Shorthand for `roles={[role]}`. */
  role?: RouteRole;
  /** The user must hold at least one of these roles. */
  roles?: RouteRole[];
  /** The user's roles must grant at least one of these permissions. */
  permissions?: Permission[];
}

const ProtectedRoute = ({ children, role, roles, permissions }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isVerified       = useSelector(selectIsVerified);
  const currentRole      = useSelector(selectRole);
  const user             = useSelector((state: RootState) => state.auth.user);

  const allowedRoles: RouteRole[] = roles ?? (role ? [role] : []);

  // The first allowed role decides the session domain (bearer vs cookie)
  // and which login page an unauthenticated visitor is sent to. A single
  // route should not mix session domains (e.g. admin + mentor).
  const guardRole = allowedRoles[0];
  const routeConfig = guardRole ? ROLE_CONFIG[guardRole] : undefined;

  // Where THIS user's own account would actually land, derived from their
  // real roles array — not a phantom global. Used as the redirect target
  // when they're authenticated but hit a route that isn't theirs.
  const ownPrimaryRole = getPrimaryRole(user?.roles);

  if (!isAuthenticated) {
    return <Navigate to={routeConfig?.loginPath ?? "/login"} replace />;
  }

  // "cookie" session roles (currently just admin) don't have mentor/mentee
  // roles, an email-verification flow, or a "redirect back to your own
  // dashboard" behavior — they're a distinct, simpler session. A future
  // cookie-based role (see constants/roles.ts) is handled by this same
  // branch automatically, since it keys off ROLE_CONFIG rather than a
  // hardcoded `role === "admin"` check.
  if (routeConfig?.sessionType === "cookie") {
    if (!allowedRoles.includes(currentRole as RouteRole)) {
      return <Navigate to={routeConfig.loginPath} replace />;
    }
    return children;
  }

  // Role and permission checks. Failing either sends the user to whichever
  // dashboard their OWN roles actually grant, falling back to "/" if we
  // can't determine one (e.g. brand-new account mid-onboarding with no
  // roles resolved yet).
  const userRoles = user?.roles ?? [];
  const hasRequiredRole =
    allowedRoles.length === 0 || allowedRoles.some((r) => userRoles.includes(r));
  const hasRequiredPermission =
    !permissions?.length || hasAnyPermission(userRoles, permissions);

  if (!hasRequiredRole || !hasRequiredPermission) {
    const fallbackPath = ownPrimaryRole
      ? (ROLE_CONFIG[ownPrimaryRole]?.dashboardPath ?? "/")
      : "/";
    // Never redirect a route to itself (a dashboard that demands a
    // permission its own role lacks would otherwise loop forever).
    return <Navigate to={fallbackPath === location.pathname ? "/" : fallbackPath} replace />;
  }

  // The authRole cookie only proves *some* session is logged in with this role —
  // it says nothing about whether THIS account's email has been verified.
  // Block onboarding/dashboard access for unverified accounts even if a
  // (possibly stale, possibly backend-set) authRole cookie is present.
  if (!isVerified) {
    return (
      <Navigate
        to="/verify-email"
        state={{ email: user?.email, role: ownPrimaryRole || guardRole }}
        replace
      />
    );
  }

  return children;
};
export default ProtectedRoute;
