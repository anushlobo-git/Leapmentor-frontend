import { GoogleIcon, LinkedInIcon } from "./AuthIcons";
import PropTypes from "prop-types";

const AuthSSOButtons = ({ googleBtnRef, loading, disabled, onLinkedIn }) => {
  const isDisabled = loading || disabled;

  return (
    <div className="flex gap-2.5">
      {/* Google */}
      <div className={`flex-1 ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}>
        <div ref={googleBtnRef} className="hidden" />
        <button
          type="button"
          onClick={() => googleBtnRef.current?.querySelector("div[role=button]")?.click()}
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

AuthSSOButtons.propTypes = {
  googleBtnRef: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onLinkedIn: PropTypes.func.isRequired,
};

AuthSSOButtons.defaultProps = {
  disabled: false,
};

export default AuthSSOButtons;
