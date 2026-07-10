/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/settingsMapper.js
//
// Single source of truth for turning raw settings/profile objects (as sent by the backend)
// into the shape our components actually rely on.
//
// Why this exists:
// useMenteeSettings.js and useMentorSettings.js store raw API responses directly into
// state (res.data for profile, wallet, user data). If the backend renames a field,
// nests something differently, or omits an object on some code path, the settings
// feature can break silently. Components reading profile.emailNotifications or
// wallet.balance would crash if those fields are undefined.
//
// Mapping once, at the data-fetching boundary, means:
//   - one place to update when the backend DTO changes
//   - guaranteed defaults, so components never do `profile?.emailNotifications` or `wallet?.balance`
//   - a single, testable function instead of re-derived assumptions in multiple files

/**
 * Normalize a raw mentee profile object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw mentee profile object from API
 * @returns {Object} Normalized mentee profile object with guaranteed field structure
 */
export const mapMenteeSettings = (raw = {}) => ({
  emailNotifications: Boolean(raw.emailNotifications),
  marketingPreferences: Boolean(raw.marketingPreferences),
});

/**
 * Normalize a raw mentor profile object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw mentor profile object from API
 * @returns {Object} Normalized mentor profile object with guaranteed field structure
 */
export const mapMentorSettings = (raw = {}) => ({
  hourlyRate: typeof raw.hourlyRate === "number" ? raw.hourlyRate : Number(raw.hourlyRate) || 0,
  emailNotifications: Boolean(raw.emailNotifications),
  isProfilePublished: raw.isProfilePublished ?? raw.publicProfile ?? true,
  totalSessions: typeof raw.totalSessions === "number" ? raw.totalSessions : 0,
  avgRating: typeof raw.avgRating === "number" ? raw.avgRating : Number(raw.avgRating) || 0,
});

/**
 * Normalize a raw wallet object from the API into the internal shape used across the app.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw wallet object from API
 * @returns {Object} Normalized wallet object with guaranteed field structure
 */
export const mapWallet = (raw = {}) => ({
  balance: typeof raw.balance === "number" ? raw.balance : 0,
  escrow: typeof raw.escrow === "number" ? raw.escrow : 0,
});

/**
 * Normalize a raw user object (for password-related fields) from the API into the internal shape.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw user object from API
 * @returns {Object} Normalized user object with guaranteed field structure
 */
export const mapUserPasswordInfo = (raw = {}) => ({
  passwordChangedAt: raw.passwordChangedAt ?? null,
});
