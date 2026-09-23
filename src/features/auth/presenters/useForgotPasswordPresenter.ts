/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for the ForgotPassword page — owns the 3-step (email → OTP →
// new password) flow: step state, OTP box handling, the three thunk
// dispatches, and post-reset navigation. The view (views/ForgotPassword.tsx)
// only renders JSX using what this hook returns.
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  clearMessages,
} from "@features/auth/models/authSlice";
import {
  STEPS,
  validatePassword,
  getStrength,
  getStepDotClass,
} from "@features/auth/presenters/forgotPassword.utils";
import {
  handleOtpChange as sharedHandleOtpChange,
  handleOtpKeyDown as sharedHandleOtpKeyDown,
  handleOtpPaste as sharedHandleOtpPaste,
} from "@lib/auth/otpUtils";
import type { AppDispatch, RootState } from "@store/index";

export const useForgotPasswordPresenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  // Both roles currently land on the same login screen; kept as a single
  // constant instead of a ternary since both branches evaluated to "/login".
  const loginPath = "/login";

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  // Stable per-box React keys (generated once) so the OTP inputs aren't
  // keyed off their array index.
  const otpKeysRef = useRef(
    Array.from({ length: 6 }, () => crypto.randomUUID()),
  );
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    dispatch(clearMessages());
  }, []);

  // ── Step 1 — Send OTP ─────────────────────────────────────
  const handleSendOTP = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });
    const action = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(action)) {
      dispatch(clearMessages());
      setMsg({ type: "", text: "" });
      setStep(STEPS.OTP);
    } else {
      setMsg({ type: "error", text: (action.payload as string) || "Failed to send OTP." });
    }
  };

  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    handleSendOTP({ preventDefault: () => {} });
  };

  // ── OTP box helpers ─ delegated to shared lib/auth/otpUtils ─
  const handleOtpChange = (val: string, idx: number) =>
    sharedHandleOtpChange(val, idx, otp, setOtp);
  const handleOtpKeyDown = (e: any, idx: number) => sharedHandleOtpKeyDown(e, idx, otp);
  const handleOtpPaste = (e: any) => sharedHandleOtpPaste(e, otp, setOtp);

  // ── Step 2 — Verify OTP ───────────────────────────────────
  const handleVerifyOTP = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      return setMsg({
        type: "error",
        text: "Please enter the full 6-digit OTP.",
      });
    }
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });
    const action = await dispatch(verifyResetOtp({ email, otp: otpStr }));
    if (verifyResetOtp.fulfilled.match(action)) {
      dispatch(clearMessages());
      setMsg({ type: "", text: "" });
      setStep(STEPS.PASSWORD);
    } else {
      setMsg({ type: "error", text: (action.payload as string) || "Invalid OTP." });
    }
  };

  // ── Step 3 — Reset Password ───────────────────────────────
  const handleResetPassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { passed } = validatePassword(newPassword);
    if (passed < 4) {
      setPwTouched(true);
      return setMsg({
        type: "error",
        text: "Please choose a stronger password.",
      });
    }
    if (newPassword !== confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match." });
    }
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });
    const action = await dispatch(
      resetPassword({ email, otp: otp.join(""), newPassword }),
    );
    if (resetPassword.fulfilled.match(action)) {
      dispatch(clearMessages());
      setRedirecting(true);
      setTimeout(() => navigate(loginPath), 1500);
    } else {
      setMsg({
        type: "error",
        text: (action.payload as string) || "Failed to reset password.",
      });
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPwTouched(true);
  };
  const handleNewPasswordBlur = () => setPwTouched(true);

  const togglePwVisibility = () => setShowPw((p) => !p);
  const toggleConfirmPwVisibility = () => setShowConfirmPw((p) => !p);
  const goToLogin = () => navigate(loginPath);

  // Password-strength breakdown for step 3, computed here so the view just renders it.
  const passwordStrength =
    pwTouched && newPassword.length > 0
      ? (() => {
          const { rules, passed } = validatePassword(newPassword);
          return { ...getStrength(passed), rules, newPassword };
        })()
      : null;

  // ── Step labels ───────────────────────────────────────────
  const stepMeta = {
    [STEPS.EMAIL]: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive a reset OTP",
    },
    [STEPS.OTP]: {
      title: "Enter OTP",
      subtitle: `We sent a 6-digit code to ${email}`,
    },
    [STEPS.PASSWORD]: {
      title: "Set New Password",
      subtitle: "Choose a strong new password",
    },
  };

  return {
    STEPS,
    step,
    stepMeta,
    getStepDotClass,
    loading,
    msg,
    redirecting,
    // step 1
    email,
    setEmail,
    handleSendOTP,
    // step 2
    otp,
    otpKeysRef,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerifyOTP,
    handleResendOTP,
    // step 3
    newPassword,
    handleNewPasswordChange,
    handleNewPasswordBlur,
    showPw,
    togglePwVisibility,
    confirmPassword,
    setConfirmPassword,
    showConfirmPw,
    toggleConfirmPwVisibility,
    passwordStrength,
    handleResetPassword,
    // navigation
    goToLogin,
  };
};

export default useForgotPasswordPresenter;
