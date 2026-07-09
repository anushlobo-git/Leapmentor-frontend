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
  if(!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    startDate: raw.startDate ?? null,
    endDate: raw.endDate ?? null,
    connectRequestId: raw.connectRequestId ?? raw.connectRequest,
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
  if(!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    dueDate: raw.dueDate ?? null,
    isCompleted: Boolean(raw.isCompleted),
    goalId: raw.goalId ?? null,
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
};
};
