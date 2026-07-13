/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/SessionActions.jsx
import PropTypes from "prop-types";

// Only ever rendered when the slot can still be cancelled.
const SessionActions = ({ withinRescheduleWindow, saving, onRescheduleClick, onCancelClick }) => (
  <div className="border-t border-slate-100 pt-3 flex gap-2">
    {withinRescheduleWindow ? (
      <button
        onClick={onRescheduleClick}
        disabled={saving}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200
          bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Reschedule
      </button>
    ) : (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
        bg-slate-50 text-xs font-semibold text-slate-400 cursor-not-allowed">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Reschedule unavailable (before 12hrs)
      </div>
    )}
    <button
      onClick={onCancelClick}
      disabled={saving}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200
        bg-red-50 text-xs font-bold text-red-500 hover:bg-red-100 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      Cancel Session
    </button>
  </div>
);

SessionActions.propTypes = {
  withinRescheduleWindow: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  onRescheduleClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

export default SessionActions;
