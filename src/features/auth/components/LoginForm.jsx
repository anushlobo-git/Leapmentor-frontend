/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/LoginForm.jsx
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@features/auth/api/auth.api";
import { setUser } from "@features/auth/store/authSlice";
import useGoogleAuth from "@features/auth/hooks/useGoogleAuth";
import AuthSSOButtons from "@features/auth/components/AuthSSOButtons";
import { AuthBrand } from "@features/auth/components/AuthUI";
import { LeapMentorLogo } from "@features/auth/components/AuthIcons";
import FullScreenLoader from "@components/common/FullScreenLoader";
import { setAuthRole } from "@lib/cookies";
import PropTypes from "prop-types";
import { loginSchema } from "@lib/validation/schemas";
import logger from "@lib/logger";
import { HTTP_STATUS } from "@lib/httpStatus";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Sonar (S3358): nested ternaries are hard to read, so this resolves the
// user's primary role as an independent, linear statement instead.
const getPrimaryRole = (roles) => {
  if (roles.includes("mentor")) return "mentor";
  if (roles.includes("mentee")) return "mentee";
  return null;
};

const LoginForm = ({ placeholder, registerPath }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const googleBtnRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  const handlePostAuth = (user, accessToken) => {
    dispatch(setUser({ accessToken, user }));

    const roles = user?.roles || [];
    const primaryRole = getPrimaryRole(roles);

    if (primaryRole) {
      setAuthRole(primaryRole); // this is what was missing
    } else {
      setMsg({ type: "error", text: "No role found. Please register first." });
      return;
    }

    setRedirecting(true);
    setTimeout(() => navigate(`/dashboard/${primaryRole}`), 800);
  };

  useGoogleAuth({
    btnRef: googleBtnRef,
    roles: [],
    dispatch,
    setUser,
    onSuccess: (data) => handlePostAuth(data?.user, data?.accessToken),
    onError: (text) => setMsg({ type: "error", text }),
    onLoadingChange: setLoading,
  });

  // ── LinkedIn redirect (mirrors RegisterForm) ───────────────────────────────
  const handleLinkedIn = () => {
    // On login we don't know the role yet — backend will resolve it
    // via the existing OAuthAccount → user lookup in socialAuthUser()
    logger.info("Redirecting to LinkedIn SSO (login)", {
      url: `${API_BASE}/auth/linkedin?termsAccepted=true`,
    });
    globalThis.location.href = `${API_BASE}/auth/linkedin?termsAccepted=true`;
  };

  const onSubmit = async (data) => {
    setMsg({ type: "", text: "" });
    try {
      setLoading(true);
      const res = await login(data.email.trim(), data.password);

      handlePostAuth(res.data?.user, res.data?.accessToken);
    } catch (err) {
      const status = err?.response?.status;
      const errData = err?.response?.data;
      const apiMsg = errData?.message || err?.message || "Invalid credentials";
      if (
        status === HTTP_STATUS.FORBIDDEN &&
        errData?.isEmailVerified === false
      ) {
        setMsg({
          type: "error",
          text: "Please verify your email first. Redirecting…",
        });
        setTimeout(
          () =>
            navigate(
              `/verify-email?email=${encodeURIComponent(errData.email)}`,
            ),
          1000,
        );
        return;
      }
      setMsg({ type: "error", text: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {redirecting && <FullScreenLoader message="Redirecting to dashboard…" />}

      <AuthBrand logo={<LeapMentorLogo />} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
          Login
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Enter your credentials to securely access your account.
        </p>
      </div>

      {msg.type === "error" && msg.text && (
        <div className="mb-5 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-600 border-red-200">
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            id="login-email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder={placeholder || "you@example.com"}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150 placeholder:text-slate-400"
          />
          {errors.email && (
            <span
              id="email-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="login-password"
              type={showPw ? "text" : "password"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {showPw ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span
              id="password-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.password.message}
            </span>
          )}
          <div className="text-right mt-1.5">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0"
            >
              Forgot password? Click here
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || loading}
          className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-blue-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading || isSubmitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              Login to Dashboard
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs font-semibold text-slate-500">
          Or continue with
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <AuthSSOButtons
        googleBtnRef={googleBtnRef}
        loading={loading}
        onLinkedIn={handleLinkedIn}
      />

      <p className="text-sm text-slate-500 text-center mt-8">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0"
          onClick={() => navigate(registerPath || "/register")}
        >
          Register here
        </button>
      </p>
    </div>
  );
};
LoginForm.propTypes = {
  placeholder: PropTypes.any.isRequired,
  registerPath: PropTypes.any.isRequired,
};

export default LoginForm;
