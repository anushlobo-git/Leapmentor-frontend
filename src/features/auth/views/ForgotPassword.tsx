/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// View for the ForgotPassword page — pure JSX. All state/logic lives in
// presenters/useForgotPasswordPresenter.ts.
import { useForgotPasswordPresenter } from "@features/auth/presenters/useForgotPasswordPresenter";
import FullScreenLoader from "@components/common/FullScreenLoader";
import { IMAGES } from "@constants/images";
import { getPasswordToggleIcon } from "@lib/auth/passwordIconUtils";

const ForgotPassword = () => {
  const {
    STEPS,
    step,
    stepMeta,
    getStepDotClass,
    loading,
    msg,
    redirecting,
    email,
    setEmail,
    handleSendOTP,
    otp,
    otpKeysRef,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleVerifyOTP,
    handleResendOTP,
    newPassword,
    handleNewPasswordChange,
    handleNewPasswordBlur,
    showPw,
    togglePwVisibility,
    confirmPassword,
    setConfirmPassword,
    showConfirmPw,
    toggleConfirmPwVisibility,
    passwordStrength,
    handleResetPassword,
    goToLogin,
  } = useForgotPasswordPresenter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {redirecting && <FullScreenLoader message="Redirecting to login..." />}

      <div className="w-full max-w-sm">
        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <img
            src={IMAGES.LOGO}
            alt="LeapMentor logo"
            className="h-8 w-8"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            LeapMentor
          </span>
        </div>

        {/* ── Step progress dots ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s: number) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${getStepDotClass(s, step)}`}
            />
          ))}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            {stepMeta[step].title}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {stepMeta[step].subtitle}
          </p>

          {/* Message banner */}
          {msg.text && (
            <div
              className={`mb-5 text-sm rounded-xl px-4 py-3 border ${
                msg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-password-email"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {"Sending..."}
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div
                className="flex gap-2 justify-between"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx: number) => (
                  <input
                    key={otpKeysRef.current[idx]}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e: any) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e: any) => handleOtpKeyDown(e, idx)}
                    className="w-11 h-12 text-center text-lg font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-900 focus:ring-4 focus:ring-blue-50 transition-all duration-150 text-slate-800"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {"Verifying..."}
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Didn't get it?{" "}
                <button
                  type="button"
                  className="text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0 align-baseline"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </button>
              </p>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEPS.PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="forgot-password-new"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="forgot-password-new"
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e: any) => handleNewPasswordChange(e.target.value)}
                    onBlur={handleNewPasswordBlur}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={togglePwVisibility}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {getPasswordToggleIcon(showPw)}
                  </button>
                </div>
                {/* ← relative closes here */}

                {/* Strength bar — outside relative, inside New Password div */}
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
                      {passwordStrength.rules.map((rule: { id: string; label: string; test: (v: string) => boolean }) => (
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
                              color: rule.test(passwordStrength.newPassword)
                                ? "#22c55e"
                                : "#cbd5e1",
                              fontSize: "12px",
                            }}
                          >
                            {rule.test(passwordStrength.newPassword) ? "✓" : "○"}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: rule.test(passwordStrength.newPassword)
                                ? "#16a34a"
                                : "#94a3b8",
                              fontWeight: rule.test(passwordStrength.newPassword)
                                ? "600"
                                : "400",
                            }}
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* ← New Password div closes here */}

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="forgot-password-confirm"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="forgot-password-confirm"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPwVisibility}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {getPasswordToggleIcon(showConfirmPw)}
                  </button>
                </div>
              </div>
              {/* ← Confirm Password div closes here */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {"Resetting..."}
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to login */}
        <p className="text-sm text-slate-600 text-center mt-6">
          Remember your password?{" "}
          <button
            type="button"
            className="text-blue-900 font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0 align-baseline"
            onClick={goToLogin}
          >
            Back to Login
          </button>
        </p>
      </div>
    </main>
  );
};

export default ForgotPassword;
