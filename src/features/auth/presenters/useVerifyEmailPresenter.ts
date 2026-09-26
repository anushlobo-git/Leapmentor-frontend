/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for the VerifyEmail page — owns OTP entry state, magic-link
// auto-verify, send/resend/verify thunk dispatches, and post-verify
// navigation. The view (views/VerifyEmail.tsx) only renders JSX using what
// this hook returns.
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendOtp,
  verifyEmail,
  verifyMagicLink,
  clearMessages,
} from "@features/auth/models/authSlice";
import {
  handleOtpChange as sharedHandleOtpChange,
  handleOtpKeyDown as sharedHandleOtpKeyDown,
  handleOtpPaste as sharedHandleOtpPaste,
} from "@lib/auth/otpUtils";
import type { AppDispatch, RootState } from "@store/index";

const OTP_ID_PREFIX = "votp";

function emailFromLocationState(state: unknown): string {
  if (state && typeof state === "object" && "email" in state && typeof state.email === "string") {
    return state.email;
  }
  return "";
}

export const useVerifyEmailPresenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, sending, error, successMsg } = useSelector(
    (state: RootState) => state.auth,
  );

  const [email, setEmail] = useState(emailFromLocationState(location.state));
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [redirecting, setRedirecting] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });

  const loginPath = "/login";

  const hasSentRef = useRef(false);
  const hasVerifiedRef = useRef(false);
  const otpBoxIdsRef = useRef(
    Array.from(
      { length: 6 },
      (_, index) => globalThis.crypto?.randomUUID?.() ?? `otp-box-${index + 1}`,
    ),
  );

  useEffect(() => {
    if (error) setMsg({ type: "error", text: typeof error === "string" ? error : (error as unknown as { message?: string })?.message || String(error) });
    // ✅ don't show success msg — loader handles it
  }, [error, successMsg]);

  // ── Magic link auto-verify ────────────────────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (token && emailParam && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      setEmail(emailParam);
      dispatch(clearMessages());
      setMsg({ type: "", text: "" });

      dispatch(verifyMagicLink({ token, email: emailParam })).then((action) => {
        if (verifyMagicLink.fulfilled.match(action)) {
          setRedirecting(true);
          setTimeout(() => navigate(loginPath), 1500);
        } else {
          setMsg({
            type: "error",
            text: (action.payload as string) || "Magic link verification failed.",
          });
        }
      });
    }
    // Mount-only magic-link auto-verify, guarded by hasVerifiedRef; reads
    // searchParams/dispatch/navigate once on mount and must not re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });
    if (!email.trim()) {
      setMsg({ type: "error", text: "Please enter your email first." });
      return;
    }
    const action = await dispatch(sendOtp({ email }));
    if (sendOtp.fulfilled.match(action)) {
      setMsg({ type: "success", text: "OTP sent to your email." });
    } else {
      setMsg({ type: "error", text: (action.payload as string) || "Failed to send OTP." });
    }
  };

  // ── Auto-send OTP on mount ────────────────────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token && emailFromLocationState(location.state) && !hasSentRef.current) {
      hasSentRef.current = true;
      handleSendOtp();
    }
    // Mount-only auto-send, guarded by hasSentRef; reads location.state and
    // searchParams once on mount and must not re-fire on their changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── OTP box helpers ─ delegated to shared lib/auth/otpUtils ─
  const handleOtpChange = (val: string, idx: number) =>
    sharedHandleOtpChange(val, idx, otp, setOtp, OTP_ID_PREFIX);
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) =>
    sharedHandleOtpKeyDown(e, idx, otp, OTP_ID_PREFIX);
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) =>
    sharedHandleOtpPaste(e, otp, setOtp, OTP_ID_PREFIX);

  // ── Verify OTP ────────────────────────────────────────────
  const verifyOtp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });

    const otpStr = otp.join("");
    if (!email.trim() || otpStr.length < 6) {
      setMsg({
        type: "error",
        text: "Email and full 6-digit OTP are required.",
      });
      return;
    }

    const action = await dispatch(verifyEmail({ email, otp: otpStr }));
    if (verifyEmail.fulfilled.match(action)) {
      setRedirecting(true);
      setTimeout(() => navigate(loginPath), 900); // ✅ fixed: was using undefined redirectPath
    } else {
      setMsg({
        type: "error",
        text: (action.payload as string) || "OTP verification failed.",
      });
    }
  };

  const isMagicLinkPending = Boolean(searchParams.get("token") && !msg.text);
  const showEmailField = !emailFromLocationState(location.state) && !searchParams.get("email");
  const goToLogin = () => navigate(loginPath);

  return {
    loading,
    sending,
    email,
    setEmail,
    otp,
    otpBoxIdsRef,
    redirecting,
    msg,
    isMagicLinkPending,
    showEmailField,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    verifyOtp,
    handleSendOtp,
    goToLogin,
  };
};

export default useVerifyEmailPresenter;
