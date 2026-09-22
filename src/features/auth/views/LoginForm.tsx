/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// View for LoginForm — pure JSX. All state/logic lives in
// presenters/useLoginPresenter.ts.
import { useLoginPresenter } from "@features/auth/presenters/useLoginPresenter";
import AuthSSOButtons from "@features/auth/views/AuthSSOButtons";
import { AuthBrand } from "@features/auth/views/AuthUI";
import { LeapMentorLogo } from "@features/auth/views/AuthIcons";
import FullScreenLoader from "@components/shared/FullScreenLoader";
import { getPasswordToggleIcon } from "@lib/auth/passwordIconUtils";

interface LoginFormProps {
  placeholder?: string;
  registerPath?: string;
}

const LoginForm = ({ placeholder, registerPath }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    onSubmit,
    showPw,
    togglePasswordVisibility,
    loading,
    msg,
    redirecting,
    googleBtnRef,
    handleLinkedIn,
    goToForgotPassword,
    goToRegister,
  } = useLoginPresenter({ registerPath });

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {redirecting && <FullScreenLoader message="Redirecting to dashboard…" />}

      <AuthBrand logo={<LeapMentorLogo />} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
          Login
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Enter your credentials to securely access your account.
        </p>
      </div>

      {msg.type === "error" && msg.text && (
        <div className="mb-5 text-sm rounded-xl px-4 py-3 border bg-red-50 text-red-600 border-red-200">
          {msg.text}
        </div>
      )}

      {/*
      you can write the function for the form submit like this
      function onSubmit(data){...}
      and the data is the object that will have all the input fields such as
      {email:.....,
      password:....}
      */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            id="login-email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder={placeholder || "you@example.com"}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150 placeholder:text-slate-400"
          />
          {/* if there is any mistake that u have done then the error object is created */}
          {errors.email && (
            <span
              id="email-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="login-password"
              type={showPw ? "text" : "password"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {getPasswordToggleIcon(showPw)}
            </button>
          </div>
          {/* if there is any mistake that u have done then the error object is created */}
          {errors.password && (
            <span
              id="password-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.password.message}
            </span>
          )}
          <div className="text-right mt-1.5">
            <button
              type="button"
              onClick={goToForgotPassword}
              className="text-xs text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0"
            >
              Forgot password? Click here
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || loading}
          className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm shadow-blue-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading || isSubmitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
              Logging in…
            </>
          ) : (
            <>
              Login to Dashboard
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs font-semibold text-slate-500">
          Or continue with
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      <AuthSSOButtons
        googleBtnRef={googleBtnRef}
        loading={loading}
        onLinkedIn={handleLinkedIn}
      />

      <p className="text-sm text-slate-500 text-center mt-8">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0"
          onClick={goToRegister}
        >
          Register here
        </button>
      </p>
    </div>
  );
};
export default LoginForm;
