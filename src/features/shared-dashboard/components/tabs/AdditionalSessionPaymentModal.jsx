/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/AdditionalSessionPaymentModal.jsx
import { useState } from "react";
import { payAdditionalEscrow } from "@features/connects/api/escrow.api";
import EscrowSuccessModal from "@features/mentee/components/dashboard/history/EscrowSuccessModal";
import { TokenIcon, LockIcon } from "@components/shared/icons/PaymentIcons";
import WalletBalanceDisplay from "@components/shared/WalletBalanceDisplay";
import { useEscrowPayment } from "@lib/hooks/useEscrowPayment";
import { formatTimeString as formatTime } from "@lib/formatters/dateTime";
import PropTypes from "prop-types";

const AdditionalSessionPaymentModal = ({
  connect,
  slot,
  slotId,
  onClose,
  onSuccess,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const defaultSessionRate = connect?.mentorProfile?.hourlyRate ?? 0;

  const {
    loading,
    setLoading,
    fetching,
    error,
    setError,
    walletBalance,
    commissionRate,
    sessionRate,
  } = useEscrowPayment(connect?._id, defaultSessionRate);

  const platformFee = Math.ceil((sessionRate * commissionRate) / 100);
  const totalAmount = sessionRate + platformFee;
  const insufficient = walletBalance !== null && walletBalance < totalAmount;
  const mentorName = connect?.mentor?.name || "Mentor";

  const handlePay = async () => {
    setError("");
    if (!sessionRate || sessionRate < 1) {
      setError("Mentor has not set a session rate.");
      return;
    }
    if (insufficient) {
      setError(`Need ${totalAmount - walletBalance} more tokens.`);
      return;
    }
    try {
      setLoading(true);
      await payAdditionalEscrow({
        connectRequestId: connect._id,
        sessionRate,
        slotId,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <EscrowSuccessModal
        totalAmount={totalAmount}
        mentorName={mentorName}
        onDone={() => {
          onSuccess();
          onClose();
        }}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-70 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: "92vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 text-slate-800">
              <LockIcon size={14} />
              <h2 className="text-sm font-bold">Pay for Additional Session</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748B"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
            {/* Slot info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Session Details
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "Mentor", value: mentorName },
                  slot?.date && {
                    label: "Date",
                    value: `${slot.day}, ${new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                  },
                  slot?.startTime && {
                    label: "Time",
                    value: `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
                  },
                  { label: "Rate", value: `${sessionRate} tokens / session` },
                ]
                  .filter(Boolean)
                  .map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Payment Breakdown
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Session rate</span>
                <span className="font-semibold text-slate-700">
                  {sessionRate} tokens
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Platform fee{" "}
                  <span className="text-amber-500 font-semibold">
                    {fetching ? "(…%)" : `(${commissionRate}%)`}
                  </span>
                </span>
                <span className="font-semibold text-amber-600">
                  + {platformFee} tokens
                </span>
              </div>
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-1">
                <span className="text-xs font-bold text-slate-700">
                  You pay (held in escrow)
                </span>
                <span className="text-sm font-bold text-blue-900 flex items-center gap-1">
                  <TokenIcon size={12} />
                  {totalAmount} tokens
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-blue-900">
                Your balance
              </span>
              <WalletBalanceDisplay
                fetching={fetching}
                walletBalance={walletBalance}
                insufficient={insufficient}
              />
            </div>

            {insufficient && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <p className="text-xs text-red-600 font-medium">
                  You need {totalAmount - walletBalance} more tokens.
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <LockIcon size={12} />
              <p className="text-[10px] text-amber-700 leading-relaxed">
                Tokens locked in escrow until session is marked complete.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 space-y-2 shrink-0">
            <button
              type="button"
              onClick={handlePay}
              disabled={loading || fetching || insufficient || !sessionRate}
              className="w-full py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <LockIcon size={12} />
                  Confirm & Pay {totalAmount} Tokens
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

AdditionalSessionPaymentModal.propTypes = {
  connect: PropTypes.shape({
    _id: PropTypes.string,
    mentorProfile: PropTypes.shape({ hourlyRate: PropTypes.number }),
    mentor: PropTypes.shape({ name: PropTypes.string }),
  }),
  slot: PropTypes.shape({
    date: PropTypes.string,
    day: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
  slotId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AdditionalSessionPaymentModal;
