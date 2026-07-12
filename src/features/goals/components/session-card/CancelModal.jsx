/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/CancelModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { formatSlotDate, formatTime } from "@features/goals/utils/sessionCardUtils";
import { slotShape } from "@features/goals/utils/sessionCardPropTypes";

const CancelModal = ({ slot, slotIndex, onConfirm, onClose, saving }) => {
  const [reason, setReason] = useState("");
  const reasonFieldId = `cancel-reason-${slotIndex}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">Cancel this session?</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatSlotDate(slot)} &bull; {formatTime(slot?.startTime)} – {formatTime(slot?.endTime)}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          This session slot will be permanently cancelled. The other party will be notified immediately.
        </p>

        <div>
          <label htmlFor={reasonFieldId} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            Reason <span className="font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id={reasonFieldId}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Schedule conflict, emergency..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700
              bg-white outline-none focus:border-red-300 transition-colors placeholder:text-slate-400
              resize-none"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
              font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Keep Session
          </button>
          <button
            onClick={() => onConfirm(slotIndex, reason)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold
              hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Cancelling...</>
              : "Yes, Cancel It"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

CancelModal.propTypes = {
  slot: slotShape.isRequired,
  slotIndex: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
};

export default CancelModal;
