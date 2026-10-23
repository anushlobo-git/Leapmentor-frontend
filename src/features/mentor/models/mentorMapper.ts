/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/** Minimal shape of an uploaded document as sent by the API. */
export interface RawDocument {
  url?: string;
  uploadedAt?: string;
}

/**
 * Minimal shape of a raw mentor record from the API — every field is optional
 * because the mapper defends against missing/renamed fields.
 */
export interface RawMentorProfile {
  _id?: string;
  id?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    isEmailVerified?: boolean;
  };
  isEmailVerified?: boolean;
  currentRole?: string;
  company?: string;
  industry?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  communicationPreferences?: string[];
  languages?: string[];
  portfolioUrl?: string;
  linkedInUrl?: string;
  hourlyRate?: number;
  avgRating?: number | string;
  reviewCount?: number;
  totalSessions?: number;
  yearsOfExperience?: number;
  profilePicture?: string;
  avatar?: string;
  profilePictureFileName?: string;
  verificationStatus?: string;
  isProfilePublished?: boolean;
  emailNotifications?: boolean;
  phoneNumber?: string;
  resumeDocument?: RawDocument;
  workExperienceDocuments?: RawDocument[];
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Minimal shape of a raw pagination block from the API. */
export interface RawPagination {
  page?: number;
  currentPage?: number;
  limit?: number;
  totalCount?: number;
  hasMore?: boolean;
}

/** Minimal shape of the raw `/mentors/search` response payload. */
export interface RawMentorSearchResponse {
  mentors?: RawMentorProfile[];
  pagination?: RawPagination;
}

/**
 * Normalize a single raw mentor record from the API into the internal shape
 * used across the app.
 */
export const mapMentorProfile = (raw: RawMentorProfile = {}) => ({
  _id: raw._id ?? raw.id ?? null,

  user: {
    _id: raw.user?._id ?? raw.user?.id ?? null,
    name: raw.user?.name ?? "",
    email: raw.user?.email ?? "",
    isEmailVerified: Boolean(raw.user?.isEmailVerified ?? raw.isEmailVerified),
  },

  currentRole: raw.currentRole ?? "",
  company: raw.company ?? "",
  industry: raw.industry ?? "",
  bio: raw.bio ?? "",
  location: raw.location ?? "",

  skills: Array.isArray(raw.skills) ? raw.skills : [],

  communicationPreferences: Array.isArray(raw.communicationPreferences)
    ? raw.communicationPreferences
    : [],
  languages: Array.isArray(raw.languages) ? raw.languages : [],
  portfolioUrl: raw.portfolioUrl ?? null,
  linkedInUrl: raw.linkedInUrl ?? null,

  hourlyRate: typeof raw.hourlyRate === "number" ? raw.hourlyRate : null,
  avgRating:
    typeof raw.avgRating === "number"
      ? raw.avgRating
      : Number(raw.avgRating) || 0,
  reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
  totalSessions: typeof raw.totalSessions === "number" ? raw.totalSessions : 0,
  yearsOfExperience:
    typeof raw.yearsOfExperience === "number" ? raw.yearsOfExperience : null,

  profilePicture: raw.profilePicture ?? raw.avatar ?? null,
  profilePictureFileName: raw.profilePictureFileName ?? null,
  verificationStatus: raw.verificationStatus ?? "unverified",
  isProfilePublished: raw.isProfilePublished ?? true,
  emailNotifications: raw.emailNotifications ?? true,
  phoneNumber: raw.phoneNumber ?? null,
  resumeDocument: raw.resumeDocument ?? null,
  workExperienceDocuments: Array.isArray(raw.workExperienceDocuments)
    ? raw.workExperienceDocuments
    : [],

  isProfileComplete: Boolean(raw.isProfileComplete),
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});

/**
 * Normalize the pagination block. Backend currently sends
 * `currentPage`/`totalPages` on some paths and (per the pending backend fix)
 * `page`/`limit` on others — this absorbs that inconsistency in one spot,
 * and guarantees hasMore/totalCount always exist so callers never need to
 * null-check `pagination` before reading off it.
 */
export const mapPagination = (raw: RawPagination = {}) => ({
  page: raw.page ?? raw.currentPage ?? 1,
  limit: raw.limit ?? 6,
  totalCount: typeof raw.totalCount === "number" ? raw.totalCount : 0,
  hasMore: Boolean(raw.hasMore),
});

/**
 * Maps the full `/mentors/search` response payload (already unwrapped by
 * axiosInstance, i.e. `res.data`) into `{ mentors, pagination }`.
 * Defensive against either field being missing entirely.
 */
export const mapMentorSearchResponse = (data: RawMentorSearchResponse = {}) => ({
  mentors: Array.isArray(data.mentors)
    ? data.mentors.map(mapMentorProfile)
    : [],
  pagination: mapPagination(data.pagination ?? {}),
});
