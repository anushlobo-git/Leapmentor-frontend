// src/components/mentee/dashboard/history/EscrowPaymentModal.jsx
import { useState, useEffect } from "react";
import { payEscrow, getEscrowStatus } from "../../../../api/escrow.api";
import { formatTime } from "./constants";
import EscrowSuccessModal from "./EscrowSuccessModal";

// ── Token icon ───────────────────────────────────────────────
const TokenIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9" />
  </svg>
);

// ── Lock icon ────────────────────────────────────────────────
const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ── Warning icon ─────────────────────────────────────────────
const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ── Info row ─────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-bold text-slate-800">{value}</span>
  </div>
);

// ── Main Modal ───────────────────────────────────────────────
const EscrowPaymentModal = ({ request, onClose, onSuccess }) => {
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
const [sessionCount, setSessionCount] = useState(
  request?.selectedSlots?.length || 1
);
  // ✅ When set, payment modal unmounts and success modal takes over
  const [successPatch, setSuccessPatch]   = useState(null);

  const sessionRate  = request?.mentorProfile?.hourlyRate || 0;
  const totalAmount  = sessionRate * sessionCount;
  const insufficient = walletBalance !== null && walletBalance < totalAmount;
  const mentorName   = request?.mentor?.name || "Mentor";
  const confirmedSlot = request?.confirmedSlot;

  // ── Fetch live wallet balance on mount ────────────────────
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setFetching(true);
        const data = await getEscrowStatus(request._id);
        setWalletBalance(data?.wallet?.balance ?? null);
      } catch (err) {
        console.warn("⚠️ Could not fetch wallet balance:", err?.response?.data || err.message);
      } finally {
        setFetching(false);
      }
    };
    if (request?._id) fetchStatus();
  }, [request?._id]);

  // ── Handle payment ────────────────────────────────────────
  const handlePay = async () => {
    setError("");

    if (!sessionRate || sessionRate < 1) {
      setError("This mentor has not set a session rate yet.");
      return;
    }
    if (sessionCount < 1) {
      setError("Session count must be at least 1.");
      return;
    }
    if (insufficient) {
      setError(`Insufficient balance. You need ${totalAmount} tokens but only have ${walletBalance}.`);
      return;
    }

    try {
      setLoading(true);
      await payEscrow({ connectRequestId: request._id, sessionRate, sessionCount });

      // ✅ Store patch — success modal will call onSuccess(patch) on Done
      setSuccessPatch({
        status:        "ongoing",
        paymentStatus: "paid",
        sessionRate,
        sessionCount,
        totalAmount,
      });

    } catch (err) {
      console.error("❌ payEscrow failed:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── If payment succeeded, hand off to success modal ───────
  // Payment modal unmounts cleanly BEFORE parent re-render happens
  if (successPatch) {
    return (
      <EscrowSuccessModal
        totalAmount={totalAmount}
        mentorName={mentorName}
        onDone={() => {
          onSuccess(successPatch); // ✅ patch parent list
          onClose();               // ✅ close modal
        }}
      />
    );
  }

  // ── Payment form ──────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800">
              <LockIcon size={15} />
              <h2 className="text-sm font-bold">Escrow Payment</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">

            {/* Session details */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Session Details
              </p>
              <InfoRow label="Mentor" value={mentorName} />
              {confirmedSlot && (
                <>
                  <InfoRow
                    label="Date"
                    value={`${confirmedSlot.day}, ${new Date(confirmedSlot.date + "T00:00:00")
                      .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  />
                  <InfoRow
                    label="Time"
                    value={`${formatTime(confirmedSlot.startTime)} – ${formatTime(confirmedSlot.endTime)}`}
                  />
                </>
              )}
              <InfoRow
                label="Rate per session"
                value={
                  <span className="flex items-center gap-1">
                    <TokenIcon size={12} />
                    {sessionRate} tokens
                  </span>
                }
              />
            </div>

            {/* Session count selector */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                Number of Sessions
              </p>
             <div className="flex items-center gap-3">
  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
    <span className="text-sm font-bold text-slate-800">{sessionCount}</span>
    <span className="text-xs text-slate-400">
      session{sessionCount > 1 ? "s" : ""} booked
    </span>
  </div>
  {/* ✅ Show slots as confirmation */}
  <span className="text-xs text-emerald-600 font-semibold">
    ✓ Auto-filled from your booking
  </span>
</div>
            </div>

            {/* Total + balance */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700">Total to lock</span>
                <span className="flex items-center gap-1 text-sm font-bold text-blue-700">
                  <TokenIcon size={13} />
                  {totalAmount} tokens
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-blue-100">
                <span className="text-xs text-blue-500">Your balance</span>
                {fetching ? (
                  <span className="text-xs text-blue-400 animate-pulse">Loading...</span>
                ) : walletBalance !== null ? (
                  <span className={`text-xs font-bold ${insufficient ? "text-red-500" : "text-blue-600"}`}>
                    {walletBalance} tokens
                  </span>
                ) : (
                  <span className="text-xs text-blue-400">—</span>
                )}
              </div>
            </div>

            {/* Insufficient warning */}
            {insufficient && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <span className="text-red-500 mt-0.5 shrink-0"><WarnIcon /></span>
                <p className="text-xs text-red-600 font-medium">
                  You need {totalAmount - walletBalance} more tokens to proceed.
                </p>
              </div>
            )}

            {/* Escrow explanation */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0"><LockIcon size={13} /></span>
              <p className="text-xs text-amber-700">
                Tokens are held securely in escrow and only released to the mentor
                after you confirm the session is complete.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePay}
                disabled={loading || fetching || insufficient || !sessionRate}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold
                  hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <LockIcon size={13} />
                    Confirm & Pay {totalAmount} Tokens
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600
                  text-xs font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EscrowPaymentModal;