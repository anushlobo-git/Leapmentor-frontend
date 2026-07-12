/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/CancelledNotice.jsx
import PropTypes from "prop-types";
import { slotShape } from "@features/goals/utils/sessionCardPropTypes";

const CancelledNotice = ({ slot, viewerRole, otherName }) => (
  <div className="border-t border-red-100 pt-3">
    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <div>
        <p className="text-xs font-bold text-red-600">
          Cancelled by {slot?.cancelledBy === viewerRole ? "you" : otherName}
        </p>
        {slot?.cancellationReason && slot.cancellationReason !== "rescheduled" && (
          <p className="text-xs text-red-500 mt-0.5 italic">"{slot.cancellationReason}"</p>
        )}
        {slot?.isRescheduled && (
          <p className="text-xs text-blue-500 mt-0.5 font-medium">↳ Rescheduled to a new slot</p>
        )}
      </div>
    </div>
  </div>
);

CancelledNotice.propTypes = {
  slot: slotShape.isRequired,
  viewerRole: PropTypes.string.isRequired,
  otherName: PropTypes.string.isRequired,
};

export default CancelledNotice;
