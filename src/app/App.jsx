/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/App.jsx
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AdminAuthProvider } from "@features/admin/context/AdminAuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "@features/auth/store/authSlice";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { hasSessionHint, clearAuthRole } from "@lib/cookies";


// ── Eager loaded — tiny, always needed immediately ────────────
import Home     from "@features/marketing/pages/Home";
import NotFound from "@app/pages/NotFound";
import AdminRoute from "@features/admin/components/AdminRoute";
import ProtectedRoute from "@features/auth/components/ProtectedRoute";

// ── Auth pages ────────────────────────────────────────────────

const Register       = lazy(()=> import("@features/auth/pages/Register"));
const LoginMentor    = lazy(() => import("@features/auth/pages/LoginMentor"));
const LoginMentee    = lazy(() => import("@features/auth/pages/LoginMentee"));
const VerifyEmail    = lazy(() => import("@features/auth/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@features/auth/pages/ForgotPassword"));
const SSOCallback    = lazy(() => import("@features/auth/pages/SSOCallback"));

// ── Onboarding ────────────────────────────────────────────────
const MentorOnboarding   = lazy(() => import("@features/mentor/pages/MentorOnboarding"));
const MentorVerification = lazy(() => import("@features/mentor/pages/MentorVerification"));
const MenteeOnboarding   = lazy(() => import("@features/mentee/pages/MenteeOnboarding"));

// ── Edit Profile ──────────────────────────────────────────────
const MenteeEditProfileShell = lazy(() => import("@features/mentee/components/profile/MenteeEditProfileShell"));
const MentorEditProfileShell = lazy(() => import("@features/mentor/components/profile/MentorEditProfileShell"));

// ── Dashboards ────────────────────────────────────────────────
const MentorDashboard     = lazy(() => import("@features/mentor/pages/MentorDashboard"));
const MenteeDashboard     = lazy(() => import("@features/mentee/pages/MenteeDashboard"));
const SharedDashboardPage = lazy(() => import("@features/shared-dashboard/pages/SharedDashboardPage"));

// ── Admin ─────────────────────────────────────────────────────
const AdminLogin           = lazy(() => import("@features/admin/pages/AdminLogin"));
const AdminUserManagement  = lazy(() => import("@features/admin/pages/AdminUserManagement"));
const AdminEngagements     = lazy(() => import("@features/admin/pages/AdminEngagements"));
const AdminReports         = lazy(() => import("@features/admin/pages/AdminReports"));
const AdminPayments        = lazy(() => import("@features/admin/pages/AdminPayments"));
const AdminSettings        = lazy(() => import("@features/admin/pages/AdminSettings"));
const AdminSupportMessages = lazy(() => import("@features/admin/components/AdminSupportMessages"));
const AdminLayout          = lazy(() => import("@features/admin/components/AdminLayout"));
const AdminWalletRequests  = lazy(() => import("@features/admin/pages/AdminWalletRequests"));
const AdminVerifications   = lazy(() => import("@features/admin/pages/AdminVerifications"));

const AdminAuthLayout = () => (
  <AdminAuthProvider>
    <Outlet />
  </AdminAuthProvider>
);

// ── Global loading spinner ────────────────────────────────────
const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#f0f2f7" }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Loading...
      </p>
    </div>
  </div>
);

// ── Inner app — needs access to Redux dispatch ────────────────
const AppRoutes = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

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
      <Route path="/"  element={<Home />} />

      {/* ── Auth ──────────────────────────────────────── */}
      {/*<Route path="/register/mentee"   element={<RegisterMentee />} />
      <Route path="/register/mentor"   element={<RegisterMentor />} />*/}
      <Route path="/register"          element={<Register />} />
      <Route path="/login"             element={<LoginMentee />} />
      <Route path="/login/mentor"      element={<LoginMentor />} />
      <Route path="/login/mentee"      element={<LoginMentee />} />
      <Route path="/verify-email"      element={<VerifyEmail />} />
      <Route path="/forgot-password"   element={<ForgotPassword />} />
      <Route path="/sso-callback"      element={<SSOCallback />} />

      {/* ── Onboarding ────────────────────────────────── */}
      <Route path="/onboarding/mentor"  element={<ProtectedRoute role="mentor"><MentorOnboarding /></ProtectedRoute>} />
      <Route path="/verify-documents"   element={<ProtectedRoute role="mentor"><MentorVerification /></ProtectedRoute>} />
      <Route path="/onboarding/mentee"  element={<ProtectedRoute role="mentee"><MenteeOnboarding /></ProtectedRoute>} />

      {/* ── Edit Profile ──────────────────────────────── */}
      <Route path="/dashboard/mentee/edit-profile" element={<ProtectedRoute role="mentee"><MenteeEditProfileShell /></ProtectedRoute>} />
      <Route path="/dashboard/mentor/edit-profile" element={<ProtectedRoute role="mentor"><MentorEditProfileShell /></ProtectedRoute>} />

      {/* ── Dashboards ────────────────────────────────── */}
      <Route path="/dashboard/mentor"  element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/mentee"  element={<ProtectedRoute role="mentee"><MenteeDashboard /></ProtectedRoute>} />

      {/* ── Shared Dashboard ──────────────────────────── */}
      <Route path="/shared-dashboard/:connectRequestId" element={<SharedDashboardPage />} />

      {/* ── Admin ─────────────────────────────────────── */}
      <Route element={<AdminAuthLayout />}>
        <Route path="/admin/login"         element={<AdminLogin />} />
        <Route path="/admin/users"         element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
        <Route path="/admin/engagements"   element={<AdminRoute><AdminEngagements /></AdminRoute>} />
        <Route path="/admin/reports"       element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/payments"      element={<AdminRoute><AdminPayments /></AdminRoute>} />
        <Route path="/admin/settings"      element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/wallet-requests" element={<AdminRoute><AdminWalletRequests /></AdminRoute>} />
        <Route path="/admin/support"       element={<AdminRoute><AdminLayout><AdminSupportMessages /></AdminLayout></AdminRoute>} />
        <Route path="/admin/verifications" element={<AdminRoute><AdminLayout><AdminVerifications /></AdminLayout></AdminRoute>} />
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
