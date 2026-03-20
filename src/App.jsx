// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Eager loaded — tiny, always needed immediately ────────────
import Home     from "./components/Home";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/admin/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// ── Auth pages ────────────────────────────────────────────────
const RegisterMentee = lazy(() => import("./pages/RegisterMentee"));
const RegisterMentor = lazy(() => import("./pages/RegisterMentor"));
const RegisterBoth   = lazy(() => import("./pages/RegisterBoth"));
const Login          = lazy(() => import("./pages/Login"));
const LoginMentor    = lazy(() => import("./pages/LoginMentor"));
const LoginMentee    = lazy(() => import("./pages/LoginMentee"));
const VerifyEmail    = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SSOCallback    = lazy(() => import("./pages/SSOCallback"));
const SSOSync        = lazy(() => import("./pages/SSOSync"));

// ── Onboarding ────────────────────────────────────────────────
const MentorOnboarding = lazy(() => import("./pages/MentorOnboarding"));
const MenteeOnboarding = lazy(() => import("./pages/MenteeOnboarding"));

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

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Home ──────────────────────────────────────── */}
          <Route path="/"  element={<Home />} />

          {/* ── Auth ──────────────────────────────────────── */}
          <Route path="/register/mentee"   element={<RegisterMentee />} />
          <Route path="/register/mentor"   element={<RegisterMentor />} />
          <Route path="/register/both"     element={<RegisterBoth />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/login/mentor"      element={<LoginMentor />} />
          <Route path="/login/mentee"      element={<LoginMentee />} />
          <Route path="/verify-email"      element={<VerifyEmail />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/sso-callback"      element={<SSOCallback />} />
          <Route path="/sso-callback-sync" element={<SSOSync />} />

          {/* ── Onboarding ────────────────────────────────── */}
          <Route path="/onboarding/mentor" element={<ProtectedRoute role="mentor"><MentorOnboarding /></ProtectedRoute>} />
          <Route path="/onboarding/mentee" element={<ProtectedRoute role="mentee"><MenteeOnboarding /></ProtectedRoute>} />

          {/* ── Edit Profile ──────────────────────────────── */}
          <Route path="/dashboard/mentee/edit-profile" element={<ProtectedRoute role="mentee"><MenteeEditProfileShell /></ProtectedRoute>} />
          <Route path="/dashboard/mentor/edit-profile" element={<ProtectedRoute role="mentor"><MentorEditProfileShell /></ProtectedRoute>} />

          {/* ── Dashboards ────────────────────────────────── */}
          <Route path="/dashboard/mentor"  element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/mentee"  element={<ProtectedRoute role="mentee"><MenteeDashboard /></ProtectedRoute>} />

          {/* ── Shared Dashboard ──────────────────────────── */}
          <Route path="/shared-dashboard/:connectRequestId" element={<SharedDashboardPage />} />

          {/* ── Admin ─────────────────────────────────────── */}
          <Route path="/admin/login"       element={<AdminLogin />} />
          <Route path="/admin/users"       element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
          <Route path="/admin/engagements" element={<AdminRoute><AdminEngagements /></AdminRoute>} />
          <Route path="/admin/reports"     element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/payments"    element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/settings"    element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/support"     element={<AdminRoute><AdminLayout><AdminSupportMessages /></AdminLayout></AdminRoute>} />

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;