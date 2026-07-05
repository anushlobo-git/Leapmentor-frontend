// src/mappers/mentorMapper.js
//
// Single source of truth for turning a raw mentor object (as sent by the
// backend, via `mentorSearch.service.js` -> toMentorProfileDTO) into the
// shape our components actually rely on.
//
// Why this exists:
// MentorCard, MentorProfileModal, MentorGrid, and HomeTab each destructure
// mentor fields directly from whatever the API happens to send. If the
// backend renames a field, nests something differently, or omits an object
// on some code path (e.g. Atlas search vs plain list vs regex fallback),
// every one of those components can break independently and silently
// (PropTypes only warns in dev, it doesn't stop a crash on `undefined.name`).
//
// Mapping once, at the data-fetching boundary, means:
//   - one place to update when the backend DTO changes
//   - guaranteed defaults, so components never do `mentor?.skills?.length` etc.
//   - a single, testable function instead of re-derived assumptions in 5 files

/**
 * Normalize a single raw mentor record from the API into the internal shape
 * used across the app.
 */
export const mapMentorProfile = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,

  user: {
    _id: raw.user?._id ?? raw.user?.id ?? null,
    name: raw.user?.name ?? "",
  },

  currentRole: raw.currentRole ?? "",
  company: raw.company ?? "",
  industry: raw.industry ?? "",
  bio: raw.bio ?? "",
  location: raw.location ?? "",

  skills: Array.isArray(raw.skills) ? raw.skills : [],

  hourlyRate: typeof raw.hourlyRate === "number" ? raw.hourlyRate : null,
  avgRating: typeof raw.avgRating === "number" ? raw.avgRating : Number(raw.avgRating) || 0,
  reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
  totalSessions: typeof raw.totalSessions === "number" ? raw.totalSessions : 0,
  yearsOfExperience:
    typeof raw.yearsOfExperience === "number" ? raw.yearsOfExperience : null,

  profilePicture: raw.profilePicture || null,
  verificationStatus: raw.verificationStatus ?? "unverified",
});

/**
 * Normalize the pagination block. Backend currently sends
 * `currentPage`/`totalPages` on some paths and (per the pending backend fix)
 * `page`/`limit` on others — this absorbs that inconsistency in one spot,
 * and guarantees hasMore/totalCount always exist so callers never need to
 * null-check `pagination` before reading off it.
 */
export const mapPagination = (raw = {}) => ({
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
export const mapMentorSearchResponse = (data = {}) => ({
  mentors: Array.isArray(data.mentors) ? data.mentors.map(mapMentorProfile) : [],
  pagination: mapPagination(data.pagination ?? {}),
});
