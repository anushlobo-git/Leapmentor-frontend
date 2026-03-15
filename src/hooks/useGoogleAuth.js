// src/hooks/useGoogleAuth.js
import { useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const useGoogleAuth = ({ btnRef, termsAcceptedRef, roles, onSuccess, onError, onLoadingChange }) => {
  const initializedRef = useRef(false);
  const rolesRef = useRef(roles);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError("Missing VITE_GOOGLE_CLIENT_ID in frontend .env");
      return;
    }

    const initGoogle = () => {
      if (!btnRef.current) return;

      /* global google */
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            // Check terms via ref — never stale
            if (termsAcceptedRef && !termsAcceptedRef.current) {
              onError("Please accept the terms, then continue with Google.");
              return;
            }

            onLoadingChange?.(true);

            const res = await axios.post(`${BASE_URL}/api/auth/google`, {
              credential: response.credential,
              roles,
              termsAccepted: true,
            });

            if (res.data?.token) localStorage.setItem("token", res.data.token);
            console.log("✅ Google auth successful!", res.data);
            onSuccess(res.data);
          } catch (err) {
            const apiMsg =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Google authentication failed";
            onError(apiMsg);
          } finally {
            onLoadingChange?.(false);
          }
        },
      });

      if (!initializedRef.current) {
        google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 400,
          text: "continue_with",
        });
        initializedRef.current = true;
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener("load", initGoogle);
      return () => script?.removeEventListener("load", initGoogle);
    }
  }, []);
};

export default useGoogleAuth;