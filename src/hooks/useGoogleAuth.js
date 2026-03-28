import { useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const useGoogleAuth = ({ btnRef, termsAcceptedRef, roles, onSuccess, onError, onLoadingChange }) => {
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

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            if (termsAcceptedRef && !termsAcceptedRef.current) {
              onError("Please accept the terms to continue.");
              return;
            }
            onLoadingChange?.(true);
            const res = await axios.post(`${BASE_URL}/auth/google`, {
              credential: response.credential,
              roles: rolesRef.current,
              termsAccepted: true,
            });
            if (res.data?.token) localStorage.setItem("token", res.data.token);
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

      btnRef.current.innerHTML = "";
      google.accounts.id.renderButton(btnRef.current, {
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
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        script.addEventListener("load", initGoogle);
        return () => script.removeEventListener("load", initGoogle);
      }
    }
  }, []);
};

export default useGoogleAuth;