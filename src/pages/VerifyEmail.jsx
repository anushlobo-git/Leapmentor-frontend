// src/pages/VerifyEmail.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyEmail, verifyMagicLink, clearMessages } from "../store/slices/authSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { loading, sending, error, successMsg } = useSelector((state) => state.auth);

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // local msg mirrors redux messages for timed transitions
  const [msg, setMsg] = useState({ type: "", text: "" });

  const role = location.state?.role || "mentor";
  const loginPath = role === "mentee" ? "/login/mentee" : "/login/mentor";

  const hasSentRef = useRef(false);
  const hasVerifiedRef = useRef(false);

  // sync redux messages → local msg
  useEffect(() => {
    if (error)      setMsg({ type: "error",   text: error });
    if (successMsg) setMsg({ type: "success", text: successMsg });
  }, [error, successMsg]);

  // ── Magic link auto-verify ────────────────────────────────
  useEffect(() => {
    const token      = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (token && emailParam && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      setEmail(emailParam);
      dispatch(clearMessages());
      setMsg({ type: "", text: "" });

      dispatch(verifyMagicLink({ token, email: emailParam })).then((action) => {
        if (verifyMagicLink.fulfilled.match(action)) {
          setMsg({ type: "success", text: "Email verified! Redirecting to login..." });
          setTimeout(() => navigate(loginPath), 1500);
        } else {
          setMsg({ type: "error", text: action.payload || "Magic link verification failed." });
        }
      });
    }
  }, []);

  // ── Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });
    if (!email.trim()) {
      setMsg({ type: "error", text: "Please enter your email first." });
      return;
    }
    const action = await dispatch(sendOtp({ email }));
    if (sendOtp.fulfilled.match(action)) {
      setMsg({ type: "success", text: "OTP sent to your email." });
    } else {
      setMsg({ type: "error", text: action.payload || "Failed to send OTP." });
    }
  };

  // ── Auto-send OTP on mount ────────────────────────────────
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token && location.state?.email && !hasSentRef.current) {
      hasSentRef.current = true;
      handleSendOtp();
    }
  }, []);

  // ── OTP box helpers ───────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`votp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`votp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("votp-5")?.focus();
    }
    e.preventDefault();
  };

  // ── Verify OTP ────────────────────────────────────────────
  const verifyOtp = async (e) => {
    e.preventDefault();
    dispatch(clearMessages());
    setMsg({ type: "", text: "" });

    const otpStr = otp.join("");
    if (!email.trim() || otpStr.length < 6) {
      setMsg({ type: "error", text: "Email and full 6-digit OTP are required." });
      return;
    }

    const action = await dispatch(verifyEmail({ email, otp: otpStr }));
    if (verifyEmail.fulfilled.match(action)) {
      setMsg({ type: "success", text: "Email verified! Redirecting to login..." });
      setTimeout(() => navigate(loginPath), 900);
    } else {
      setMsg({ type: "error", text: action.payload || "OTP verification failed." });
    }
  };

  const isMagicLinkPending = searchParams.get("token") && !msg.text;

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── Left image panel ── */}
      <div className="relative hidden lg:flex lg:w-[48%] overflow-hidden bg-slate-900">
        <img
          src="/images/imageverify.png"
          alt="Verify your account"
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-10">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-lg font-bold tracking-tight">Leapmentor</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight mb-3">
            Empowering the next<br />generation of leaders.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Join over 10,000+ mentors globally and start making an impact today.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center px-8 overflow-hidden bg-white">
        <div className="w-full max-w-[400px]">

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Verify your email
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {isMagicLinkPending
              ? "Verifying your magic link, please wait..."
              : <>Enter the 6-digit OTP sent to{" "}<span className="font-semibold text-slate-700">{email || "your email"}</span></>
            }
          </p>

          {/* Message banner */}
          {msg.text && (
            <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${msg.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
              }`}>
              {msg.text}
            </div>
          )}

          {/* OTP form — hidden during magic link processing */}
          {!isMagicLinkPending && (
            <form onSubmit={verifyOtp} className="space-y-5">

              {!location.state?.email && !searchParams.get("email") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`votp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-12 h-12 text-center text-lg font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-slate-800"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying...</>
                  : "Verify Email"}
              </button>
            </form>
          )}

          {/* Resend + Back to Login */}
          {!isMagicLinkPending && (
            <div className="flex items-center justify-between mt-5">
              <button type="button" onClick={handleSendOtp} disabled={sending}
                className="text-xs text-blue-900 font-semibold hover:underline disabled:opacity-60">
                {sending ? "Sending..." : "Resend OTP"}
              </button>
              <button type="button" onClick={() => navigate(loginPath)}
                className="text-xs text-slate-400 hover:text-slate-900 hover:underline">
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;