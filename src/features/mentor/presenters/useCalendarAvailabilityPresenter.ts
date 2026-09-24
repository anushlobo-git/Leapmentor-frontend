/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useState, useEffect } from "react";
import {
  getGoogleCalendarBusySlots,
  getGoogleCalendarEvents,
} from "@features/mentor/models/mentor.api";
import logger from "@lib/monitoring/logger";

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface DateEntry {
  date: string;
  slots: Slot[];
}

export interface BusySlot {
  start: string;
  end: string;
}

export interface CalendarEvent {
  summary: string;
  start?: string;
  end?: string;
  allDay?: boolean;
}

export const getTodayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const timeToMins = (t: string | undefined) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const getSlotError = (
  startTime: string | undefined,
  endTime: string | undefined,
  minDuration: number | undefined,
) => {
  if (!startTime || !endTime) return null;
  const diff = timeToMins(endTime) - timeToMins(startTime);
  if (diff === 0) return "Start and end time cannot be the same";
  if (diff < 0) return "End time must be after start time";
  if (minDuration && diff < minDuration)
    return `Minimum slot duration is ${minDuration} min`;
  return null;
};

// ─── Pure Lifted State Updaters to Prevent Deep Function Nesting (S2004) ───
const addSlotToDate = (dateStr: string) => (prev: DateEntry[]) =>
  prev.map((d) =>
    d.date === dateStr
      ? { ...d, slots: [...d.slots, { startTime: "09:00", endTime: "17:00" }] }
      : d,
  );

const removeSlotFromDate = (dateStr: string, index: number) => (prev: DateEntry[]) =>
  prev.map((d) =>
    d.date === dateStr
      ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
      : d,
  );

const updateSlotInDate = (dateStr: string, index: number, field: string, value: string) => (prev: DateEntry[]) =>
  prev.map((d) =>
    d.date === dateStr
      ? {
          ...d,
          slots: d.slots.map((s, i) =>
            i === index ? { ...s, [field]: value } : s,
          ),
        }
      : d,
  );

export interface UseCalendarAvailabilityPresenterProps {
  specificDates: DateEntry[];
  setSpecificDates: (updater: DateEntry[] | ((prev: DateEntry[]) => DateEntry[])) => void;
  googleCalendarConnected: boolean;
  onBusySlotsChange?: (slots: BusySlot[]) => void;
  sessionDurations?: number[];
  onValidationChange?: (isValid: boolean) => void;
}

export const useCalendarAvailabilityPresenter = ({
  specificDates,
  setSpecificDates,
  googleCalendarConnected,
  onBusySlotsChange,
  sessionDurations,
  onValidationChange,
}: UseCalendarAvailabilityPresenterProps) => {
  const now = new Date();
  const minDuration = sessionDurations?.length
    ? Math.min(...sessionDurations)
    : 30;
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const hasInvalidSlots = specificDates.some((d) =>
    d.slots.some(
      (s) => getSlotError(s.startTime, s.endTime, minDuration) !== null,
    ),
  );

  useEffect(() => {
    onValidationChange?.(!hasInvalidSlots);
  }, [hasInvalidSlots, minDuration]);

  const updateBusySlots = (slots: BusySlot[]) => {
    setBusySlots(slots);
    onBusySlotsChange?.(slots);
  };

  useEffect(() => {
    if (!googleCalendarConnected) {
      setBusySlots([]);
      setCalendarEvents([]);
      return;
    }
    const firstDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
    const lastDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${new Date(calYear, calMonth + 1, 0).getDate()}`;
    const params = { startDate: firstDay, endDate: lastDay };

    getGoogleCalendarBusySlots(params)
      .then(({ data }: any) => updateBusySlots(data.busy || []))
      .catch((err: any) =>
        logger.error("Failed to fetch busy slots:", {
          error: err.message || err,
        }),
      );

    getGoogleCalendarEvents(params)
      .then(({ data }: any) => setCalendarEvents(data.events || []))
      .catch((err: any) =>
        logger.error("Failed to fetch events:", { error: err.message || err }),
      );
  }, [googleCalendarConnected, calYear, calMonth]);

  const handleToggleDate = (dateStr: string) => {
    setSpecificDates((prev: DateEntry[]) => {
      // S7754 Fixed: Substituted .find() structure with .some() for strict evaluation optimization
      const exists = prev.some((d) => d.date === dateStr);
      if (exists) return prev.filter((d) => d.date !== dateStr);
      return [
        ...prev,
        { date: dateStr, slots: [{ startTime: "09:00", endTime: "17:00" }] },
      ].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const handleRemoveDate = (dateStr: string) =>
    setSpecificDates((prev: DateEntry[]) => prev.filter((d) => d.date !== dateStr));

  // S2004 Fixed: Passed standard modules directly into hook triggers to un-nest arrow constraints
  const handleAddSlot = (dateStr: string) => setSpecificDates(addSlotToDate(dateStr));
  const handleRemoveSlot = (dateStr: string, index: number) =>
    setSpecificDates(removeSlotFromDate(dateStr, index));
  const handleUpdateSlot = (dateStr: string, index: number, field: string, value: string) =>
    setSpecificDates(updateSlotInDate(dateStr, index, field, value));

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y: number) => y - 1);
    } else setCalMonth((m: number) => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y: number) => y + 1);
    } else setCalMonth((m: number) => m + 1);
  };

  const today = getTodayLocal();
  const futureDates = specificDates.filter((d) => d.date >= today);

  return {
    calYear,
    calMonth,
    busySlots,
    calendarEvents,
    minDuration,
    today,
    futureDates,
    handleToggleDate,
    handleRemoveDate,
    handleAddSlot,
    handleRemoveSlot,
    handleUpdateSlot,
    handlePrevMonth,
    handleNextMonth,
  };
};
