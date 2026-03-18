// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import RegisterMentee from "./pages/RegisterMentee";
import RegisterMentor from "./pages/RegisterMentor";
import RegisterBoth from "./pages/RegisterBoth";
import Login from "./pages/Login";
import LoginMentor from "./pages/LoginMentor";
import LoginMentee from "./pages/LoginMentee";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import MentorDashboard from "./pages/MentorDashboard";
import MenteeDashboard from "./pages/MenteeDashboard";
import MentorOnboarding from "./pages/MentorOnboarding";
import MenteeOnboarding from "./pages/MenteeOnboarding";
import SSOCallback from "./pages/SSOCallback";
import SSOSync from "./pages/SSOSync";
import MenteeEditProfileShell from "./components/mentee/profile/MenteeEditProfileShell";
import MentorEditProfileShell from "./components/mentor/profile/MentorEditProfileShell";
import SharedDashboardPage from "./pages/SharedDashboardPage";

// ── Admin ─────────────────────────────────────────────────────
import AdminLogin          from "./pages/admin/AdminLogin";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminRoute          from "./components/admin/AdminRoute";
import AdminEngagements from "./pages/admin/AdminEngagements";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Home ──────────────────────────────────────── */}
        <Route path="/" element={<Home />} />

        {/* ── Auth ──────────────────────────────────────── */}
        <Route path="/register/mentee"     element={<RegisterMentee />} />
        <Route path="/register/mentor"     element={<RegisterMentor />} />
        <Route path="/register/both"       element={<RegisterBoth />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/login/mentor"        element={<LoginMentor />} />
        <Route path="/login/mentee"        element={<LoginMentee />} />
        <Route path="/verify-email"        element={<VerifyEmail />} />
        <Route path="/forgot-password"     element={<ForgotPassword />} />
        <Route path="/sso-callback"        element={<SSOCallback />} />
        <Route path="/sso-callback-sync"   element={<SSOSync />} />

        {/* ── Onboarding ────────────────────────────────── */}
        <Route path="/onboarding/mentor"   element={<MentorOnboarding />} />
        <Route path="/onboarding/mentee"   element={<MenteeOnboarding />} />

        {/* ── Edit Profile ──────────────────────────────── */}
        <Route path="/dashboard/mentee/edit-profile" element={<MenteeEditProfileShell />} />
        <Route path="/dashboard/mentor/edit-profile" element={<MentorEditProfileShell />} />

        {/* ── Dashboards ────────────────────────────────── */}
        <Route path="/dashboard/mentor"    element={<MentorDashboard />} />
        <Route path="/dashboard/mentee"    element={<MenteeDashboard />} />

        {/* ── Shared Dashboard ──────────────────────────── */}
        <Route path="/shared-dashboard/:connectRequestId" element={<SharedDashboardPage />} />

        {/* ── Admin (separate auth, separate token) ─────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
        <Route path="/admin/engagements" element={<AdminRoute><AdminEngagements /></AdminRoute>} />
        {/* ── 404 ───────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;