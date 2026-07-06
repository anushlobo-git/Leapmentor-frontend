// src/App.jsx
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./store/slices/authSlice";
import { isLoggedIn, clearAuthRole } from "./utils/cookies";
import axiosInstance from "./utils/axiosInstance";
import logger from "./utils/logger";

// ── Eager loaded — tiny, always needed immediately ────────────
import Home     from "@pages/shared/Home";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/admin/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// ── Auth pages ────────────────────────────────────────────────

const Register       = lazy(()=> import("./pages/Register"));
const LoginMentor    = lazy(() => import("./pages/LoginMentor"));
const LoginMentee    = lazy(() => import("./pages/LoginMentee"));
const VerifyEmail    = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SSOCallback    = lazy(() => import("./pages/SSOCallback"));

// ── Onboarding ────────────────────────────────────────────────
const MentorOnboarding   = lazy(() => import("./pages/MentorOnboarding"));
const MentorVerification = lazy(() => import("./pages/MentorVerification"));
const MenteeOnboarding   = lazy(() => import("./pages/MenteeOnboarding"));

// ── Edit Profile ──────────────────────────────────────────────
const MenteeEditProfileShell = lazy(() => import("./components/mentee/profile/MenteeEditProfileShell"));
const MentorEditProfileShell = lazy(() => import("./components/mentor/profile/MentorEditProfileShell"));

// ── Dashboards ────────────────────────────────────────────────
const MentorDashboard     = lazy(() => import("./pages/MentorDashboard"));
const MenteeDashboard     = lazy(() => import("./pages/MenteeDashboard"));
const SharedDashboardPage = lazy(() => import("./pages/SharedDashboardPage"));

// ── Admin ─────────────────────────────────────────────────────
const AdminLogin           = lazy(() => import("./pages/admin/AdminLogin"));
const AdminUserManagement  = lazy(() => import("./pages/admin/AdminUserManagement"));
const AdminEngagements     = lazy(() => import("./pages/admin/AdminEngagements"));
const AdminReports         = lazy(() => import("./pages/admin/AdminReports"));
const AdminPayments        = lazy(() => import("./pages/admin/AdminPayments"));
const AdminSettings        = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSupportMessages = lazy(() => import("./components/admin/AdminSupportMessages"));
const AdminLayout          = lazy(() => import("./components/admin/AdminLayout"));
const AdminWalletRequests  = lazy(() => import("./pages/admin/AdminWalletRequests"));
const AdminVerifications   = lazy(() => import("./pages/admin/AdminVerifications"));

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
    return isLoggedIn() && !accessToken;
  });

  useEffect(() => {
    if (!isLoggedIn() || accessToken) {
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
