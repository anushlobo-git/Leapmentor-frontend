/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

const DEFAULT_LOCALE = "en-US";

export const formatDateString = (value, options = {}) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export const formatTimeString = (value, options = {}) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
};

/**
 * Formats a plain "HH:mm" time-of-day string (e.g. "09:00", "14:30") as
 * "09:00 AM" / "02:30 PM". Use this for slot/availability times, which are
 * time-only strings, not full dates — formatTimeString expects a real
 * date/datetime and will return "" for these.
 */
export const formatTimeOfDay = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const formatFullSlot = (value, options = {}) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${formatDateString(date, options)} ${formatTimeString(date, options)}`.trim();
};

export const formatDateTime = (value, options = {}) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(DEFAULT_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
};

/**
 * Formats a timestamp as "Today", "Yesterday", or a full date — used for
 * chat/notes-style day separators.
 */
export const formatDateSeparator = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(DEFAULT_LOCALE, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * True if two timestamps fall on the same calendar day.
 */
export const isSameDay = (a, b) => {
  if (!a || !b) return false;

  const dateA = new Date(a);
  const dateB = new Date(b);
  if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime()))
    return false;

  return dateA.toDateString() === dateB.toDateString();
};
