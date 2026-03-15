// src/components/auth/LoginForm.jsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import useGoogleAuth from "../../hooks/useGoogleAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CLERK_STRATEGY = {
  linkedin: "oauth_linkedin_oidc",
  apple: "oauth_apple",
};

const redirectByRole = (roles = [], targetRole, navigate) => {
  if (targetRole === "mentor" && roles.includes("mentor")) {
    navigate("/dashboard/mentor");
  } else if (targetRole === "mentee" && roles.includes("mentee")) {
    navigate("/dashboard/mentee");
  } else if (roles.includes("mentor")) {
    navigate("/dashboard/mentor");
  } else if (roles.includes("mentee")) {
    navigate("/dashboard/mentee");
  } else {
    navigate("/login");
  }
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const LoginForm = ({ role, title, subtitle, placeholder, registerPath }) => {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const { signIn, isLoaded: clerkLoaded } = useSignIn();
  const { signOut } = useClerk();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState({ type: "", text: "" });

  useGoogleAuth({
    btnRef: googleBtnRef,
    termsAcceptedRef: null,
    roles: [],
    onSuccess: (data) => {
      setMsg({ type: "success", text: "Google login successful! Redirecting..." });
      setTimeout(() => redirectByRole(data?.user?.roles || [], role, navigate), 700);
    },
    onError: (text) => setMsg({ type: "error", text }),
    onLoadingChange: setLoading,
  });

  const handleClerkSSO = async (provider) => {
    if (!clerkLoaded) return;
    try {
      setLoading(true);
      await signOut({ redirectUrl: window.location.href });
      localStorage.setItem("sso_role", "existing");
      localStorage.setItem("sso_terms", "true");
      await signIn.authenticateWithRedirect({
        strategy: CLERK_STRATEGY[provider],
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/sso-callback-sync`,
      });
    } catch (err) {
      localStorage.removeItem("sso_role");
      localStorage.removeItem("sso_terms");
      setMsg({ type: "error", text: err.message || "SSO failed. Try again." });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: form.email.trim(),
        password: form.password,
      });
      if (res.data?.token) localStorage.setItem("token", res.data.token);
      setMsg({ type: "success", text: "Login successful! Redirecting..." });
      setTimeout(() => redirectByRole(res.data?.user?.roles || [], role, navigate), 800);
    } catch (err) {
      const apiMsg = err?.response?.data?.message || err?.message || "Invalid credentials";
      setMsg({ type: "error", text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4">

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
      </div>

      {msg.text && (
        <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${
          msg.type === "success"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
          <input
            type="email" name="email" value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder={placeholder} required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-150 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} name="password" value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button type="button" onClick={() => setShowPw((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPw ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {/* ✅ UPDATED — now navigates to /forgot-password?role=mentor|mentee */}
          <div className="text-right mt-1.5">
            <span
              onClick={() => navigate(`/forgot-password?role=${role}`)}
              className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Forgot password? Click here
            </span>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-blue-200 flex items-center justify-center gap-2 mt-2">
          {loading ? (
            <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Logging in...</>
          ) : (
            <>Login to Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs text-slate-400 font-medium">Or continue with</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className={`relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden hover:bg-slate-50 transition-all duration-150 shrink-0 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><GoogleIcon /></div>
          <div ref={googleBtnRef} className="absolute inset-0 opacity-0 scale-150 z-20" />
        </div>
        <button type="button" onClick={() => handleClerkSSO("linkedin")} disabled={loading || !clerkLoaded}
          className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-60 transition-all duration-150 shrink-0">
          <LinkedInIcon />
        </button>
        <button type="button" onClick={() => handleClerkSSO("apple")} disabled={loading || !clerkLoaded}
          className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-60 transition-all duration-150 shrink-0">
          <AppleIcon />
        </button>
      </div>

      <p className="text-sm text-slate-500 text-center mt-8">
        Don't have an account?{" "}
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(registerPath)}>
          Register here
        </span>
      </p>
    </div>
  );
};

export default LoginForm;