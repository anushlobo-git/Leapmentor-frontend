/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/menteeMapper.js

/**
 * Normalize a raw mentee profile object from the API into the internal shape
 * used across the app.
 */
export const mapMenteeProfile = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,

  profilePicture: raw.profilePicture ?? null,
  bio: raw.bio ?? "",

  currentRole: raw.currentRole ?? "",
  company: raw.company ?? "",
  industry: raw.industry ?? "",
  yearsOfExperience:
    typeof raw.yearsOfExperience === "number" ? raw.yearsOfExperience : null,

  skills: Array.isArray(raw.skills) ? raw.skills : [],
  interestedFields: Array.isArray(raw.interestedFields)
    ? raw.interestedFields
    : [],
  communicationPreferences: Array.isArray(raw.communicationPreferences)
    ? raw.communicationPreferences
    : [],
  languages: Array.isArray(raw.languages) ? raw.languages : [],

  linkedInUrl: raw.linkedInUrl ?? null,
  portfolioUrl: raw.portfolioUrl ?? null,

  isProfileComplete: Boolean(raw.isProfileComplete),

  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});
