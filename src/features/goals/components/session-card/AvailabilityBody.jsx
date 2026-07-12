/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/AvailabilityBody.jsx
import PropTypes from "prop-types";
import SlotTabPicker from "./SlotTabPicker";

// Extracted so the loading/error/empty/list branching isn't a nested
// ternary inside RescheduleModal.
const AvailabilityBody = ({ availLoading, availError, availability, duration, selectedSlot, onSelect, bookedSlots }) => {
  if (availLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (availError) {
    return (
      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        {availError}
      </div>
    );
  }

  if (availability.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm font-semibold text-slate-600">No slots available</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Your mentor hasn't set availability for {duration}-min sessions yet.
        </p>
      </div>
    );
  }

  return (
    <SlotTabPicker
      availability={availability}
      selectedSlot={selectedSlot}
      onSelect={onSelect}
      bookedSlots={bookedSlots}
    />
  );
};

AvailabilityBody.propTypes = {
  availLoading: PropTypes.bool.isRequired,
  availError: PropTypes.string,
  availability: PropTypes.array.isRequired,
  duration: PropTypes.number.isRequired,
  selectedSlot: PropTypes.shape({
    date: PropTypes.string,
    startTime: PropTypes.string,
  }),
  onSelect: PropTypes.func.isRequired,
  bookedSlots: PropTypes.array.isRequired,
};

export default AvailabilityBody;
