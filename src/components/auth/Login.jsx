
//not used as per now 
// src/pages/Login.jsx
// Replaces LoginMentor.jsx and LoginMentee.jsx
// Drop-in: update App.jsx routes (see bottom of this file for instructions)

import { useState } from "react";
import LoginLeftPanel from "./LoginLeftPanel";
import LoginForm from "./LoginForm";

const Login = () => {
  const [role, setRole] = useState("mentee"); // "mentee" | "mentor"

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — updates copy based on selected role */}
      <div className="hidden lg:block lg:w-[45%] shrink-0">
        <LoginLeftPanel role={role} />
      </div>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm mx-auto">

          {/* ── Role toggle ───────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setRole("mentee")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "mentee"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              I'm a Mentee
            </button>
            <button
              type="button"
              onClick={() => setRole("mentor")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "mentor"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              I'm a Mentor
            </button>
          </div>

          {/* ── Login form — key forces remount on role switch so
               Google button re-renders for the correct role ── */}
          <LoginForm
            key={role}
            role={role}
            placeholder={role === "mentor" ? "mentor@example.com" : "you@example.com"}
            registerPath={`/register/${role}`}
          />
        </div>
      </main>
    </div>
  );
};

export default Login;

/*
─────────────────────────────────────────────────
  STEP 1 — Update App.jsx imports & routes
─────────────────────────────────────────────────

  Remove:
    const LoginMentor = lazy(() => import("./pages/LoginMentor"));
    const LoginMentee = lazy(() => import("./pages/LoginMentee"));

  Add:
    const Login = lazy(() => import("./pages/Login"));

  Replace these three routes:
    <Route path="/login"         element={<LoginMentee />} />
    <Route path="/login/mentor"  element={<LoginMentor />} />
    <Route path="/login/mentee"  element={<LoginMentee />} />

  With:
    <Route path="/login"         element={<Login />} />
    <Route path="/login/mentor"  element={<Login />} />   ← keeps old links working
    <Route path="/login/mentee"  element={<Login />} />   ← keeps old links working

─────────────────────────────────────────────────
  STEP 2 — Fix post-registration redirect
         in src/pages/VerifyEmail.jsx
─────────────────────────────────────────────────

  After the OTP/magic-link is verified successfully, navigate to
  onboarding instead of login.  Find the line that does:

    navigate("/login")
    // or
    navigate(`/login/${role}`)

  And replace with:

    navigate(`/onboarding/${role}`)   // role comes from location.state.role

  Make sure VerifyEmail reads role from location.state:
    const { email, role } = location.state || {};

  If role could be missing (magic-link flow), fall back:
    const destination = role ? `/onboarding/${role}` : "/login";
    navigate(destination);

─────────────────────────────────────────────────
  STEP 3 — (Already correct in RegisterForm.jsx)
─────────────────────────────────────────────────

  RegisterForm already passes { email, role } to /verify-email:
    navigate("/verify-email", { state: { email: form.email.trim(), role } });

  So as long as VerifyEmail uses location.state.role when redirecting,
  the full flow will be:

    Register → /verify-email → /onboarding/:role  ✓
*/