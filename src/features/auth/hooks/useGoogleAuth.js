/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect, useRef } from "react";
import axiosInstance from "@lib/axiosInstance";
import { setAuthRole } from "@lib/cookies";
import logger from "@lib/logger";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const callbackRef = {
  onSuccess: null,
  onError: null,
  onLoadingChange: null,
  rolesRef: null,
  termsAcceptedRef: null,
  dispatch: null,
  setUser: null,
};
/**
 * Custom hook for google auth.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useGoogleAuth = ({
  btnRef,
  roles,
  termsAcceptedRef,
  onSuccess,
  onError,
  onLoadingChange,
  dispatch,
  setUser,
}) => {
  const rolesRef = useRef(roles);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  callbackRef.onSuccess = onSuccess;
  callbackRef.onError = onError;
  callbackRef.onLoadingChange = onLoadingChange;
  callbackRef.rolesRef = rolesRef;
  callbackRef.termsAcceptedRef = termsAcceptedRef;
  callbackRef.dispatch = dispatch;
  callbackRef.setUser = setUser;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      logger.error("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      onError?.("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      return;
    }

    const initGoogle = () => {
      if (!btnRef.current) return;

      if (!globalThis.__googleInitialized) {
        globalThis.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            const termsAccepted = callbackRef.termsAcceptedRef?.current ?? true;

            if (!termsAccepted) {
              callbackRef.onError?.("Please accept the terms to continue.");
              return;
            }

            try {
              callbackRef.onLoadingChange?.(true);
              logger.info("Google sign-in callback received");

              const res = await axiosInstance.post(`/auth/google`, {
                credential: response.credential,
                roles: callbackRef.rolesRef.current,
                termsAccepted: true,
              });

              const user = res.data?.user;
              const roles = user?.roles || [];

              // ✅ Set authRole cookie so ProtectedRoute works
              const primaryRole = roles.includes("mentor")
                ? "mentor"
                : roles.includes("mentee")
                  ? "mentee"
                  : null;

              if (primaryRole) {
                setAuthRole(primaryRole);
              }

              // ✅ Sync user into Redux (no token needed, it's in httpOnly cookie)
              callbackRef.dispatch?.(
                callbackRef.setUser({
                  accessToken: res.data.accessToken,
                  user: user || null,
                }),
              );

              callbackRef.onSuccess?.(res.data);
            } catch (err) {
              const apiMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Google sign-in failed";
              logger.warn("Google sign-in failed", { error: apiMsg });
              callbackRef.onError?.(apiMsg);
            } finally {
              callbackRef.onLoadingChange?.(false);
            }
          },
        });
        globalThis.__googleInitialized = true;
      }

      btnRef.current.innerHTML = "";
      globalThis.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
      });
    };

      if (globalThis.google) {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(initGoogle, { timeout: 2000 });
      } else {
        setTimeout(initGoogle, 200);
      }
    } else {
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (script) {
        script.addEventListener("load", initGoogle);
        return () => script.removeEventListener("load", initGoogle);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional run-once init; btnRef/onError read via stable callbackRef/ref to avoid re-initializing the Google script on every parent re-render
};

export default useGoogleAuth;
