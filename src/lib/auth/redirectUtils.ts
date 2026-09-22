/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Common utilities for role-based redirects in auth flows
// Used after login, signup, and OAuth flows

/**
 * Determine primary role from roles array
 * Mentor > Mentee priority (if multiple roles)
 */
export const getPrimaryRole = (roles) => {
  if (roles?.includes("mentor")) return "mentor";
  if (roles?.includes("mentee")) return "mentee";
  return null;
};

/**
 * Get dashboard path for a role
 */
export const getDashboardPath = (role) => {
  return role ? `/dashboard/${role}` : "/";
};

/**
 * Get onboarding path for a role
 */
export const getOnboardingPath = (role) => {
  return role ? `/onboarding/${role}` : "/";
};

/**
 * Common redirect delays (ms)
 */
export const REDIRECT_DELAYS = {
  IMMEDIATE: 0,
  SHORT: 500,
  MEDIUM: 700,
  LONG: 1000,
  EXTRA_LONG: 1500,
};

/**
 * Get base API URL from environment or fallback
 */
export const getBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Build OAuth redirect URL
 */
export const buildOAuthUrl = (provider, params = {}) => {
  const baseUrl = getBaseUrl();
  const searchParams = new URLSearchParams(params);
  return `${baseUrl}/auth/${provider}?${searchParams}`;
};
