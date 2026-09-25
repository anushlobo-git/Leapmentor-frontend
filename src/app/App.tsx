/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/App.jsx
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/index";
import { setUser, logout } from "@features/auth/models/authSlice";
import { refreshTokenRequest } from "@features/auth/models/auth.api";
import logger from "@lib/monitoring/logger";
import { hasSessionHint, clearAuthRole } from "@lib/http/cookies";
import ErrorBoundary from "@components/shared/ErrorBoundary";

// ── Eager loaded — tiny, always needed immediately ────────────
import Home from "@features/marketing/views/Home";
import NotFound from "@app/pages/NotFound";
import ProtectedRoute from "@features/auth/components/ProtectedRoute";

// Every other page — and which role/permission may open it — is declared in
// ./routes.tsx. Nothing in this file names a specific role.
import {
  PUBLIC_ROUTES,
  ROLE_GUARDED_ROUTES,
  ADMIN_LOGIN_ROUTE,
  ADMIN_ROUTES,
  type RouteDef,
  type GuardedRouteDef,
} from "./routes";

const SharedDashboardPage = lazy(
  () => import("@features/shared-dashboard/views/SharedDashboardPage"),
);

// ── Global loading spinner ────────────────────────────────────
const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#f0f2f7" }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      <p
        className="text-xs text-slate-400"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Loading...
      </p>
    </div>
  </div>
);

// ── Admin session bootstrap — replaces the old AdminAuthProvider ──────
const AdminAuthLayout = lazy(
  () => import("@features/admin/views/AdminSessionGate"),
);

// ── Route renderers ───────────────────────────────────────────
const renderPublicRoute = ({ path, Page }: RouteDef) => (
  <Route key={path} path={path} element={<Page />} />
);

const renderGuardedRoute = ({ path, Page, Layout, access }: GuardedRouteDef) => (
  <Route
    key={path}
    path={path}
    element={
      <ProtectedRoute roles={access.roles} permissions={access.permissions}>
        {Layout ? (
          <Layout>
            <Page />
          </Layout>
        ) : (
          <Page />
        )}
      </ProtectedRoute>
    }
  />
);

// ── Inner app — needs access to Redux dispatch ────────────────
const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  // FIX: Silent refresh on page load.
  // When the page is hard-refreshed, Redux is wiped but the httpOnly
  // refreshToken cookie is still alive. If the authRole cookie exists
  // (user was logged in) but Redux has no accessToken, hit /auth/refresh
  // to rehydrate Redux before rendering any protected route.
  const [rehydrating, setRehydrating] = useState(() => {
    // Only block render if we actually need to rehydrate
    return hasSessionHint() && !accessToken;
  });

  useEffect(() => {
    if (!hasSessionHint() || accessToken) {
      // Not logged in, or token already in Redux — nothing to do
      setRehydrating(false);
      return;
    }

    const rehydrate = async () => {
      try {
        const { data } = await refreshTokenRequest();
        if (!data.user || !data.accessToken) {
          throw new Error("Incomplete refresh response");
        }
        dispatch(setUser({ user: data.user, accessToken: data.accessToken }));
      } catch {
        // Refresh token expired — cookies are stale, clean up
        dispatch(logout());
        clearAuthRole();
        logger.warn("Silent refresh failed — redirecting to login");
        globalThis.location.href = "/login";
      } finally {
        setRehydrating(false);
      }
    };

    rehydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — runs once on mount

  if (rehydrating) return <PageLoader />;

  return (
    <ErrorBoundary resetKeys={[location.pathname]}>
    <Routes>
      <Route path="/" element={<Home />} />

      {/* ── Public: register, logins, verify, SSO ─────── */}
      {PUBLIC_ROUTES.map(renderPublicRoute)}

      {/* ── Role-guarded: onboarding, profile, dashboards ─
           Generated from the role registry (constants/roles.ts). */}
      {ROLE_GUARDED_ROUTES.map(renderGuardedRoute)}

      {/* ── Shared Dashboard ──────────────────────────── */}
      <Route
        path="/shared-dashboard/:connectRequestId"
        element={<SharedDashboardPage />}
      />

      {/* ── Admin (cookie session, gated by AdminSessionGate) ── */}
      <Route element={<AdminAuthLayout />}>
        {renderPublicRoute(ADMIN_LOGIN_ROUTE)}
        {ADMIN_ROUTES.map(renderGuardedRoute)}
      </Route>

      {/* ── 404 ───────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
        <Toaster />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
