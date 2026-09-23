/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Presenter for the SSOCallback page — owns the LinkedIn OAuth code exchange
// on mount, double-fire guarding, and post-auth navigation. The view
// (views/SSOCallback.tsx) only renders JSX using what this hook returns.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@features/auth/models/authSlice";
import { exchangeLinkedInToken } from "@features/auth/models/auth.api";
import { setAuthRole } from "@lib/http/cookies";
import { getPrimaryRole, getDashboardPath, getOnboardingPath } from "@lib/auth/redirectUtils";
import logger from "@lib/monitoring/logger";
import type { AppDispatch } from "@store/index";

export const useSSOCallbackPresenter = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const code = params.get("code");

    // Do not log sensitive OAuth codes or raw sessionStorage values. Log only presence.

    const state = params.get("state");
    const provider = params.get("provider");

    logger.info("SSOCallback mounted", { provider, hasCode: !!code });

    if (!code || provider !== "linkedin") {
      setError("Invalid callback. Missing code or unsupported provider.");
      return;
    }

    // ── Guard against double-fire (Strict Mode or router remount) ──
    if (sessionStorage.getItem("linkedin_code_used") === code) return;
    sessionStorage.setItem("linkedin_code_used", code);

    let role = null;
    let termsAccepted = false;
    try {
      const payloadB64 = state?.split(".")[0];
      const decoded = JSON.parse(atob(payloadB64 || ""));
      role = decoded.role || null;
      termsAccepted = decoded.termsAccepted === "true" || decoded.termsAccepted === true;
    } catch {
      // state unreadable — proceed without role hint
    }

    const exchange = async () => {
      try {
        const res = await exchangeLinkedInToken({ code, roles: role ? [role] : undefined, termsAccepted });

        sessionStorage.removeItem("linkedin_code_used");

        const { user, isNewUser } = res.data;
        // Was `user?.roles?.includes("mentor") ? "mentor" : "mentee"` — that
        // silently defaulted to mentee even for an account with NO roles at
        // all. getPrimaryRole applies the same mentor > mentee tie-break
        // used everywhere else; "mentee" is kept only as the final fallback
        // for the (expected, LinkedIn-signup) case of a genuinely new user
        // who has no roles yet.
        const resolvedRole = getPrimaryRole(user?.roles) || "mentee";

        dispatch(setUser({ accessToken: res.data.accessToken || null, user })); // ✅
        setAuthRole(resolvedRole);

        navigate(
          isNewUser ? getOnboardingPath(resolvedRole) : getDashboardPath(resolvedRole),
          { replace: true }
        );
      } catch (err: any) {
        sessionStorage.removeItem("linkedin_code_used");
        const msg = err?.response?.data?.message || err.message || "LinkedIn sign-in failed.";
        setError(msg);
      }
    };

    exchange();
  }, []);

  const goToLogin = () => navigate("/login");

  return { error, goToLogin };
};

export default useSSOCallbackPresenter;
