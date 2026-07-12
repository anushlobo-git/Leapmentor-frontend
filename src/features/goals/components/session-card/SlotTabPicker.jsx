/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/components/session-card/SlotTabPicker.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { getDayTabClasses } from "@features/goals/utils/sessionCardUtils";
import SlotPill from "./SlotPill";

const SlotTabPicker = ({ availability, selectedSlot, onSelect, bookedSlots }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const activeGroup = availability[activeDayIndex] || null;

  const isBooked = (group, slot) =>
    bookedSlots.some(
      (b) => b.date === group.date && b.startTime === slot.startTime && b.endTime === slot.endTime
    );

  const freeSlots = activeGroup
    ? activeGroup.slots.filter((s) => !isBooked(activeGroup, s))
    : [];

  const totalAvailable = availability.reduce(
    (acc, g) => acc + g.slots.filter((s) => !isBooked(g, s)).length, 0
  );

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm font-bold text-slate-700">Available Slots</p>
        </div>
        {totalAvailable > 0 && (
          <span className="text-xs text-slate-400">{totalAvailable} available</span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Day tabs */}
        <div className="flex gap-2">
          {availability.map((group, idx) => {
            const isActiveTab = activeDayIndex === idx;
            const date = new Date(group.date + "T00:00:00");
            const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
            const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const freeCnt = group.slots.filter((s) => !isBooked(group, s)).length;
            return (
              <button
                key={group.date}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`
                  flex-1 flex flex-col items-center justify-center
                  py-2 px-1 rounded-xl border text-center transition-all duration-200
                  ${getDayTabClasses(isActiveTab, freeCnt)}
                `}
                disabled={freeCnt === 0}
              >
                <span className={`text-[11px] font-bold leading-tight ${isActiveTab ? "text-white" : "text-slate-600"}`}>
                  {dayLabel}
                </span>
                <span className={`text-[9px] font-medium mt-0.5 ${isActiveTab ? "text-blue-100" : "text-slate-400"}`}>
                  {dateLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slot pills */}
        {activeGroup && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-600">
                {new Date(activeGroup.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{freeSlots.length} open</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {freeSlots.map((slot) => (
                <SlotPill
                  key={`${slot.startTime}-${slot.endTime}`}
                  slot={slot}
                  group={activeGroup}
                  selected={selectedSlot?.date === activeGroup.date && selectedSlot?.startTime === slot.startTime}
                  onSelect={onSelect}
                  booked={isBooked(activeGroup, slot)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SlotTabPicker.propTypes = {
  availability: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      slots: PropTypes.arrayOf(
        PropTypes.shape({ startTime: PropTypes.string, endTime: PropTypes.string })
      ),
    })
  ).isRequired,
  selectedSlot: PropTypes.shape({
    date: PropTypes.string,
    startTime: PropTypes.string,
  }),
  onSelect: PropTypes.func.isRequired,
  bookedSlots: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    })
  ).isRequired,
};

export default SlotTabPicker;
