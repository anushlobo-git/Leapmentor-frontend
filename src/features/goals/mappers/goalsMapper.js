/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * Normalize a raw goal object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw goal object from API
 * @returns {Object} Normalized goal object with guaranteed field structure
 */
export const mapGoal = (raw) => {
  if (!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    startDate: raw.startDate ?? null,
    endDate: raw.endDate ?? null,
    status: raw.status ?? null,
    connectRequestId: raw.connectRequestId ?? raw.connectRequest ?? null,
    createdBy: raw.createdBy ?? null,
    mentor: raw.mentor ?? null,
    mentee: raw.mentee ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

/**
 * Normalize a raw milestone object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw milestone object from API
 * @returns {Object} Normalized milestone object with guaranteed field structure
 */
export const mapMilestone = (raw = {}) => {
  if (!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    dueDate: raw.dueDate ?? null,
    isCompleted: Boolean(raw.isCompleted),
    completedAt: raw.completedAt ?? null,
    completedBy: raw.completedBy ?? null,
    goalId: raw.goalId ?? raw.goal?._id ?? raw.goal?.id ?? raw.goal ?? null,
    connectRequestId: raw.connectRequestId ?? raw.connectRequest ?? null,
    order: typeof raw.order === "number" ? raw.order : 0,
    slotIndex: typeof raw.slotIndex === "number" ? raw.slotIndex : null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};
