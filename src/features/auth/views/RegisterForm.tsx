/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// View for RegisterForm — pure JSX. All state/logic lives in
// presenters/useRegisterPresenter.ts.
import { useRegisterPresenter } from "@features/auth/presenters/useRegisterPresenter";
import FullScreenLoader from "@components/common/FullScreenLoader";
import AuthSSOButtons from "@features/auth/views/AuthSSOButtons";
import {
  AuthMessageBanner,
  AuthDivider,
  AuthField,
} from "@features/auth/views/AuthUI";
import TermsAndConditionsModal from "@components/ui/TermsAndConditionsModal";
import { getPasswordToggleIcon } from "@lib/auth/passwordIconUtils";

interface RegisterFormProps {
  role: string;
}

const RegisterForm = ({ role }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    isSubmitting,
    onSubmit,
    passwordStrength,
    handlePasswordBlur,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    localMsg,
    loading,
    redirecting,
    showTermsModal,
    openTermsModal,
    closeTermsModal,
    handleTermsAccept,
    termsAccepted,
    handleTermsCheckboxChange,
    googleBtnRef,
    handleLinkedIn,
    goToLogin,
  } = useRegisterPresenter({ role });

  return (
    <>
      {redirecting && <FullScreenLoader message="Setting up your account…" />}

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
        Register as {role === "mentor" ? "Mentor" : "Mentee"}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {role === "mentor"
          ? "Create your mentor account to start making an impact."
          : "Create your mentee account to start growing."}
      </p>

      {localMsg.type === "error" && (
        <AuthMessageBanner type="error" text={localMsg.text} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <AuthField
            label="Full Name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            placeholder="John Doe"
          />
          {errors.name && (
            <span id="name-error" role="alert" className="text-red-600 text-xs">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <AuthField
            label="Email Address"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="name@company.com"
          />
          {errors.email && (
            <span
              id="email-error"
              role="alert"
              className="text-red-600 text-xs"
            >
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-password"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              id="register-password"
              type={showPassword ? "text" : "password"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              onBlur={handlePasswordBlur}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {getPasswordToggleIcon(showPassword)}
            </button>
          </div>

          {passwordStrength && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: passwordStrength.width,
                      height: "100%",
                      background: passwordStrength.color,
                      borderRadius: "999px",
                      transition: "width 0.3s ease, background 0.3s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: passwordStrength.color,
                  }}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {passwordStrength.rules.map((rule: { id: string; label: string; test: (v: string) => boolean }) => {
                  const rulePassed = rule.test(passwordStrength.passwordValue);
                  return (
                    <div
                      key={rule.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          color: rulePassed ? "#22c55e" : "#cbd5e1",
                          fontSize: "12px",
                        }}
                      >
                        {rulePassed ? "✓" : "○"}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: rulePassed ? "#16a34a" : "#94a3b8",
                          fontWeight: rulePassed ? "600" : "400",
                        }}
                      >
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {errors.password && (
                <span
                  id="password-error"
                  role="alert"
                  className="text-red-600 text-xs mt-1"
                >
                  {errors.password.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-semibold text-slate-600 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
            >
              {getPasswordToggleIcon(showConfirmPassword)}
            </button>
          </div>
          {errors.confirmPassword && (
            <span
              id="confirmPassword-error"
              role="alert"
              className="text-red-600 text-xs"
            >
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            checked={termsAccepted}
            onChange={(e: any) => handleTermsCheckboxChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-900 shrink-0 cursor-pointer"
          />
          <label
            htmlFor="termsAccepted"
            className="text-sm text-slate-600 leading-relaxed"
          >
            I agree to the{" "}
            <button
              type="button"
              onClick={openTermsModal}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal"
            >
              Terms
            </button>
            {" and "}
            <button
              type="button"
              onClick={openTermsModal}
              className="text-blue-900 underline cursor-pointer bg-transparent border-none p-0 text-sm font-normal"
            >
              Privacy Policy
            </button>
            {"."}
          </label>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting || loading || !termsAccepted}
          className="w-full bg-blue-900 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-2.5 mt-1 transition-colors"
        >
          {loading || isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />{" "}
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <AuthDivider />

      <div className="relative">
        <AuthSSOButtons
          googleBtnRef={googleBtnRef}
          loading={loading}
          disabled={!termsAccepted}
          onLinkedIn={handleLinkedIn}
        />
      </div>

      <p className="text-sm text-slate-500 text-center mt-5">
        Already have an account?{" "}
        <button
          type="button"
          className="text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0"
          onClick={goToLogin}
        >
          Login
        </button>
      </p>

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={closeTermsModal}
        onAccept={handleTermsAccept}
        role={role}
        termsAccepted={termsAccepted}
      />
    </>
  );
};
export default RegisterForm;
