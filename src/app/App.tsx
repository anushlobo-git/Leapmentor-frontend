/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/App.jsx
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@store/index";
import { setUser, logout } from "@features/auth/models/authSlice";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { hasSessionHint, clearAuthRole } from "@lib/cookies";

// ── Eager loaded — tiny, always needed immediately ────────────
import Home from "@features/marketing/views/Home";
import NotFound from "@app/pages/NotFound";
import ProtectedRoute from "@features/auth/components/ProtectedRoute";

// ── Auth pages ────────────────────────────────────────────────

const Register = lazy(() => import("@features/auth/views/Register"));
const LoginMentor = lazy(() => import("@features/auth/views/LoginMentor"));
const LoginMentee = lazy(() => import("@features/auth/views/LoginMentee"));
const VerifyEmail = lazy(() => import("@features/auth/views/VerifyEmail"));
const ForgotPassword = lazy(
  () => import("@features/auth/views/ForgotPassword"),
);
const SSOCallback = lazy(() => import("@features/auth/views/SSOCallback"));

// ── Onboarding ────────────────────────────────────────────────
const MentorOnboarding = lazy(
  () => import("@features/mentor/views/MentorOnboarding"),
);
const MentorVerification = lazy(
  () => import("@features/mentor/views/MentorVerification"),
);
const MenteeOnboarding = lazy(
  () => import("@features/mentee/views/MenteeOnboarding"),
);

// ── Edit Profile ──────────────────────────────────────────────
const MenteeEditProfileShell = lazy(
  () => import("@features/mentee/views/profile/MenteeEditProfileShell"),
);
const MentorEditProfileShell = lazy(
  () => import("@features/mentor/views/profile/MentorEditProfileShell"),
);

// ── Dashboards ────────────────────────────────────────────────
const MentorDashboard = lazy(
  () => import("@features/mentor/views/MentorDashboard"),
);
const MenteeDashboard = lazy(
  () => import("@features/mentee/views/MenteeDashboard"),
);
const SharedDashboardPage = lazy(
  () => import("@features/shared-dashboard/views/SharedDashboardPage"),
);

// ── Admin ─────────────────────────────────────────────────────
const AdminLogin = lazy(() => import("@features/admin/views/AdminLogin"));
const AdminUserManagement = lazy(
  () => import("@features/admin/views/AdminUserManagement"),
);
const AdminEngagements = lazy(
  () => import("@features/admin/views/AdminEngagements"),
);
const AdminReports = lazy(() => import("@features/admin/views/AdminReports"));
const AdminPayments = lazy(() => import("@features/admin/views/AdminPayments"));
const AdminSettings = lazy(() => import("@features/admin/views/AdminSettings"));
const AdminSupportMessages = lazy(
  () => import("@features/admin/views/AdminSupportMessages"),
);
const AdminLayout = lazy(
  () => import("@features/admin/views/AdminLayout"),
);
const AdminWalletRequests = lazy(
  () => import("@features/admin/views/AdminWalletRequests"),
);
const AdminVerifications = lazy(
  () => import("@features/admin/views/AdminVerifications"),
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

// ── Inner app — needs access to Redux dispatch ────────────────
const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
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
        const { data } = await axiosInstance.post("/auth/refresh");
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
    <Routes>
      {/* ── Home ──────────────────────────────────────── */}
      <Route path="/" element={<Home />} />

      {/* ── Auth ──────────────────────────────────────── */}
      {/*<Route path="/register/mentee"   element={<RegisterMentee />} />
      <Route path="/register/mentor"   element={<RegisterMentor />} />*/}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<LoginMentee />} />
      <Route path="/login/mentor" element={<LoginMentor />} />
      <Route path="/login/mentee" element={<LoginMentee />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/sso-callback" element={<SSOCallback />} />

      {/* ── Onboarding ────────────────────────────────── */}
      <Route
        path="/onboarding/mentor"
        element={
          <ProtectedRoute role="mentor">
            <MentorOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-documents"
        element={
          <ProtectedRoute role="mentor">
            <MentorVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/mentee"
        element={
          <ProtectedRoute role="mentee">
            <MenteeOnboarding />
          </ProtectedRoute>
        }
      />

      {/* ── Edit Profile ──────────────────────────────── */}
      <Route
        path="/dashboard/mentee/edit-profile"
        element={
          <ProtectedRoute role="mentee">
            <MenteeEditProfileShell />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mentor/edit-profile"
        element={
          <ProtectedRoute role="mentor">
            <MentorEditProfileShell />
          </ProtectedRoute>
        }
      />

      {/* ── Dashboards ────────────────────────────────── */}
      <Route
        path="/dashboard/mentor"
        element={
          <ProtectedRoute role="mentor">
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mentee"
        element={
          <ProtectedRoute role="mentee">
            <MenteeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Shared Dashboard ──────────────────────────── */}
      <Route
        path="/shared-dashboard/:connectRequestId"
        element={<SharedDashboardPage />}
      />

      {/* ── Admin ─────────────────────────────────────── */}
      <Route element={<AdminAuthLayout />}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/engagements"
          element={
            <ProtectedRoute role="admin">
              <AdminEngagements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute role="admin">
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wallet-requests"
          element={
            <ProtectedRoute role="admin">
              <AdminWalletRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminSupportMessages />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminVerifications />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── 404 ───────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
