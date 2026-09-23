/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * @fileoverview Central Role Registry (frontend)
 * @description
 * This is the single place the frontend defines which roles exist, what
 * they're called in the UI, and what routing behavior belongs to each one.
 * It intentionally mirrors the backend's constants/roles.js so both sides
 * of the app agree on role names without a shared package — if a role is
 * renamed or added on the backend, this file is the one place to update
 * here too.
 *
 * Before this file existed, "which role wins when a user has several" and
 * "where does this role log in / land" were each reimplemented separately
 * in four different files (useHomePresenter, useGoogleAuth,
 * useSSOCallbackPresenter, useLoginPresenter — the last of which had its
 * own private copy of the exact function that already existed in
 * lib/auth/redirectUtils.ts). Adding a role meant finding and editing all
 * of them. Now there is one priority list and one config object; every
 * consumer imports from here.
 */

/** Every role a *user account* can hold (mirrors backend ALL_ROLES). */
export const ROLES = Object.freeze({
  MENTOR: "mentor",
  MENTEE: "mentee",
} as const);

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

/**
 * When an account holds more than one role and something needs a single
 * "primary" one (which dashboard to land on, what to put in the authRole
 * routing-hint cookie), earlier entries here win the tie.
 */
export const ROLE_PRIORITY: Role[] = [ROLES.MENTOR, ROLES.MENTEE];

/**
 * Admin is a fully separate authentication domain on the backend (its own
 * collection, its own cookie-based session — see the backend's
 * constants/roles.js for the full reasoning) but it still needs to flow
 * through the SAME route guard component on the frontend (ProtectedRoute),
 * because a person navigating the app doesn't care that the two are
 * architecturally distinct. RouteRole is the union ProtectedRoute actually
 * accepts; Role (above) is the narrower "real account role" set used for
 * things like the register form and the "add a role to my account" flow.
 */
export const ADMIN_ROLE = "admin" as const;
export type RouteRole = Role | typeof ADMIN_ROLE;

/**
 * Per-role UI/routing configuration. Adding a new role that needs its own
 * login page and dashboard is a new entry here plus one entry in
 * ROLE_PAGES (app/routes.tsx) saying which components render at these
 * URLs. The router, ProtectedRoute, the auth redirect helpers, and the
 * login-path lookups all read from this object instead of hardcoding role
 * names, and TypeScript refuses to compile until every registry
 * (ROLE_CONFIG, ROLE_PERMISSIONS, ROLE_PAGES) has the new role.
 */
interface RoleRouteConfig {
  /** Where an unauthenticated user hitting a role-guarded route is sent. */
  loginPath: string;
  /** Where a signed-in holder of this role lands by default. Optional —
   * admin doesn't have a single landing dashboard the way mentor/mentee do. */
  dashboardPath?: string;
  /** Where a brand-new account of this role is sent to finish onboarding. */
  onboardingPath?: string;
  /** This role's "edit my profile" page. */
  editProfilePath?: string;
  /**
   * "bearer" roles carry a Redux access token + refresh flow and go through
   * email verification (mentor/mentee). "cookie" roles are a simpler,
   * self-contained session with no client-visible token and no email
   * verification step (admin). ProtectedRoute branches on this instead of
   * a hardcoded `role === "admin"` check.
   */
  sessionType: "bearer" | "cookie";
}

export const ROLE_CONFIG: Record<RouteRole, RoleRouteConfig> = Object.freeze({
  [ROLES.MENTOR]: {
    loginPath: "/login/mentor",
    dashboardPath: "/dashboard/mentor",
    onboardingPath: "/onboarding/mentor",
    editProfilePath: "/dashboard/mentor/edit-profile",
    sessionType: "bearer",
  },
  [ROLES.MENTEE]: {
    loginPath: "/login/mentee",
    dashboardPath: "/dashboard/mentee",
    onboardingPath: "/onboarding/mentee",
    editProfilePath: "/dashboard/mentee/edit-profile",
    sessionType: "bearer",
  },
  [ADMIN_ROLE]: {
    loginPath: "/admin/login",
    sessionType: "cookie",
  },
});

/**
 * Which role's login page the bare `/login` URL shows. Kept here (not
 * hardcoded in the router) so changing the default is a one-line edit.
 */
export const DEFAULT_LOGIN_ROLE: Role = ROLES.MENTEE;

/** Is this a role name the frontend recognizes as a real account role? */
export const isValidRole = (role: unknown): role is Role =>
  typeof role === "string" && (ALL_ROLES as string[]).includes(role);

/**
 * Picks one "primary" role out of an account's roles array. Same semantics
 * as the backend's getPrimaryRole — ties broken by ROLE_PRIORITY, and a
 * role outside the priority list is used as-is rather than discarded, so a
 * future role still gets a sane single answer even before someone remembers
 * to add it to ROLE_PRIORITY.
 */
export const getPrimaryRole = (roles?: string[] | null): Role | null => {
  if (!roles || roles.length === 0) return null;
  for (const candidate of ROLE_PRIORITY) {
    if (roles.includes(candidate)) return candidate;
  }
  return (roles[0] as Role) ?? null;
};

// ── Fine-grained permissions ────────────────────────────────────────────
// This is a hand-maintained MIRROR of the backend's PERMISSIONS and
// ROLE_PERMISSIONS (Leapmentor-backend/constants/roles.js) — same strings,
// same role → permission grants. The backend is the actual authority and
// re-checks every request with requireRole / requirePermission; this copy
// only decides what the UI shows and which routes it lets you navigate to.
//
// If you change one side, change the other in the same PR. (Long term the
// cleaner fix is for the backend to return `permissions` on the user object
// so there's no second copy at all.)
export const PERMISSIONS = Object.freeze({
  // Mentee-side actions
  BOOK_SESSION: "session:book",
  SEARCH_MENTORS: "mentor:search",
  SUBMIT_FEEDBACK: "feedback:submit",
  MANAGE_GOALS: "goal:manage",

  // Mentor-side actions
  MANAGE_AVAILABILITY: "availability:manage",
  RESPOND_TO_CONNECT_REQUEST: "connect_request:respond",
  VIEW_EARNINGS: "earnings:view",
  UPLOAD_VERIFICATION_DOCS: "verification:upload",

  // Actions available to any account holding either role
  SEND_MESSAGE: "message:send",
  UPLOAD_NOTE: "note:upload",
  MANAGE_PRIVATE_NOTES: "private_note:manage",
  SUBMIT_REPORT: "report:submit",
} as const);

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> =
  Object.freeze({
    [ROLES.MENTEE]: Object.freeze([
      PERMISSIONS.BOOK_SESSION,
      PERMISSIONS.SEARCH_MENTORS,
      PERMISSIONS.SUBMIT_FEEDBACK,
      PERMISSIONS.MANAGE_GOALS,
      PERMISSIONS.SEND_MESSAGE,
      PERMISSIONS.UPLOAD_NOTE,
      PERMISSIONS.MANAGE_PRIVATE_NOTES,
      PERMISSIONS.SUBMIT_REPORT,
    ]),
    [ROLES.MENTOR]: Object.freeze([
      PERMISSIONS.MANAGE_AVAILABILITY,
      PERMISSIONS.RESPOND_TO_CONNECT_REQUEST,
      PERMISSIONS.VIEW_EARNINGS,
      PERMISSIONS.UPLOAD_VERIFICATION_DOCS,
      PERMISSIONS.SEND_MESSAGE,
      PERMISSIONS.UPLOAD_NOTE,
      PERMISSIONS.MANAGE_PRIVATE_NOTES,
      PERMISSIONS.SUBMIT_REPORT,
    ]),
  });

/**
 * De-duplicated union of the permissions granted by every role in `roles`
 * (a mentor+mentee account gets both sets). Unknown roles grant nothing.
 */
export const getPermissionsForRoles = (
  roles: readonly string[] | null | undefined,
): Permission[] => {
  if (!Array.isArray(roles)) return [];
  const granted = new Set<Permission>();
  for (const role of roles) {
    if (!isValidRole(role)) continue;
    for (const permission of ROLE_PERMISSIONS[role]) granted.add(permission);
  }
  return [...granted];
};

/** True if any of `roles` grants `permission`. */
export const hasPermission = (
  roles: readonly string[] | null | undefined,
  permission: Permission,
): boolean => getPermissionsForRoles(roles).includes(permission);

/**
 * True if any of `roles` grants at least one of `permissions` — the same
 * OR semantics as the backend's requirePermission(...permissions).
 */
export const hasAnyPermission = (
  roles: readonly string[] | null | undefined,
  permissions: readonly Permission[],
): boolean => {
  const granted = getPermissionsForRoles(roles);
  return permissions.some((permission) => granted.includes(permission));
};
