/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
// src/features/mentee/components/dashboard/history/RequestStatusViews.jsx
//
// Split out of DetailDrawer.jsx (which had grown past 600 lines) so each
// file stays under a manageable size. This file holds the shared SlotRow
// plus the four simpler, mostly-static status views. The two views with
// heavier logic/state (Ongoing, Referred) live in OngoingReferredContent.jsx.
import {
  formatDateString as formatDate,
  formatTimeString as formatTime,
  formatSlotDate,
} from "@lib/formatters/dateTime";
import PropTypes from "prop-types";

// ── Proposed / confirmed slot list (shared by Pending, Accepted, Rejected) ──
const SlotList = ({ slots, isConfirmed, title }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
      {title}
    </p>
    <div className="space-y-1.5">
      {slots.map((slot) => (
        <SlotRow
          key={`${slot.date}-${slot.startTime}`}
          slot={slot}
          isConfirmed={isConfirmed}
        />
      ))}
    </div>
  </div>
);

SlotList.propTypes = {
  slots: PropTypes.array.isRequired,
  isConfirmed: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

// ── "Your Message" card (shared by Pending, Accepted, Rejected) ──
const UserMessageCard = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
        Your Message
      </p>
      <p className="text-xs text-slate-600 italic">"{message}"</p>
    </div>
  );
};

UserMessageCard.propTypes = {
  message: PropTypes.string,
};

// ── Slot row ────────────────────────────────────────────────
export const SlotRow = ({ slot, isConfirmed }) => (
  <div
    className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
      isConfirmed
        ? "bg-emerald-50 border-emerald-200"
        : "bg-slate-50 border-slate-100"
    }`}
  >
    <span
      className={`text-xs font-semibold ${isConfirmed ? "text-emerald-700" : "text-slate-600"}`}
    >
      {slot.day}, {formatSlotDate(slot.date)}
    </span>
    <span
      className={`text-xs font-bold ${isConfirmed ? "text-emerald-600" : "text-blue-500"}`}
    >
      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
    </span>
  </div>
);

// ── Pending content ─────────────────────────────────────────
export const PendingContent = ({ request, onDelete }) => {
  const { selectedSlots = [], message, requestedAt } = request;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Sent on {formatDate(requestedAt)}
      </p>

      <SlotList
        slots={selectedSlots}
        isConfirmed={false}
        title="Proposed Times"
      />

      <UserMessageCard message={message} />

      <button
        type="button"
        onClick={onDelete}
        className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-all"
      >
        Cancel Request
      </button>
    </div>
  );
};

// ── Accepted content ────────────────────────────────────────
export const AcceptedContent = ({ request, onClose, onPayClick }) => {
  const { selectedSlots = [], message } = request;

  return (
    <div className="space-y-4">
      {/* ✅ All selected slots are confirmed — show all as green */}
      <SlotList
        slots={selectedSlots}
        isConfirmed={true}
        title={`Confirmed Sessions (${selectedSlots.length})`}
      />

      <UserMessageCard message={message} />

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D97706"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p className="text-xs text-amber-700">
          Complete payment to confirm your session. Tokens are held securely
          until the session is done.
        </p>
      </div>

      <button
        type="button"
        onClick={onPayClick}
        className="w-full py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-700 transition-all"
      >
        Make Payment
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
      >
        Close
      </button>
    </div>
  );
};

// ── Completed content ───────────────────────────────────────
export const CompletedContent = ({ request, onClose }) => {
  const { confirmedSlot, totalAmount, completedAt } = request;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-2 space-y-2">
        <div
          className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200
          flex items-center justify-center text-emerald-500"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Session Completed</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalAmount} tokens released to mentor
          </p>
        </div>
      </div>

      {confirmedSlot && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
          <p className="text-xs font-semibold text-slate-700">
            {confirmedSlot.day},{" "}
            {formatSlotDate(confirmedSlot.date, { year: "numeric" })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatTime(confirmedSlot.startTime)} –{" "}
            {formatTime(confirmedSlot.endTime)}
          </p>
        </div>
      )}

      {completedAt && (
        <p className="text-[10px] text-slate-400 text-center">
          Completed on {formatDate(completedAt)}
        </p>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-all"
      >
        Close
      </button>
    </div>
  );
};

// ── Rejected content ────────────────────────────────────────
export const RejectedContent = ({ request, onClose }) => {
  const { selectedSlots = [], message, respondedAt } = request;

  return (
    <div className="space-y-4">
      {respondedAt && (
        <p className="text-xs text-slate-400">
          Declined on {formatDate(respondedAt)}
        </p>
      )}
      <SlotList
        slots={selectedSlots}
        isConfirmed={false}
        title="Proposed Times"
      />
      <UserMessageCard message={message} />
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-all"
      >
        Close
      </button>
    </div>
  );
};

SlotRow.propTypes = {
  slot: PropTypes.shape({
    day: PropTypes.string,
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }).isRequired,
  isConfirmed: PropTypes.bool.isRequired,
};

PendingContent.propTypes = {
  request: PropTypes.shape({
    selectedSlots: PropTypes.array,
    message: PropTypes.string,
    requestedAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

AcceptedContent.propTypes = {
  request: PropTypes.shape({
    selectedSlots: PropTypes.array,
    message: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onPayClick: PropTypes.func.isRequired,
};

CompletedContent.propTypes = {
  request: PropTypes.shape({
    totalAmount: PropTypes.number.isRequired,
    confirmedSlot: PropTypes.shape({
      day: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }),
    completedAt: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

RejectedContent.propTypes = {
  request: PropTypes.shape({
    selectedSlots: PropTypes.array,
    message: PropTypes.string,
    respondedAt: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
