/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/reportMapper.js
//
// Single source of truth for turning raw feedback objects (as sent by the backend)
// into the shape our components actually rely on.
//
// Why this exists:
// useReport.js stores raw API responses directly into state (myFeedback, theirFeedback,
// sessionStatus). If the backend renames a field, nests something differently, or omits
// an object on some code path, the feedback feature can break silently. Components
// reading feedback.rating or feedback.comment would crash if those fields are undefined.
//
// Mapping once, at the data-fetching boundary, means:
//   - one place to update when the backend DTO changes
//   - guaranteed defaults, so components never do `feedback?.rating` or `feedback?.comment`
//   - a single, testable function instead of re-derived assumptions in multiple files

/**
 * Normalize a raw feedback object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw feedback object from API
 * @returns {Object} Normalized feedback object with guaranteed field structure
 */
export const mapFeedback = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,
  rating: typeof raw.rating === "number" ? raw.rating : Number(raw.rating) || 0,
  comment: raw.comment ?? "",
  fromUserId: raw.fromUserId ?? raw.fromUser?._id ?? null,
  toUserId: raw.toUserId ?? raw.toUser?._id ?? null,
  connectRequestId: raw.connectRequestId ?? raw.connectRequest?._id ?? null,
  slotIndex: typeof raw.slotIndex === "number" ? raw.slotIndex : null,
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});
