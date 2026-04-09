// src/pages/SSOSync.jsx
// Google users are handled entirely in useGoogleAuth.js and never land here.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const redirectByRole = (roles, navigate) => {
  if (roles.includes("mentor")) {
    localStorage.setItem("role", "mentor");  //  add
    navigate("/dashboard/mentor");
  } else {
    localStorage.setItem("role", "mentee");  //  add
    navigate("/dashboard/mentee");
  }
};

const SSOSync = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    // FIX: If there's already a token in localStorage it means the user
    // came from Google SSO (not Clerk/LinkedIn). Redirect them away immediately
    // so they don't hit getToken() which would return null and cause "invalid token".
    const existingToken = localStorage.getItem("token");
    if (existingToken && !isSignedIn) {
  const role = localStorage.getItem("role");     //read existing role
  navigate(role === "mentor" ? "/dashboard/mentor" : "/dashboard/mentee", { replace: true });
  return;
}

    if (!isSignedIn) {
      navigate("/login?error=sso_failed", { replace: true });
      return;
    }

    const sync = async () => {
      try {
        const clerkToken = await getToken();

        // ✅ FIX: If Clerk token is null, don't hit the backend — it will fail
        if (!clerkToken) {
          setError("Authentication failed. Please try logging in again.");
          return;
        }

        const role = localStorage.getItem("sso_role");
        const termsAccepted = localStorage.getItem("sso_terms") === "true";

        const res = await axios.post(`${BASE_URL}/auth/clerk-sso`, {
          clerkToken,
          roles: role && role !== "existing" ? [role] : undefined,
          termsAccepted: role !== "existing" ? termsAccepted : true,
        });

        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);

          // ✅ Sync token + user into Redux so onboarding slices can read it
          dispatch(setUser({
            token: res.data.token,
            user: res.data.user || null,
          }));

          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        localStorage.removeItem("sso_role");
        localStorage.removeItem("sso_terms");

        if (res.data?.isNewUser) {
          const onboardingRole = role && role !== "existing"
            ? role
            : res.data.user.roles[0];
          navigate(`/onboarding/${onboardingRole}`, { replace: true });
        } else {
          const intendedRole = role && role !== "existing" ? role : null;

          if (intendedRole === "mentee") {
  localStorage.setItem("role", "mentee");        // 👈 add
  navigate("/dashboard/mentee", { replace: true });
} else if (intendedRole === "mentor") {
  localStorage.setItem("role", "mentor");        // 👈 add
  navigate("/dashboard/mentor", { replace: true });
} else {
  redirectByRole(res.data?.user?.roles || [], navigate);
}
        }

      } catch (err) {
        setError(err?.response?.data?.message || err.message || "SSO failed");
        localStorage.removeItem("sso_role");
        localStorage.removeItem("sso_terms");
      }
    };

    sync();
  }, [isLoaded, isSignedIn]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            className="mt-4 underline text-sm"
            onClick={() => navigate("/login")}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Completing sign in...</p>
    </div>
  );
};

export default SSOSync;