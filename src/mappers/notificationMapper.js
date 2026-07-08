/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Formats a date string into a human-readable "time ago" string.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted time ago string (e.g., "5 minutes ago", "Yesterday")
 */
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

/**
 * Normalizes a raw API notification object into a consistent internal shape.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} notif - Raw notification object from API
 * @returns {Object} Normalized notification object with guaranteed field structure
 */
export const normalizeApiNotif = (notif) => ({
  id: notif._id ?? null,
  _id: notif._id ?? null,
  type: notif.type ?? "",
  read: notif.read ?? false,
  time: timeAgo(notif.createdAt),
  accent: notif.type === "upcoming_session" && !notif.read,
  title: notif.title ?? "",
  senderName: notif.senderName ?? "",
  body: notif.message ?? "",
  actions: [],
  isApi: true,
  metadata: notif.metadata ?? {},
});
