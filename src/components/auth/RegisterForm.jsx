// src/components/auth/RegisterForm.jsx
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSignIn, useClerk } from "@clerk/clerk-react";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import { registerUser, clearMessages } from "../../store/slices/authSlice";

import AuthSSOButtons from "./AuthSSOButtons";
import { AuthMessageBanner, AuthDivider, AuthField, AuthBrand } from "./AuthUI";
import { LeapMentorLogo } from "./AuthIcons";
import TermsAndConditionsModal from "../../ui/TermsAndConditionsModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CLERK_STRATEGY = {
  linkedin: "oauth_linkedin_oidc",
  apple:    "oauth_apple",
};

const RegisterForm = ({ role }) => {
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const { signOut } = useClerk();
  const { signIn, isLoaded: clerkLoaded } = useSignIn();

  const googleBtnRef     = useRef(null);
  const termsAcceptedRef = useRef(false);

  const { loading, error, successMsg } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "", email: "", password: "", termsAccepted: false,
  });
  const [showPassword,  setShowPassword]  = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [localMsg, setLocalMsg] = useState({ type: "", text: "" });

  // Sync Redux error/success into localMsg for display
  useEffect(() => {
    if (error)      setLocalMsg({ type: "error",   text: error });
    if (successMsg) setLocalMsg({ type: "success", text: successMsg });
  }, [error, successMsg]);

  // Clear Redux messages on unmount
  useEffect(() => {
    return () => dispatch(clearMessages());
  }, [dispatch]);

  useGoogleAuth({
    btnRef: googleBtnRef,
    termsAcceptedRef,
    roles: [role],
    onSuccess: (data) => {
      setLocalMsg({ type: "success", text: "Google signup successful! Redirecting..." });
      setTimeout(() => navigate(data?.isNewUser ? `/onboarding/${role}` : `/dashboard/${role}`), 700);
    },
    onError: (text) => setLocalMsg({ type: "error", text }),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "termsAccepted") termsAcceptedRef.current = checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTermsAccept = () => {
    termsAcceptedRef.current = true;
    setForm((prev) => ({ ...prev, termsAccepted: true }));
    setShowTermsModal(false);
    setLocalMsg({ type: "", text: "" });
  };

  const handleTermsClose = () => setShowTermsModal(false);

  const handleClerkSSO = async (provider) => {
    if (!form.termsAccepted) return setLocalMsg({ type: "error", text: "Please accept the terms to continue." });
    if (!clerkLoaded) return;
    try {
      await signOut({ redirectUrl: window.location.href });
      localStorage.setItem("sso_role",  role);
      localStorage.setItem("sso_terms", "true");
      await signIn.authenticateWithRedirect({
        strategy:            CLERK_STRATEGY[provider],
        redirectUrl:         `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/sso-callback-sync`,
      });
    } catch (err) {
      localStorage.removeItem("sso_role");
      localStorage.removeItem("sso_terms");
      setLocalMsg({ type: "error", text: err.message || "SSO failed. Try again." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalMsg({ type: "", text: "" });
    if (!form.termsAccepted) return setLocalMsg({ type: "error", text: "Please accept the terms to continue." });

    const result = await dispatch(registerUser({
      name:          form.name.trim(),
      email:         form.email.trim(),
      password:      form.password,
      roles:         [role],
      termsAccepted: true,
    }));

    if (registerUser.fulfilled.match(result)) {
      if (!result.payload?.isNewUser) {
        return setLocalMsg({ type: "error", text: "Email already exists. Please login instead." });
      }
      setTimeout(() => navigate("/verify-email", {
        state: { email: form.email.trim(), role },
      }), 800);
    }
  };

  return (
    <>
      <AuthBrand logo={<LeapMentorLogo />} />

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
        Register as {role === "mentor" ? "Mentor" : "Mentee"}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {role === "mentor"
          ? "Create your LeapMentor mentor account to start making an impact."
          : "Create your LeapMentor mentee account to start growing."}
      </p>

      <AuthMessageBanner type={localMsg.type} text={localMsg.text} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
        <AuthField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="name@company.com"
          required
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-11 text-sm text-slate-900 bg-white outline-none focus:border-blue-900 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base bg-transparent border-none cursor-pointer p-0 leading-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p className="text-xs text-slate-400">Minimum 6 characters with a mix of letters and numbers.</p>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 accent-blue-900 shrink-0 cursor-pointer"
          />
          <span className="text-sm text-slate-600 leading-relaxed">
            I agree to the{" "}
            <button type="button" onClick={() => setShowTermsModal(true)}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal">
              Terms
            </button>{" "}
            and{" "}
            <button type="button" onClick={() => setShowTermsModal(true)}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal">
              Privacy Policy
            </button>.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-2.5 mt-1 transition-colors"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <AuthDivider />

      <AuthSSOButtons
        googleBtnRef={googleBtnRef}
        loading={loading}
        clerkLoaded={clerkLoaded}
        onLinkedIn={() => handleClerkSSO("linkedin")}
        onApple={() => handleClerkSSO("apple")}
      />

      <p className="text-sm text-slate-500 text-center mt-5">
        Already have an account?{" "}
        <span
          className="text-blue-900 font-semibold cursor-pointer hover:underline"
          onClick={() => navigate(`/login/${role}`)}
        >
          Login
        </span>
      </p>

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={handleTermsClose}
        onAccept={handleTermsAccept}
        role={role}
      />
    </>
  );
};

export default RegisterForm;