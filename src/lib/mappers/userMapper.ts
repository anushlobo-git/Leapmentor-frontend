/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/userMapper.js

/** Raw user shape as it may arrive from any of the backend's auth endpoints. */
export interface RawAuthUser {
  _id?: string | null;
  id?: string | null;
  name?: string;
  email?: string;
  roles?: string[];
  profilePicture?: string | null;
  avatar?: string | null;
  user?: { profilePicture?: string | null };
  isEmailVerified?: boolean;
  isVerified?: boolean;
  emailVerified?: boolean;
  termsAccepted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

/**
 * Normalize a raw user object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param raw - Raw user object from API
 * @returns Normalized user object with guaranteed field structure
 */
export const mapAuthUser = (raw: RawAuthUser = {}) => ({
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
