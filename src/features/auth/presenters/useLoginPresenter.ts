/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for LoginForm — owns form state, the login API call, Google/LinkedIn
// SSO wiring, and post-auth navigation. The view (views/LoginForm.tsx) only
// renders JSX using what this hook returns.
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@features/auth/models/auth.api";
import { setUser } from "@features/auth/models/authSlice";
import useGoogleAuth from "@features/auth/presenters/useGoogleAuth";
import { setAuthRole } from "@lib/http/cookies";
import { loginSchema } from "@lib/validation/schemas";
import logger from "@lib/monitoring/logger";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import type { AppDispatch } from "@store/index";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Sonar (S3358): nested ternaries are hard to read, so this resolves the
// user's primary role as an independent, linear statement instead.
const getPrimaryRole = (roles: string[]) => {
  if (roles.includes("mentor")) return "mentor";
  if (roles.includes("mentee")) return "mentee";
  return null;
};

interface UseLoginPresenterArgs {
  registerPath?: string;
}

export const useLoginPresenter = ({ registerPath }: UseLoginPresenterArgs) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const googleBtnRef = useRef<HTMLDivElement>(null);

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
  const [msg, setMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  const handlePostAuth = (user: any, accessToken: string) => {
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
    onSuccess: (data: any) => handlePostAuth(data?.user, data?.accessToken),
    onError: (text: string) => setMsg({ type: "error", text }),
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

  const onSubmit = async (data: { email: string; password: string }) => {
    setMsg({ type: "", text: "" });
    try {
      setLoading(true);
      const res = await login(data.email.trim(), data.password);

      handlePostAuth(res.data?.user, res.data?.accessToken);
    } catch (err: any) {
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

  const togglePasswordVisibility = () => setShowPw((p) => !p);
  const goToForgotPassword = () => navigate("/forgot-password");
  const goToRegister = () => navigate(registerPath || "/register");

  return {
    // form
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    onSubmit,
    // ui state
    showPw,
    togglePasswordVisibility,
    loading,
    msg,
    redirecting,
    // sso
    googleBtnRef,
    handleLinkedIn,
    // navigation
    goToForgotPassword,
    goToRegister,
  };
};

export default useLoginPresenter;
