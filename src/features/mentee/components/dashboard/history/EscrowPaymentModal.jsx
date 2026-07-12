/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/mentee/components/dashboard/history/EscrowPaymentModal.jsx
import { useState } from "react";
import { payEscrow } from "@features/connects/api/escrow.api";
import {
  formatTimeString as formatTime,
  formatSlotDate,
} from "@lib/formatters/dateTime";
import EscrowSuccessModal from "@features/mentee/components/dashboard/history/EscrowSuccessModal";
import { TokenIcon, LockIcon } from "@components/shared/icons/PaymentIcons";
import {
  EscrowModalShell,
  SessionDetailRows,
  BalanceRow,
} from "@components/shared/payment/EscrowPaymentUI";
import { useEscrowPayment } from "@lib/hooks/useEscrowPayment";
import PropTypes from "prop-types";

const EscrowPaymentModal = ({ request, onClose, onSuccess }) => {
  const [successPatch, setSuccessPatch] = useState(null);
  const defaultSessionRate = request?.mentorProfile?.hourlyRate ?? 0;

  const {
    loading,
    setLoading,
    fetching,
    error,
    setError,
    walletBalance,
    commissionRate,
    sessionRate,
    remoteSessionCount,
  } = useEscrowPayment(request?._id, defaultSessionRate);

  const sessionCount =
    remoteSessionCount ?? request?.selectedSlots?.length ?? 1;
  const mentorAmount = sessionRate * sessionCount;
  const platformFee = Math.ceil((mentorAmount * commissionRate) / 100);
  const totalAmount = mentorAmount + platformFee;
  const insufficient = walletBalance !== null && walletBalance < totalAmount;
  const mentorName = request?.mentor?.name || "Mentor";
  const confirmedSlot = request?.confirmedSlot;

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
      await payEscrow({
        connectRequestId: request._id,
        sessionRate,
        sessionCount,
      });
      setSuccessPatch({
        status: "ongoing",
        paymentStatus: "paid",
        sessionRate,
        sessionCount,
        totalAmount,
        commissionRate,
        commissionAmount: platformFee,
        mentorPayout: mentorAmount,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (successPatch) {
    return (
      <EscrowSuccessModal
        totalAmount={totalAmount}
        mentorName={mentorName}
        onDone={() => {
          onSuccess(successPatch);
          onClose();
        }}
      />
    );
  }

  return (
    <EscrowModalShell
      title="Escrow Payment"
      onClose={onClose}
      onPay={handlePay}
      payDisabled={loading || fetching || insufficient || !sessionRate}
      loading={loading}
      totalAmount={totalAmount}
    >
      {/* Session info — compact single card */}
      <SessionDetailRows
        rows={[
          { label: "Mentor", value: mentorName },
          confirmedSlot && {
            label: "Date",
            value: `${confirmedSlot.day}, ${formatSlotDate(confirmedSlot.date, { year: "numeric" })}`,
          },
          confirmedSlot && {
            label: "Time",
            value: `${formatTime(confirmedSlot.startTime)} – ${formatTime(confirmedSlot.endTime)}`,
          },
          { label: "Rate", value: `${sessionRate} tokens / session` },
          {
            label: "Sessions",
            value: `${sessionCount} session${sessionCount > 1 ? "s" : ""} (auto-filled)`,
          },
        ]}
      />

      {/* Payment breakdown */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Payment Breakdown
        </p>

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">
            {sessionRate} × {sessionCount} session
            {sessionCount > 1 ? "s" : ""}
          </span>
          <span className="font-semibold text-slate-700">
            {mentorAmount} tokens
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

        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Mentor receives</span>
          <span className="font-semibold text-emerald-600">
            {mentorAmount} tokens
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

      {/* Insufficient warning */}
      {insufficient && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-xs text-red-600 font-medium">
            You need {totalAmount - walletBalance} more tokens.
          </p>
        </div>
      )}

      {/* Escrow note — condensed */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        <LockIcon size={12} />
        <p className="text-[10px] text-amber-700 leading-relaxed">
          Tokens locked in escrow. Platform fee collected only on completion.
          Full refund if cancelled.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 font-medium text-center">{error}</p>
      )}
    </EscrowModalShell>
  );
};

EscrowPaymentModal.propTypes = {
  request: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    selectedSlots: PropTypes.array,
    mentorProfile: PropTypes.shape({
      hourlyRate: PropTypes.number,
    }),
    mentor: PropTypes.shape({ name: PropTypes.string }),
    confirmedSlot: PropTypes.shape({
      day: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default EscrowPaymentModal;
