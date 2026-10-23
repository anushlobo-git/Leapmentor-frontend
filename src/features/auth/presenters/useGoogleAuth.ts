/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect, useRef } from "react";
import type React from "react";
import { googleAuthRequest } from "@features/auth/models/auth.api";
import { setUser as setUserAction } from "@features/auth/models/authSlice";
import logger from "@lib/monitoring/logger";
import type { AppDispatch } from "@store/index";
import type { RawAuthUser } from "@lib/mappers/userMapper";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Payload handed to the SSO success callback from the backend auth response. */
interface SSOAuthResult {
  user?: RawAuthUser;
  accessToken?: string;
  isNewUser?: boolean;
}

interface GoogleAuthError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme: string;
          size: string;
          width: number;
          text: string;
        },
      ) => void;
    };
  };
}

declare global {
  var __googleInitialized: boolean | undefined;
  var google: GoogleIdentityServices | undefined;
}

const isTransientGoogleAuthError = (error: unknown): boolean => {
  const authError = error as GoogleAuthError;
  const status = authError.response?.status;

  return (
    authError.code === "ERR_NETWORK" ||
    authError.code === "ECONNABORTED" ||
    status === 408 ||
    status === 429 ||
    (typeof status === "number" && status >= 500)
  );
};

const getGoogleAuthErrorMessage = (error: unknown): string => {
  const authError = error as GoogleAuthError;
  return (
    authError.response?.data?.message ||
    authError.response?.data?.error ||
    authError.message ||
    "Google sign-in failed"
  );
};

const callbackRef: {
  onSuccess: ((data: SSOAuthResult) => void) | null;
  onError: ((message: string) => void) | null;
  onLoadingChange: ((loading: boolean) => void) | null;
  rolesRef: { current: string[] } | null;
  termsAcceptedRef: React.RefObject<boolean> | null | undefined;
  dispatch: AppDispatch | null;
  setUser: typeof setUserAction | null;
} = {
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
}: {
  btnRef: React.RefObject<HTMLDivElement | null>;
  roles: string[];
  termsAcceptedRef?: React.RefObject<boolean> | null;
  onSuccess: (data: SSOAuthResult) => void;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  dispatch: AppDispatch;
  setUser: typeof setUserAction;
}) => {
  const rolesRef = useRef(roles);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  callbackRef.onSuccess = onSuccess;
  callbackRef.onError = onError;
  callbackRef.onLoadingChange = onLoadingChange ?? null;
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
      const google = globalThis.google;
      if (!google) return;

      if (!globalThis.__googleInitialized) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: GoogleCredentialResponse) => {
            const termsAccepted = callbackRef.termsAcceptedRef?.current ?? true;

            if (!termsAccepted) {
              callbackRef.onError?.("Please accept the terms to continue.");
              return;
            }

            try {
              callbackRef.onLoadingChange?.(true);
              logger.info("Google sign-in callback received");

              const request = {
                credential: response.credential,
                 roles: callbackRef.rolesRef?.current ?? [],
                termsAccepted: true,
              };

              let res;
              try {
                res = await googleAuthRequest(request);
              } catch (error) {
                if (!isTransientGoogleAuthError(error)) throw error;

                logger.warn("Google sign-in failed — retrying once", {
                  error: getGoogleAuthErrorMessage(error),
                });
                res = await googleAuthRequest(request);
              }

              const user = res.data?.user;
              // Sync the authenticated user and derived role into Redux. The
              // auth slice derives the role from this trusted API payload.
               if (callbackRef.dispatch && callbackRef.setUser) {
                 callbackRef.dispatch(
                   callbackRef.setUser({
                     accessToken: res.data.accessToken,
                     user: user || null,
                   }),
                 );
               }

              callbackRef.onSuccess?.(res.data);
            } catch (err) {
              const apiMsg = getGoogleAuthErrorMessage(err);
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
      google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
      });
    };

    if (globalThis.google) {
      if ("requestIdleCallback" in globalThis) {
        globalThis.requestIdleCallback(initGoogle, { timeout: 2000 });
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
