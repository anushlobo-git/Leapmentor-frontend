/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/AdditionalSessionPaymentModal.jsx
import { useState } from "react";
import { payAdditionalEscrow } from "@features/connects/api/escrow.api";
import EscrowSuccessModal from "@features/mentee/components/dashboard/history/EscrowSuccessModal";
import { TokenIcon, LockIcon } from "@components/shared/icons/PaymentIcons";
import {
  EscrowModalShell,
  SessionDetailRows,
  BalanceRow,
} from "@components/shared/payment/EscrowPaymentUI";
import { useEscrowPayment } from "@lib/hooks/useEscrowPayment";
import {
  formatTimeString as formatTime,
  formatSlotDate,
} from "@lib/formatters/dateTime";
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
    <EscrowModalShell
      title="Pay for Additional Session"
      onClose={onClose}
      onPay={handlePay}
      payDisabled={loading || fetching || insufficient || !sessionRate}
      loading={loading}
      totalAmount={totalAmount}
    >
      {/* Slot info */}
      <SessionDetailRows
        rows={[
          { label: "Mentor", value: mentorName },
          slot?.date && {
            label: "Date",
            value: `${slot.day}, ${formatSlotDate(slot.date, { year: "numeric" })}`,
          },
          slot?.startTime && {
            label: "Time",
            value: `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
          },
          { label: "Rate", value: `${sessionRate} tokens / session` },
        ]}
      />

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

      <BalanceRow
        fetching={fetching}
        walletBalance={walletBalance}
        insufficient={insufficient}
      />

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
        <p className="text-xs text-red-500 font-medium text-center">{error}</p>
      )}
    </EscrowModalShell>
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
