import { useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ✅ Store callbacks outside the hook so they stay fresh
// but initialize() is only called once
const callbackRef = {
  onSuccess: null,
  onError: null,
  onLoadingChange: null,
  termsAcceptedRef: null,
  rolesRef: null,
};

const useGoogleAuth = ({
  btnRef,
  termsAcceptedRef,
  roles,
  onSuccess,
  onError,
  onLoadingChange,
}) => {
  const rolesRef = useRef(roles);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  // ✅ Always keep the global callbackRef up to date
  // This way even though initialize() runs once, it always
  // calls the latest onSuccess/onError from whichever page is active
  callbackRef.onSuccess = onSuccess;
  callbackRef.onError = onError;
  callbackRef.onLoadingChange = onLoadingChange;
  callbackRef.termsAcceptedRef = termsAcceptedRef;
  callbackRef.rolesRef = rolesRef;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      return;
    }

    const initGoogle = () => {
      if (!btnRef.current) return;

      // ✅ Only initialize once for the entire app lifetime
      if (!window.__googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            // ✅ Always reads from callbackRef — never stale
            try {
              if (
                callbackRef.termsAcceptedRef &&
                !callbackRef.termsAcceptedRef.current
              ) {
                callbackRef.onError("Please accept the terms to continue.");
                return;
              }
              callbackRef.onLoadingChange?.(true);
              const res = await axios.post(`${BASE_URL}/auth/google`, {
                credential: response.credential,
                roles: callbackRef.rolesRef.current,
                termsAccepted: true,
              });
              if (res.data?.token)
                localStorage.setItem("token", res.data.token);
              callbackRef.onSuccess(res.data);
            } catch (err) {
              const apiMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Google authentication failed";
              callbackRef.onError(apiMsg);
            } finally {
              callbackRef.onLoadingChange?.(false);
            }
          },
        });
        window.__googleInitialized = true;
      }

      // ✅ Always re-render button — safe to call multiple times
      btnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
      });
    };

    if (window.google) {
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
  }, []);
};

export default useGoogleAuth;
