// src/pages/SSOSync.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const redirectByRole = (roles, navigate) => {
  if (roles.includes("mentor") && roles.includes("mentee")) {
    navigate("/dashboard/mentor");
  } else if (roles.includes("mentor")) {
    navigate("/dashboard/mentor");
  } else {
    navigate("/dashboard/mentee");
  }
};

const SSOSync = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate("/login?error=sso_failed");
      return;
    }

    const sync = async () => {
      try {
        const clerkToken = await getToken();
        const role = localStorage.getItem("sso_role");
        const termsAccepted = localStorage.getItem("sso_terms") === "true";

        const res = await axios.post(`${BASE_URL}/api/auth/clerk-sso`, {
          clerkToken,
          roles: role && role !== "existing" ? [role] : undefined,
          termsAccepted: role !== "existing" ? termsAccepted : true,
        });

        if (res.data?.token) localStorage.setItem("token", res.data.token);

        localStorage.removeItem("sso_role");
        localStorage.removeItem("sso_terms");

        if (res.data?.isNewUser) {
          // ✅ New user — go to onboarding for intended role
          const onboardingRole = role && role !== "existing"
            ? role
            : res.data.user.roles[0];
          navigate(`/onboarding/${onboardingRole}`);
        } else {
          // ✅ Existing user — use intended role to decide dashboard
          const intendedRole = role && role !== "existing" ? role : null;

          if (intendedRole === "mentee") {
            navigate("/dashboard/mentee");
          } else if (intendedRole === "mentor") {
            navigate("/dashboard/mentor");
          } else {
            // Login flow (role = "existing") — use roles from DB
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