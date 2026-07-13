/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Normalize a raw feedback object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw feedback object from API
 * @returns {Object} Normalized feedback object with guaranteed field structure
 */
export const mapFeedback = (raw = {}) => {
  const fromUser = raw.fromUser ?? raw.from ?? null;
  const toUser = raw.toUser ?? raw.to ?? null;

  return {
    _id: raw._id ?? raw.id ?? null,
    rating:
      typeof raw.rating === "number" ? raw.rating : Number(raw.rating) || 0,
    comment: raw.comment ?? "",
    fromUserId:
      raw.fromUserId ??
      fromUser?._id ??
      fromUser?.id ??
      raw.fromUser?._id ??
      null,
    toUserId:
      raw.toUserId ?? toUser?._id ?? toUser?.id ?? raw.toUser?._id ?? null,
    fromUser: fromUser
      ? {
          _id: fromUser._id ?? fromUser.id ?? null,
          name: fromUser.name ?? "",
          email: fromUser.email ?? null,
        }
      : null,
    toUser: toUser
      ? {
          _id: toUser._id ?? toUser.id ?? null,
          name: toUser.name ?? "",
          email: toUser.email ?? null,
        }
      : null,
    connectRequestId:
      raw.connectRequestId ??
      raw.connectRequest?._id ??
      raw.connectRequest ??
      null,
    slotIndex: typeof raw.slotIndex === "number" ? raw.slotIndex : null,
    fromRole: raw.fromRole ?? "",
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};
