// components/mentor/dashboard/availability/CalendarAvailabilitySection.jsx
import { useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getTodayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};

const toDateStr = (year, month, day) =>
  `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

const GRID_7 = { display:"grid", gridTemplateColumns:"repeat(7, minmax(0, 1fr))" };

const TimeInput = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all duration-150"
    style={{ width: "90px" }}
  />
);

const CalendarGrid = ({ year, month, specificDates, onToggleDate, onNavPrev, onNavNext }) => {
  const today       = getTodayLocal();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onNavPrev}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <p className="text-xs font-bold text-slate-700 tracking-wide">{MONTHS[month]} {year}</p>
        <button type="button" onClick={onNavNext}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div style={GRID_7} className="mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 py-1 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      <div style={{ ...GRID_7, gap: "3px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr    = toDateStr(year, month, day);
          const isPast     = dateStr < today;
          const isToday    = dateStr === today;
          const isSelected = specificDates.some((d) => d.date === dateStr);
          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onToggleDate(dateStr)}
              style={{ aspectRatio: "1 / 1" }}
              className={`relative rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all duration-150
                ${isPast ? "text-slate-200 cursor-not-allowed"
                  : isSelected ? "bg-blue-600 text-white shadow-sm scale-105"
                  : isToday ? "bg-blue-50 text-blue-600 ring-1 ring-blue-300 font-bold hover:bg-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
            >
              {day}
              {isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/70 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DateSlotEditor = ({ dateEntry, onAddSlot, onRemoveSlot, onUpdateSlot, onRemoveDate }) => {
  const displayStr = new Date(dateEntry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">{displayStr}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onAddSlot(dateEntry.date)}
            className="w-4 h-4 rounded flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button type="button" onClick={() => onRemoveDate(dateEntry.date)}
            className="w-4 h-4 rounded flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {dateEntry.slots.map((slot, index) => (
        <div key={index} className="flex items-center gap-1.5 flex-wrap">
          <TimeInput value={slot.startTime} onChange={(val) => onUpdateSlot(dateEntry.date, index, "startTime", val)} />
          <span className="text-slate-300 text-[10px] font-bold">—</span>
          <TimeInput value={slot.endTime} onChange={(val) => onUpdateSlot(dateEntry.date, index, "endTime", val)} />
          {dateEntry.slots.length > 1 && (
            <button type="button" onClick={() => onRemoveSlot(dateEntry.date, index)}
              className="w-4 h-4 rounded flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const CalendarAvailabilitySection = ({ specificDates, setSpecificDates }) => {
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const handleToggleDate = (dateStr) => {
    setSpecificDates((prev) => {
      const exists = prev.find((d) => d.date === dateStr);
      if (exists) return prev.filter((d) => d.date !== dateStr);
      return [...prev, { date: dateStr, slots: [{ startTime: "09:00", endTime: "17:00" }] }]
        .sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const handleRemoveDate  = (dateStr) => setSpecificDates((prev) => prev.filter((d) => d.date !== dateStr));
  const handleAddSlot     = (dateStr) => setSpecificDates((prev) => prev.map((d) => d.date === dateStr ? { ...d, slots: [...d.slots, { startTime: "09:00", endTime: "17:00" }] } : d));
  const handleRemoveSlot  = (dateStr, index) => setSpecificDates((prev) => prev.map((d) => d.date === dateStr ? { ...d, slots: d.slots.filter((_, i) => i !== index) } : d));
  const handleUpdateSlot  = (dateStr, index, field, value) => setSpecificDates((prev) => prev.map((d) => d.date === dateStr ? { ...d, slots: d.slots.map((s, i) => i === index ? { ...s, [field]: value } : s) } : d));

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const today       = getTodayLocal();
  const futureDates = specificDates.filter((d) => d.date >= today);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Stack vertically on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Calendar ── */}
        <div className="w-full md:w-64 md:shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Calendar Availability</h3>
              <p className="text-[10px] text-slate-400">Click dates to mark available</p>
            </div>
          </div>

          <CalendarGrid
            year={calYear}
            month={calMonth}
            specificDates={specificDates}
            onToggleDate={handleToggleDate}
            onNavPrev={handlePrevMonth}
            onNavNext={handleNextMonth}
          />
        </div>

        {/* Divider — horizontal on mobile, vertical on md+ */}
        <div className="block md:hidden h-px bg-slate-100 w-full" />
        <div className="hidden md:block w-px bg-slate-100 self-stretch" />

        {/* ── Date slot editor ── */}
        <div className="flex-1 min-w-0">
          {futureDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                  <line x1="3"  y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                No dates selected.<br/>Click any future date on the calendar.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-600">
                  {futureDates.length} date{futureDates.length > 1 ? "s" : ""} selected
                </p>
                <button type="button" onClick={() => setSpecificDates([])}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  Clear all
                </button>
              </div>
              <div className="space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: "220px" }}>
                {futureDates.map((dateEntry) => (
                  <DateSlotEditor
                    key={dateEntry.date}
                    dateEntry={dateEntry}
                    onAddSlot={handleAddSlot}
                    onRemoveSlot={handleRemoveSlot}
                    onUpdateSlot={handleUpdateSlot}
                    onRemoveDate={handleRemoveDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarAvailabilitySection;