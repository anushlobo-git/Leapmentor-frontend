// components/mentor/dashboard/availability/CalendarAvailabilitySection.jsx
import { useState, useEffect } from "react";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSlotBusy = (dateStr, slot, busySlots) => {
  if (!busySlots?.length) return false;
  const slotStart = new Date(`${dateStr}T${slot.startTime}:00`);
  const slotEnd   = new Date(`${dateStr}T${slot.endTime}:00`);
  return busySlots.some((busy) => {
    const busyStart = new Date(busy.start);
    const busyEnd   = new Date(busy.end);
    return slotStart < busyEnd && slotEnd > busyStart;
  });
};

const getEventsForDate = (dateStr, events) => {
  if (!events?.length) return [];
  return events.filter((e) => {
    if (!e.start) return false;
    if (e.allDay) return e.start === dateStr;
    const localDate = new Date(e.start).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return localDate === dateStr;
  });
};

const formatTime = (isoStr) => {
  if (!isoStr || !isoStr.includes("T")) return "";
  const d = new Date(isoStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// ─── TimeInput ────────────────────────────────────────────────────────────────
const TimeInput = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 cursor-pointer hover:border-slate-300"
    style={{ width: "100px" }}
  />
);

// ─── EventTooltip ─────────────────────────────────────────────────────────────
const EventTooltip = ({ events, isBusyOnly }) => (
  <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-slate-900 rounded-xl shadow-2xl p-3 pointer-events-none border border-slate-700">
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      Google Calendar
    </div>
    {isBusyOnly ? (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
        <span className="text-xs font-semibold text-white">Busy</span>
      </div>
    ) : (
      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white leading-tight truncate">
              {e.summary}
            </span>
            {!e.allDay && e.start && (
              <span className="text-[10px] text-slate-400">
                {formatTime(e.start)}{e.end ? ` – ${formatTime(e.end)}` : ""}
              </span>
            )}
            {e.allDay && (
              <span className="text-[10px] text-slate-400">All day</span>
            )}
          </div>
        ))}
      </div>
    )}
    {/* Arrow pointing up */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-900" />
  </div>
);

// ─── CalendarGrid ─────────────────────────────────────────────────────────────
const CalendarGrid = ({ year, month, specificDates, onToggleDate, onNavPrev, onNavNext, calendarEvents, busySlots }) => {
  const today       = getTodayLocal();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const [hoveredDate, setHoveredDate] = useState(null);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onNavPrev}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-600"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p className="text-sm font-bold text-slate-800 tracking-wide">{MONTHS[month]} {year}</p>
        <button
          type="button"
          onClick={onNavNext}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-600"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div style={GRID_7} className="mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-700 py-1 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ ...GRID_7, gap: "3px", overflow: "visible" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr      = toDateStr(year, month, day);
          const isPast       = dateStr < today;
          const isToday      = dateStr === today;
          const isSelected   = specificDates.some((d) => d.date === dateStr);
          const dayEvents    = getEventsForDate(dateStr, calendarEvents);
          const hasEvents    = dayEvents.length > 0;
          const hasBusy      = busySlots?.some((b) => {
            const busyDate = new Date(b.start).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            return busyDate === dateStr;
          });
          const hasIndicator = hasEvents || hasBusy;
          const isHovered    = hoveredDate === dateStr;

          return (
            <div
              key={dateStr}
              className="relative"
              onMouseEnter={() => hasIndicator && setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <button
                type="button"
                disabled={isPast}
                onClick={() => !isPast && onToggleDate(dateStr)}
                style={{ aspectRatio: "1 / 1", width: "100%" }}
                className={`relative rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center transition-all duration-150
                  ${isPast
                    ? "text-slate-200 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-900 text-white shadow-sm scale-105"
                    : isToday
                    ? "bg-blue-50 text-blue-900 ring-1 ring-blue-300 font-bold hover:bg-blue-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
              >
                {day}
                {/* Dot indicators */}
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {isSelected && (
                    <span className="w-1 h-1 bg-white/70 rounded-full" />
                  )}
                  {hasIndicator && (
                    <span className={`w-1 h-1 rounded-full ${
                      isPast
                        ? "bg-orange-200"
                        : isSelected
                        ? "bg-yellow-300"
                        : "bg-orange-400"
                    }`} />
                  )}
                </div>
              </button>

              {isHovered && hasIndicator && (
                <EventTooltip events={dayEvents} isBusyOnly={!hasEvents && hasBusy} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend — only show "Has events" */}
      {calendarEvents?.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-[11px] font-semibold text-slate-800">Has events</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DateSlotEditor ───────────────────────────────────────────────────────────
const DateSlotEditor = ({ dateEntry, onAddSlot, onRemoveSlot, onUpdateSlot, onRemoveDate, busySlots }) => {
  const displayStr = new Date(dateEntry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Date header row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700">{displayStr}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Add slot button — blue-900 */}
          <button
            type="button"
            onClick={() => onAddSlot(dateEntry.date)}
            title="Add time slot"
            className="flex items-center gap-1 text-[11px] font-semibold text-white bg-blue-900 hover:bg-blue-800 border border-blue-900 rounded-lg px-2.5 py-1 transition-all duration-150"
          >
            <PlusIcon />
            Add slot
          </button>
          {/* Remove date button — darker red */}
          <button
            type="button"
            onClick={() => onRemoveDate(dateEntry.date)}
            title="Remove this date"
            className="flex items-center gap-1 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-lg px-2.5 py-1 transition-all duration-150"
          >
            <XIcon size={10} />
            Remove
          </button>
        </div>
      </div>

      {/* Slots */}
      <div className="px-3.5 py-2.5 space-y-2">
        {dateEntry.slots.map((slot, index) => {
          const busy = isSlotBusy(dateEntry.date, slot, busySlots);
          return (
            <div key={index} className="flex items-center gap-2 flex-wrap">
              <TimeInput
                value={slot.startTime}
                onChange={(val) => onUpdateSlot(dateEntry.date, index, "startTime", val)}
              />
              <span className="text-slate-400 text-xs font-bold select-none">→</span>
              <TimeInput
                value={slot.endTime}
                onChange={(val) => onUpdateSlot(dateEntry.date, index, "endTime", val)}
              />

              {busy && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 border border-orange-300 rounded-lg px-2.5 py-1 leading-none">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Busy
                </span>
              )}

              {/* Remove slot — only show when multiple slots exist */}
              {dateEntry.slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSlot(dateEntry.date, index)}
                  title="Remove this slot"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 bg-slate-100 border border-slate-300 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-150 ml-auto"
                >
                  <XIcon size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── CalendarAvailabilitySection ──────────────────────────────────────────────
const CalendarAvailabilitySection = ({ specificDates, setSpecificDates, googleCalendarConnected }) => {
  const now = new Date();
  const [calYear,         setCalYear]         = useState(now.getFullYear());
  const [calMonth,        setCalMonth]        = useState(now.getMonth());
  const [busySlots,       setBusySlots]       = useState([]);
  const [calendarEvents,  setCalendarEvents]  = useState([]);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!googleCalendarConnected) {
      setBusySlots([]);
      setCalendarEvents([]);
      return;
    }

    const token    = localStorage.getItem("token");
    const firstDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
    const lastDay  = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${new Date(calYear, calMonth + 1, 0).getDate()}`;

    import("axios").then(({ default: axios }) => {
      const headers = { Authorization: `Bearer ${token}` };
      const params  = { startDate: firstDay, endDate: lastDay };

      axios.get(`${BASE_URL}/api/google-calendar/busy`, { params, headers })
        .then(({ data }) => setBusySlots(data.busy || []))
        .catch((err) => console.error("Failed to fetch busy slots:", err));

      axios.get(`${BASE_URL}/api/google-calendar/events`, { params, headers })
        .then(({ data }) => setCalendarEvents(data.events || []))
        .catch((err) => console.error("Failed to fetch events:", err));
    });
  }, [googleCalendarConnected, calYear, calMonth]);

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
      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Calendar ── */}
        <div className="w-full md:w-64 md:shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Calendar Availability</h3>
              <p className="text-[10px] text-slate-700">Click dates to mark available</p>
            </div>
          </div>

          <CalendarGrid
            year={calYear}
            month={calMonth}
            specificDates={specificDates}
            onToggleDate={handleToggleDate}
            onNavPrev={handlePrevMonth}
            onNavNext={handleNextMonth}
            calendarEvents={calendarEvents}
            busySlots={busySlots}
          />
        </div>

        {/* Divider */}
        <div className="block md:hidden h-px bg-slate-100 w-full" />
        <div className="hidden md:block w-px bg-slate-100 self-stretch" />

        {/* ── Date slot editor ── */}
        <div className="flex-1 min-w-0">

          {/* Google Calendar sync badge */}
          {googleCalendarConnected && (
            <div className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl bg-green-50 border border-green-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs font-semibold text-green-700">
                Google Calendar synced — hover dates to see events
              </span>
            </div>
          )}

          {futureDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">No dates selected</p>
                <p className="text-xs text-slate-500 mt-0.5">Click any future date on the calendar to add availability</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header with count + clear all */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">
                  {futureDates.length} date{futureDates.length > 1 ? "s" : ""} selected
                </p>
                <button
                  type="button"
                  onClick={() => setSpecificDates([])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-all duration-150"
                >
                  <TrashIcon />
                  Clear all
                </button>
              </div>

              <style>{`
                .slot-scroll::-webkit-scrollbar { width: 5px; }
                .slot-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
                .slot-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
                .slot-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
              <div className="slot-scroll space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "260px" }}>
                {futureDates.map((dateEntry) => (
                  <DateSlotEditor
                    key={dateEntry.date}
                    dateEntry={dateEntry}
                    onAddSlot={handleAddSlot}
                    onRemoveSlot={handleRemoveSlot}
                    onUpdateSlot={handleUpdateSlot}
                    onRemoveDate={handleRemoveDate}
                    busySlots={busySlots}
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