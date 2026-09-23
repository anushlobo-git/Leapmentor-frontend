/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Formats a slot date for display in the app's concise weekday/month/day format.
 * @param {{ date?: string } | null | undefined} slot - Session slot object.
 * @returns {string} Human-readable date or an empty string when unavailable.
 */
export const formatSlotDate = (slot) => {
  if (!slot?.date) return "";
  return new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a slot's start and end times into a single readable time range.
 * @param {{ startTime?: string, endTime?: string } | null | undefined} slot - Session slot object.
 * @returns {string} Human-readable time range or an empty string when unavailable.
 */
export const formatSlotTime = (slot) => {
  if (!slot?.startTime || !slot?.endTime) return "";
  const fmt = (t) => {
    const [h, m] = t.split(":");
    const hour = Number.parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };
  return `${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
};
