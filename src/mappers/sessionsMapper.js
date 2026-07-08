/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/sessionsMapper.js

/**
 * Normalize a raw session slot object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw slot object from API
 * @returns {Object} Normalized slot object with guaranteed field structure
 */
export const mapSlot = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,
  day: raw.day ?? "",
  date: raw.date ?? null,
  startTime: raw.startTime ?? "",
  endTime: raw.endTime ?? "",
  meetingLink: raw.meetingLink ?? null,
  status: raw.status ?? "scheduled",
  isCompleted: Boolean(raw.isCompleted),
  isCancelled: Boolean(raw.isCancelled),
  menteeMarked: Boolean(raw.menteeMarked),
  mentorMarked: Boolean(raw.mentorMarked),
  isRescheduled: Boolean(raw.isRescheduled),
  cancelledBy: raw.cancelledBy ?? null,
  cancellationReason: raw.cancellationReason ?? raw.cancelReason ?? null,
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});

/**
 * Normalize the full session slots response payload (already unwrapped by axiosInstance,
 * i.e. res.data) into { slots, completedSlots, totalSlots, progress, allComplete }.
 * Defensive against any field being missing entirely.
 * @param {Object} raw - Raw response object from API
 * @returns {Object} Normalized response object with guaranteed field structure
 */
export const mapSessionSlotsResponse = (raw = {}) => ({
  slots: Array.isArray(raw.slots) ? raw.slots.map(mapSlot) : [],
  completedSlots: typeof raw.completedSlots === "number" ? raw.completedSlots : 0,
  totalSlots: typeof raw.totalSlots === "number" ? raw.totalSlots : 0,
  progress: typeof raw.progress === "number" ? raw.progress : 0,
  allComplete: Boolean(raw.allComplete),
});
