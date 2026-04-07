import { useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Store callbacks outside the hook so they stay fresh across re-renders
// but initialize() is only called once per app lifetime
const callbackRef = {
  onSuccess: null,
  onError: null,
  onLoadingChange: null,
  rolesRef: null,
  termsAcceptedRef: null, 
  dispatch: null,
  setUser: null,
};

const useGoogleAuth = ({
  btnRef,
  roles,
  termsAcceptedRef, // ✅ FIX 1: now properly received and used
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

  // Always keep the global callbackRef up to date so the frozen
  // Google callback always calls the latest handlers
  callbackRef.onSuccess = onSuccess;
  callbackRef.onError = onError;
  callbackRef.onLoadingChange = onLoadingChange;
  callbackRef.rolesRef = rolesRef;
  callbackRef.termsAcceptedRef = termsAcceptedRef;
  callbackRef.dispatch = dispatch; 
callbackRef.setUser = setUser;  

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError?.("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      return;
    }

    const initGoogle = () => {
      if (!btnRef.current) return;

      // Only initialize once for the entire app lifetime
      if (!window.__googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            //  FIX 1: Read termsAccepted from the live ref, not hardcoded true
const termsAccepted = callbackRef.termsAcceptedRef?.current ?? true;

            // FIX 2: Validate terms before hitting the backend
            if (!termsAccepted) {
              callbackRef.onError?.("Please accept the terms to continue.");
              return;
            }

            try {
              callbackRef.onLoadingChange?.(true);

              const res = await axios.post(`${BASE_URL}/auth/google`, {
                credential: response.credential,
                roles: callbackRef.rolesRef.current,
                termsAccepted: true,
              });

              // ✅ FIX 3: Store token BEFORE calling onSuccess so the
              // dashboard never fires API calls without a token
              if (res.data?.token) {
                localStorage.setItem("token", res.data.token);

                // ✅ Add this line — sync token into Redux so slices can read it
callbackRef.dispatch?.(callbackRef.setUser({ token: res.data.token, user: res.data.user || null }));

                await new Promise((resolve) => setTimeout(resolve, 50));
              }

              callbackRef.onSuccess?.(res.data);
            } catch (err) {
              const apiMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Google authentication failed";
              callbackRef.onError?.(apiMsg);
            } finally {
              callbackRef.onLoadingChange?.(false);
            }
          },
        });
        window.__googleInitialized = true;
      }

      // Always re-render the button — safe to call multiple times
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