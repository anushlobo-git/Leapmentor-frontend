import { GoogleIcon, LinkedInIcon } from "@features/auth/views/AuthIcons";
import type { RefObject } from "react";

interface AuthSSOButtonsProps {
  googleBtnRef: RefObject<HTMLDivElement>;
  loading: boolean;
  disabled?: boolean;
  onLinkedIn: () => void;
}

const AuthSSOButtons = ({ googleBtnRef, loading, disabled = false, onLinkedIn }: AuthSSOButtonsProps) => {
  const isDisabled = loading || disabled;

  return (
    <div className="flex gap-2.5">
      {/* Google */}
      <div className={`flex-1 ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}>
        <div ref={googleBtnRef} className="hidden" />
        <button
          type="button"
          onClick={() => (googleBtnRef.current?.querySelector("div[role=button]") as HTMLElement | null)?.click()}
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <GoogleIcon />
          Google
        </button>
      </div>

      {/* LinkedIn */}
      <button
        type="button"
        onClick={onLinkedIn}
        disabled={isDisabled}
        className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <LinkedInIcon />
        LinkedIn
      </button>
    </div>
  );
};

export default AuthSSOButtons;
