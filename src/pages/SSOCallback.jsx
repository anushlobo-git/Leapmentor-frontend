// src/pages/SSOCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SSOCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

     console.log("SSOCallback mounted, code:", code?.slice(0, 10));
  console.log("sessionStorage value:", sessionStorage.getItem("linkedin_code_used")?.slice(0, 10));
  
    const state = params.get("state");
    const provider = params.get("provider");

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
      const payloadB64 = state.split(".")[0];
      const decoded = JSON.parse(atob(payloadB64));
      role = decoded.role || null;
      termsAccepted = decoded.termsAccepted === "true" || decoded.termsAccepted === true;
    } catch {
      // state unreadable — proceed without role hint
    }

    const exchange = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/auth/linkedin/token`, {
          code,
          roles: role ? [role] : undefined,
          termsAccepted,
        });

        sessionStorage.removeItem("linkedin_code_used");  // cleanup on success

        const { token, user, isNewUser } = res.data;

        localStorage.setItem("token", token);

        const resolvedRole = user?.roles?.includes("mentor") ? "mentor" : "mentee";
        localStorage.setItem("role", resolvedRole);

        dispatch(setUser({ token, user }));

        await new Promise((r) => setTimeout(r, 50));

        if (isNewUser) {
          navigate(`/onboarding/${resolvedRole}`, { replace: true });
        } else {
          navigate(`/dashboard/${resolvedRole}`, { replace: true });
        }
      } catch (err) {
        sessionStorage.removeItem("linkedin_code_used");  // cleanup on failure
        const msg = err?.response?.data?.message || err.message || "LinkedIn sign-in failed.";
        setError(msg);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    };

    exchange();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            className="mt-4 underline text-sm text-slate-600 hover:text-slate-800"
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
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Completing sign in…</p>
      </div>
    </div>
  );
};

export default SSOCallback;