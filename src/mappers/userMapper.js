/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/userMapper.js

/**
 * Normalize a raw user object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw user object from API
 * @returns {Object} Normalized user object with guaranteed field structure
 */
export const mapAuthUser = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,
  name: raw.name ?? "",
  email: raw.email ?? "",
  roles: Array.isArray(raw.roles) ? raw.roles : [],
  profilePicture:
    raw.profilePicture ?? raw.avatar ?? raw.user?.profilePicture ?? null,
  isVerified: Boolean(
    raw.isEmailVerified ?? raw.isVerified ?? raw.emailVerified,
  ),
  termsAccepted: Boolean(raw.termsAccepted ?? false),
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});
