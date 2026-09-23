/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/SlotPill.jsx
import { formatTime, getSlotPillClasses } from "@features/goals/presenters/sessionCardUtils";

interface SlotPillSlot {
  startTime: string;
  endTime: string;
}

interface SlotPillGroup {
  day?: string;
  date?: string;
}

interface SlotPillProps {
  slot: SlotPillSlot;
  group: SlotPillGroup;
  selected: boolean;
  onSelect: (slot: { day: string; date: string; startTime: string; endTime: string }) => void;
  booked: boolean;
}

const SlotPill = ({ slot, group, selected, onSelect, booked }: SlotPillProps) => (
  <button
    type="button"
    disabled={booked}
    onClick={() => !booked && onSelect({ day: group.day, date: group.date, startTime: slot.startTime, endTime: slot.endTime })}
    className={`
      relative flex items-center justify-center
      rounded-2xl px-3 h-12 text-center border w-full
      transition-all duration-200
      ${getSlotPillClasses(selected, booked)}
    `}
  >
    {selected && (
      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border-2 border-blue-900 flex items-center justify-center shadow-sm z-10">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    )}
    <span className={`text-[11px] font-semibold whitespace-nowrap ${selected ? "text-white" : "text-slate-700"}`}>
      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
    </span>
  </button>
);

export default SlotPill;
