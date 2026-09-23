/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// Common utilities for role-based redirects in auth flows
// Used after login, signup, and OAuth flows

import {
  ROLE_CONFIG,
  getPrimaryRole as getPrimaryRoleFromRegistry,
  type RouteRole,
} from "@constants/roles";

/**
 * Determine primary role from roles array.
 * Delegates to the central role registry (constants/roles.ts) so the
 * mentor > mentee tie-break lives in exactly one place — this function is
 * kept as a re-export so every existing `import { getPrimaryRole } from
 * "@lib/auth/redirectUtils"` call site keeps working unchanged.
 */
export const getPrimaryRole = (roles?: string[] | null) =>
  getPrimaryRoleFromRegistry(roles);

/**
 * Get dashboard path for a role. Reads ROLE_CONFIG (the same source the
 * router and ProtectedRoute use) instead of building the URL by string
 * interpolation, so a role with no dashboard (admin) or an unknown role
 * gets "/" rather than a URL that doesn't exist.
 */
export const getDashboardPath = (role?: string | null) =>
  ROLE_CONFIG[role as RouteRole]?.dashboardPath ?? "/";

/**
 * Get onboarding path for a role (same registry lookup as above).
 */
export const getOnboardingPath = (role?: string | null) =>
  ROLE_CONFIG[role as RouteRole]?.onboardingPath ?? "/";

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
