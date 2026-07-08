/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/components/auth/RegisterForm.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import { registerUser, clearMessages, setUser } from "../../store/slices/authSlice";
import FullScreenLoader from "../FullScreenLoader";
import AuthSSOButtons from "./AuthSSOButtons";
import { AuthMessageBanner, AuthDivider, AuthField } from "./AuthUI";
import TermsAndConditionsModal from "../../molecules/TermsAndConditionsModal";
import PropTypes from "prop-types";
import { registerSchema, passwordSchema } from "../../utils/validation/schemas";
import logger from "@utils/logger";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const passwordRules = [
  { id: "length",    label: "At least 8 characters",       test: (p) => p.length >= 8 },
  { id: "uppercase", label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number",    label: "At least 1 number",           test: (p) => /[0-9]/.test(p) },
  { id: "special",   label: "At least 1 special character",test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const getPasswordValidation = (password) => {
  const result = passwordSchema.safeParse(password);
  const passed = passwordRules.filter((r) => r.test(password)).length;
  return { rules: passwordRules, passed, total: passwordRules.length, result };
};

const getStrength = (passed) => {
  if (passed <= 1) return { label: "Weak",   color: "#ef4444", width: "25%" };
  if (passed === 2) return { label: "Fair",   color: "#f59e0b", width: "50%" };
  if (passed === 3) return { label: "Good",   color: "#3b82f6", width: "75%" };
  return              { label: "Strong", color: "#22c55e", width: "100%" };
};

const RegisterForm = ({ role }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const googleBtnRef      = useRef(null);
  const termsAcceptedRef  = useRef(false);

  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const [showPassword,   setShowPassword]   = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [localMsg,       setLocalMsg]       = useState({ type: "", text: "" });
  const [pwTouched,      setPwTouched]      = useState(false);
  const [redirecting,    setRedirecting]    = useState(false);
  const [termsAccepted,  setTermsAccepted]  = useState(false);

  useEffect(() => {
    if (error) setLocalMsg({ type: "error", text: error });
  }, [error]);

  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  useEffect(() => {
    if (termsAccepted && localMsg.text === "Please accept the terms to continue.") {
      setLocalMsg({ type: "", text: "" });
    }
  }, [termsAccepted]);

  useGoogleAuth({
    btnRef: googleBtnRef,
    termsAcceptedRef,
    roles: [role],
    dispatch,
    setUser,
    onSuccess: (data) => {
      setLocalMsg({ type: "success", text: "Google signup successful! Redirecting…" });
      setTimeout(() => navigate(data?.isNewUser ? `/onboarding/${role}` : `/dashboard/${role}`), 700);
    },
    onError: (text) => setLocalMsg({ type: "error", text }),
  });


  const handleTermsAccept = () => {
    termsAcceptedRef.current = true;
    setTermsAccepted(true);
    setShowTermsModal(false);
    setLocalMsg({ type: "", text: "" });
  };

  // ── LinkedIn redirect ──────────────────────────────────────────────────────
  const handleLinkedIn = () => {
  if (!termsAcceptedRef.current) {
    setLocalMsg({ type: "error", text: "Please accept the terms before continuing with LinkedIn." });
    return;
  }
  if (!role) {
    setLocalMsg({ type: "error", text: "Something went wrong — please refresh and try again." });
    logger.info("LinkedIn SSO blocked — role missing", { role });
    return;
  }
  const url = `${BASE_URL}/auth/linkedin?role=${encodeURIComponent(role)}&termsAccepted=true`;
  logger.info("Redirecting to LinkedIn SSO (register)", { url });
  globalThis.location.href = url;
};

  const onSubmit = async (data) => {
    setLocalMsg({ type: "", text: "" });

    if (!termsAcceptedRef.current)
      return setLocalMsg({ type: "error", text: "Please accept the terms to continue." });

    const result = await dispatch(registerUser({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      roles: [role],
      termsAccepted: true,
    }));

    if (registerUser.fulfilled.match(result)) {
      const { isNewUser } = result.payload;
      if (!isNewUser) {
        return setLocalMsg({
          type: "error",
          text: "This email is already registered. Please login instead.",
        });
      }
      setRedirecting(true);
      setTimeout(() => navigate("/verify-email", { state: { email: data.email.trim(), role } }), 800);
    }
  };

  return (
    <>
      {redirecting && <FullScreenLoader message="Setting up your account…" />}


      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
        Register as {role === "mentor" ? "Mentor" : "Mentee"}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {role === "mentor"
          ? "Create your mentor account to start making an impact."
          : "Create your mentee account to start growing."}
      </p>

      {localMsg.type === "error" && <AuthMessageBanner type="error" text={localMsg.text} />}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <AuthField
            label="Full Name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="John Doe"
          />
          {errors.name && (
            <span id="name-error" role="alert" className="text-red-600 text-xs">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <AuthField
            label="Email Address"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="name@company.com"
          />
          {errors.email && (
            <span id="email-error" role="alert" className="text-red-600 text-xs">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              onBlur={() => setPwTouched(true)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button" tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {pwTouched && passwordValue && passwordValue.length > 0 && (() => {
            const { rules, passed, result } = getPasswordValidation(passwordValue);
            const strength = getStrength(passed);
            return (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: strength.width, height: "100%", background: strength.color, borderRadius: "999px", transition: "width 0.3s ease, background 0.3s ease" }} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: strength.color }}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {rules.map((rule) => {
                    const rulePassed = rule.test(passwordValue);
                    return (
                      <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ color: rulePassed ? "#22c55e" : "#cbd5e1", fontSize: "12px" }}>
                          {rulePassed ? "✓" : "○"}
                        </span>
                        <span style={{ fontSize: "11px", color: rulePassed ? "#16a34a" : "#94a3b8", fontWeight: rulePassed ? "600" : "400" }}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {errors.password && (
                  <span id="password-error" role="alert" className="text-red-600 text-xs mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button" tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {showConfirmPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span id="confirmPassword-error" role="alert" className="text-red-600 text-xs">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              termsAcceptedRef.current = e.target.checked;
            }}
            className="mt-0.5 w-4 h-4 accent-blue-900 shrink-0 cursor-pointer"
          />
          <label htmlFor="termsAccepted" className="text-sm text-slate-600 leading-relaxed">
            I agree to the{" "}
            <button type="button" onClick={() => setShowTermsModal(true)}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal">Terms</button>{" "}
            and{" "}
            <button type="button" onClick={() => setShowTermsModal(true)}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal">Privacy Policy</button>.
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || loading || !termsAccepted}
          className="w-full bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-2.5 mt-1 transition-colors"
        >
          {loading || isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Creating account…
            </span>
          ) : "Create Account"}
        </button>
      </form>

      <AuthDivider />

      <div className="relative">
        <AuthSSOButtons
          googleBtnRef={googleBtnRef}
          loading={loading}
          disabled={!termsAccepted}
          onLinkedIn={handleLinkedIn}
        />
      </div>

      <p className="text-sm text-slate-500 text-center mt-5">
        Already have an account?{" "}
        <span className="text-blue-900 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate("/login")}>Login</span>
      </p>

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        role={role}
        termsAccepted={termsAccepted}
      />
    </>
  );
};
RegisterForm.propTypes = {
  role: PropTypes.string.isRequired,
};

export default RegisterForm;
