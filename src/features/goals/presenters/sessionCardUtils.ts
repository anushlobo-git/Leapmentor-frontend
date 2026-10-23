/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/utils/sessionCardUtils.js
// Pure, framework-free helpers shared across the SessionCard component family.
export { formatTimeString as formatTime } from "@lib/formatters/dateTime";

/**
 * Shared shape of a session slot object, used across the whole
 * SessionCard component family (this was previously a PropTypes.shape
 * in sessionCardPropTypes.js - superseded by this interface as those
 * components migrate to TypeScript).
 */
export interface SessionSlot {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  meetingLink?: string;
  menteeMarked?: boolean;
  mentorMarked?: boolean;
  isRescheduled?: boolean;
  cancelledBy?: string;
  cancellationReason?: string;
}

export const formatSlotDate = (slot: SessionSlot | undefined) => {
  if (!slot?.date) return "";
  return new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isActive = (slot: SessionSlot | undefined) => !slot?.status || slot?.status !== "cancelled";

// ── Meeting link validator ─────────────────────────────────────
const ALLOWED_MEETING_DOMAINS = [
  "meet.google.com",
  "zoom.us",
  "teams.microsoft.com",
  "whereby.com",
  "around.co",
  "meet.jit.si",
  "webex.com",
];

export const isValidMeetingLink = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_MEETING_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
};

// ── Style helpers (kept out of JSX to avoid nested ternaries) ──
export const getSlotPillClasses = (selected: boolean, booked: boolean) => {
  if (selected)
    return "bg-blue-900 border-blue-900 shadow-lg shadow-blue-100 scale-[1.02]";
  if (booked)
    return "bg-slate-50 border-slate-100 cursor-not-allowed opacity-40";
  return "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md cursor-pointer";
};

export const getDayTabClasses = (isActiveTab: boolean, freeCnt: number) => {
  if (isActiveTab) return "bg-blue-900 border-blue-900 shadow-md";
  if (freeCnt === 0)
    return "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed";
  return "bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50";
};

// ── Session status helpers ──────────────────────────────────────
const STATUS_CONFIG = {
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-500 border-red-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  inProgress: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

export const getSessionStatus = (slot: SessionSlot | undefined, cancelled: boolean, bothDone: boolean) => {
  if (cancelled) return STATUS_CONFIG.cancelled;
  if (bothDone) return STATUS_CONFIG.completed;
  if (slot?.menteeMarked || slot?.mentorMarked) return STATUS_CONFIG.inProgress;
  return STATUS_CONFIG.pending;
};

export const getCardBorderClass = (cancelled: boolean, bothDone: boolean) => {
  if (cancelled) return "opacity-60 border-red-100";
  if (bothDone) return "border-emerald-200";
  return "border-slate-200";
};

export const isMoreThan12HrsAway = (targetSlot: SessionSlot | undefined) => {
  if (!targetSlot?.date || !targetSlot?.startTime) return false;
  const sessionDateTime = new Date(
    `${targetSlot.date}T${targetSlot.startTime}`,
  );
  const diffMs = sessionDateTime.getTime() - Date.now();
  return diffMs > 12 * 60 * 60 * 1000;
};
