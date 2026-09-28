/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for LoginForm — owns form state, the login API call, Google/LinkedIn
// SSO wiring, and post-auth navigation. The view (views/LoginForm.tsx) only
// renders JSX using what this hook returns.
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { login } from "@features/auth/models/auth.api";
import { setUser } from "@features/auth/models/authSlice";
import useGoogleAuth from "@features/auth/presenters/useGoogleAuth";
import { setAuthRole } from "@lib/http/cookies";
import { getPrimaryRole } from "@lib/auth/redirectUtils";
import { loginSchema } from "@lib/validation/schemas";
import logger from "@lib/monitoring/logger";
import { HTTP_STATUS } from "@lib/http/httpStatus";
import type { AppDispatch } from "@store/index";
import type { RawAuthUser } from "@lib/mappers/userMapper";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

interface UseLoginPresenterArgs {
  registerPath?: string;
  /**
   * Which dashboard this login page targets — set by the mentee/mentor toggle
   * (or a role-specific login page). It only decides WHERE a successful login
   * lands: if the account actually holds this role we enter its dashboard,
   * otherwise we fall back to the account's primary role. It is never sent to
   * the backend — email + password identify the account, not the role.
   */
  role?: string;
}

export const useLoginPresenter = ({ registerPath, role }: UseLoginPresenterArgs) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // The register page routes an existing user here (they already have the
  // role, or the password didn't match) with their email + a short notice,
  // so we prefill the email and surface the reason as a toast.
  const navState = (location.state ?? {}) as { email?: string; notice?: string };
  //this is from react-hook form ,it is basically to manage the entire form
  const {
    //function that connects HTML input to React Hook Form <input {...register("email")} />
    //register('email')~ <input name="email" onChange={...} onBlur={...} ref={...}/>
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: navState.email ?? "",
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

  // Show the "you already have an account" notice once when arriving from the
  // register redirect, then clear it from history so a refresh won't repeat it.
  useEffect(() => {
    if (navState.notice) {
      toast.info(navState.notice);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostAuth = (user: RawAuthUser, accessToken: string) => {
    //saves in the redux
    dispatch(setUser({ accessToken, user }));

    const roles = user?.roles || [];
    
    const chosenRole =
      role && roles.includes(role) ? role : getPrimaryRole(roles);

    //it sets the role in the cookie in this pattern `authRole=${role};path=/;SameSite=Lax`
    if (chosenRole) {
      setAuthRole(chosenRole);
    } else {
      setMsg({ type: "error", text: "No role found. Please register first." });
      return;
    }

    setRedirecting(true);
    setTimeout(() => navigate(`/dashboard/${chosenRole}`), 800);
  };

  useGoogleAuth({
    btnRef: googleBtnRef,
    roles: [],
    dispatch,
    setUser,
    onSuccess: (data) => handlePostAuth(data?.user, data?.accessToken),
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

  //this function is for the email and password submission in the login page

  const onSubmit = async (data: { email: string; password: string }) => {
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
