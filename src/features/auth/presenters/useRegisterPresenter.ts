/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for RegisterForm — owns form state, the register thunk dispatch,
// Google/LinkedIn SSO wiring, terms-acceptance state, and post-register
// navigation. The view (views/RegisterForm.tsx) only renders JSX using what
// this hook returns.
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useGoogleAuth from "@features/auth/presenters/useGoogleAuth";
import {
  registerUser,
  clearMessages,
  setUser,
} from "@features/auth/models/authSlice";
import { setAuthRole } from "@lib/http/cookies";
import { getPrimaryRole } from "@lib/auth/redirectUtils";
import { registerSchema } from "@lib/validation/schemas";
import {
  getPasswordValidation,
  getPasswordStrength,
} from "@lib/validation/passwordValidation";
import logger from "@lib/monitoring/logger";
import type { AppDispatch, RootState } from "@store/index";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

interface UseRegisterPresenterArgs {
  role: string;
}

export const useRegisterPresenter = ({ role }: UseRegisterPresenterArgs) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const termsAcceptedRef = useRef(false);

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [localMsg, setLocalMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });
  const [pwTouched, setPwTouched] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (error) setLocalMsg({ type: "error", text: typeof error === "string" ? error : (error as unknown as { message?: string })?.message || String(error) });
  }, [error]);

  useEffect(() => {
    return () => { dispatch(clearMessages()); };
  }, [dispatch]);

  useEffect(() => {
    if (
      termsAccepted &&
      localMsg.text === "Please accept the terms to continue."
    ) {
      setLocalMsg({ type: "", text: "" });
    }
  }, [termsAccepted, localMsg.text]);

  useGoogleAuth({
    btnRef: googleBtnRef,
    termsAcceptedRef,
    roles: [role],
    dispatch,
    setUser,
    onSuccess: (data) => {
      setLocalMsg({
        type: "success",
        text: "Google signup successful! Redirecting…",
      });
      setTimeout(
        () =>
          navigate(
            data?.isNewUser ? `/onboarding/${role}` : `/dashboard/${role}`,
          ),
        700,
      );
    },
    onError: (text: string) => setLocalMsg({ type: "error", text }),
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
      setLocalMsg({
        type: "error",
        text: "Please accept the terms before continuing with LinkedIn.",
      });
      return;
    }
    if (!role) {
      setLocalMsg({
        type: "error",
        text: "Something went wrong — please refresh and try again.",
      });
      logger.info("LinkedIn SSO blocked — role missing", { role });
      return;
    }
    const url = `${BASE_URL}/auth/linkedin?role=${encodeURIComponent(role)}&termsAccepted=true`;
    logger.info("Redirecting to LinkedIn SSO (register)", { url });
    globalThis.location.href = url;
  };

  const onSubmit = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setLocalMsg({ type: "", text: "" });

    if (!termsAcceptedRef.current)
      return setLocalMsg({
        type: "error",
        text: "Please accept the terms to continue.",
      });

    const result = await dispatch(
      registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        roles: [role],
        termsAccepted: true,
      }),
    );

    if (!registerUser.fulfilled.match(result)) return;

    // One email can now hold multiple roles, so the backend answers with an
    // `outcome` telling us where to send the user rather than a flat error:
    //   created            → brand-new account → verify email → onboarding.
    //   role_added          → this role was added to an existing account.
    //   already_registered  → they already have this role (password matched).
    //   login_required      → email exists but password didn't match → login.
    //
    // For role_added / already_registered the backend auto-logs-in when the
    // email is already verified (loggedIn=true + a session), so we route on
    // `loggedIn` rather than the specific outcome:
    //   • loggedIn      → drop them straight on the dashboard.
    //   • login_required → send to login (can't prove ownership).
    //   • otherwise      → email still needs verifying → verify email page.
    const { outcome, loggedIn, user, accessToken } = result.payload;
    const submittedEmail = data.email.trim();

    // Owner of a verified account (adding a role, or one they already had) →
    // we're logged straight in, so go to the dashboard.
    if (loggedIn && accessToken) {
      const primaryRole = getPrimaryRole(user?.roles) || role;
      dispatch(setUser({ accessToken, user }));
      setAuthRole(primaryRole);
      setRedirecting(true);
      setTimeout(() => navigate(`/dashboard/${primaryRole}`), 800);
      return;
    }

    // Email exists but the password didn't match — we can't prove ownership,
    // so hand them off to login with their email prefilled.
    if (outcome === "login_required") {
      setLocalMsg({
        type: "success",
        text: "You already have an account — taking you to login…",
      });
      setTimeout(
        () =>
          navigate("/login", {
            state: {
              email: submittedEmail,
              notice:
                "You already have an account for this email. Please log in.",
            },
          }),
        900,
      );
      return;
    }

    // "created", or a role added to / already held on an account that still
    // needs to verify its email → send them through email verification, which
    // then lands them on onboarding (see useVerifyEmailPresenter).
    setRedirecting(true);
    setTimeout(
      () =>
        navigate("/verify-email", {
          state: { email: submittedEmail, role },
        }),
      800,
    );
  };

  const togglePasswordVisibility = () => setShowPassword((p) => !p);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((p) => !p);
  const openTermsModal = () => setShowTermsModal(true);
  const closeTermsModal = () => setShowTermsModal(false);
  const goToLogin = () => navigate("/login");
  const handlePasswordBlur = () => setPwTouched(true);
  const handleTermsCheckboxChange = (checked: boolean) => {
    setTermsAccepted(checked);
    termsAcceptedRef.current = checked;
  };

  // Password-strength breakdown, computed here (presenter) so the view just renders it.
  const passwordStrength =
    pwTouched && passwordValue && passwordValue.length > 0
      ? (() => {
          const { rules, passed } = getPasswordValidation(passwordValue);
          return { ...getPasswordStrength(passed), rules, passwordValue };
        })()
      : null;

  return {
    // form
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    onSubmit,
    passwordStrength,
    handlePasswordBlur,
    // ui state
    role,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    localMsg,
    loading,
    redirecting,
    // terms
    showTermsModal,
    openTermsModal,
    closeTermsModal,
    handleTermsAccept,
    termsAccepted,
    handleTermsCheckboxChange,
    // sso
    googleBtnRef,
    handleLinkedIn,
    // navigation
    goToLogin,
  };
};

export default useRegisterPresenter;
