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

  user: {
    _id: raw.user?._id ?? raw.user?.id ?? null,
    name: raw.user?.name ?? "",
    email: raw.user?.email ?? "",
    isEmailVerified: Boolean(raw.user?.isEmailVerified ?? raw.isEmailVerified),
  },

  profilePicture: raw.profilePicture ?? raw.avatar ?? null,
  profilePictureFileName: raw.profilePictureFileName ?? null,
  bio: raw.bio ?? "",

  currentRole: raw.currentRole ?? "",
  company: raw.company ?? "",
  industry: raw.industry ?? "",
  yearsOfExperience:
    typeof raw.yearsOfExperience === "number"
      ? raw.yearsOfExperience
      : Number(raw.yearsOfExperience) || null,

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
  phoneNumber: raw.phoneNumber ?? null,
  isProfilePublished: raw.isProfilePublished ?? false,
  emailNotifications: raw.emailNotifications ?? true,
  marketingPreferences: raw.marketingPreferences ?? false,

  isProfileComplete: Boolean(raw.isProfileComplete),

  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});
