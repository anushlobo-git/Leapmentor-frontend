// src/components/auth/AuthSSOButtons.jsx
import { GoogleIcon, LinkedInIcon, AppleIcon } from "./AuthIcons";

/**
 * Reusable SSO button row (Google, LinkedIn, Apple).
 *
 * Props:
 *  - googleBtnRef   : ref forwarded to the hidden Google button div
 *  - loading        : boolean — disables all buttons when true
 *  - clerkLoaded    : boolean — disables LinkedIn/Apple until Clerk is ready
 *  - onLinkedIn     : click handler for LinkedIn
 *  - onApple        : click handler for Apple
 */
const AuthSSOButtons = ({ googleBtnRef, loading, clerkLoaded, onLinkedIn, onApple }) => {
  return (
    <div className="flex gap-2.5">
      {/* Google */}
      <div className={`flex-1 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
        <div ref={googleBtnRef} className="hidden" />
        <button
          type="button"
          onClick={() => googleBtnRef.current?.querySelector("div[role=button]")?.click()}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 transition-colors"
        >
          <GoogleIcon />
          Google
        </button>
      </div>

      {/* LinkedIn */}
      <button
        type="button"
        onClick={onLinkedIn}
        disabled={loading || !clerkLoaded}
        className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <LinkedInIcon />
        LinkedIn
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={onApple}
        disabled={loading || !clerkLoaded}
        className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <AppleIcon />
        Apple
      </button>
    </div>
  );
};

export default AuthSSOButtons;