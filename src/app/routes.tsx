/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * @fileoverview Route registry
 * @description
 * App.tsx used to spell out every route by hand, including the literal
 * strings "mentor" / "mentee" / "admin" and each role's URLs. This file
 * turns that into data, and derives the role-specific routes from the role
 * registry (constants/roles.ts) instead of restating it.
 *
 * How to add a new account role (say "moderator"):
 *   1. constants/roles.ts — add it to ROLES, ROLE_PRIORITY, ROLE_CONFIG
 *      (loginPath, dashboardPath, onboardingPath, editProfilePath) and
 *      ROLE_PERMISSIONS (mirror the backend).
 *   2. Below — add ONE entry to ROLE_PAGES with that role's components.
 *      ROLE_PAGES is typed Record<Role, …>, so TypeScript refuses to
 *      compile until you do; the login, onboarding, dashboard and
 *      edit-profile routes (and their guards) are then generated for you.
 *   3. App.tsx does not change.
 *
 * Route access lives on each route as `access: { roles?, permissions? }`
 * and is enforced by <ProtectedRoute>. Remember the frontend only decides
 * what to *show* — the backend (authenticate + requireRole /
 * requirePermission) is the real enforcement.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import {
  ADMIN_ROLE,
  ALL_ROLES,
  DEFAULT_LOGIN_ROLE,
  PERMISSIONS,
  ROLES,
  ROLE_CONFIG,
  type Permission,
  type Role,
  type RouteRole,
} from "@constants/roles";

type Page = LazyExoticComponent<ComponentType<any>>;

export interface RouteAccess {
  /** The user must hold at least one of these roles. */
  roles?: RouteRole[];
  /** The user's roles must grant at least one of these permissions. */
  permissions?: Permission[];
}

export interface RouteDef {
  path: string;
  Page: Page;
  /** Optional wrapper rendered around the page (inside the guard). */
  Layout?: Page;
}

export interface GuardedRouteDef extends RouteDef {
  access: RouteAccess;
}

// ── Public pages ──────────────────────────────────────────────
const Register = lazy(() => import("@features/auth/views/Register"));
const VerifyEmail = lazy(() => import("@features/auth/views/VerifyEmail"));
const ForgotPassword = lazy(() => import("@features/auth/views/ForgotPassword"));
const SSOCallback = lazy(() => import("@features/auth/views/SSOCallback"));

// ── Per-role pages ────────────────────────────────────────────
const LoginMentor = lazy(() => import("@features/auth/views/LoginMentor"));
const LoginMentee = lazy(() => import("@features/auth/views/LoginMentee"));
const MentorOnboarding = lazy(() => import("@features/mentor/views/MentorOnboarding"));
const MentorVerification = lazy(() => import("@features/mentor/views/MentorVerification"));
const MenteeOnboarding = lazy(() => import("@features/mentee/views/MenteeOnboarding"));
const MentorEditProfileShell = lazy(
  () => import("@features/mentor/views/profile/MentorEditProfileShell"),
);
const MenteeEditProfileShell = lazy(
  () => import("@features/mentee/views/profile/MenteeEditProfileShell"),
);
const MentorDashboard = lazy(() => import("@features/mentor/views/MentorDashboard"));
const MenteeDashboard = lazy(() => import("@features/mentee/views/MenteeDashboard"));

// ── Admin pages ───────────────────────────────────────────────
const AdminLogin = lazy(() => import("@features/admin/views/AdminLogin"));
const AdminUserManagement = lazy(() => import("@features/admin/views/AdminUserManagement"));
const AdminEngagements = lazy(() => import("@features/admin/views/AdminEngagements"));
const AdminReports = lazy(() => import("@features/admin/views/AdminReports"));
const AdminPayments = lazy(() => import("@features/admin/views/AdminPayments"));
const AdminSettings = lazy(() => import("@features/admin/views/AdminSettings"));
const AdminSupportMessages = lazy(() => import("@features/admin/views/AdminSupportMessages"));
const AdminLayout = lazy(() => import("@features/admin/views/AdminLayout"));
const AdminWalletRequests = lazy(() => import("@features/admin/views/AdminWalletRequests"));
const AdminVerifications = lazy(() => import("@features/admin/views/AdminVerifications"));

/**
 * The only place that maps a role to its concrete components. URLs come
 * from ROLE_CONFIG; this just says which component renders at each one.
 */
interface RolePages {
  Login: Page;
  Onboarding: Page;
  Dashboard: Page;
  EditProfile: Page;
  /** Extra guarded pages only this role uses. */
  extra?: Array<{ path: string; Page: Page; permissions?: Permission[] }>;
}

const ROLE_PAGES: Record<Role, RolePages> = {
  [ROLES.MENTOR]: {
    Login: LoginMentor,
    Onboarding: MentorOnboarding,
    Dashboard: MentorDashboard,
    EditProfile: MentorEditProfileShell,
    extra: [
      {
        path: "/verify-documents",
        Page: MentorVerification,
        // Uploading verification documents is a capability, not a job title.
        permissions: [PERMISSIONS.UPLOAD_VERIFICATION_DOCS],
      },
    ],
  },
  [ROLES.MENTEE]: {
    Login: LoginMentee,
    Onboarding: MenteeOnboarding,
    Dashboard: MenteeDashboard,
    EditProfile: MenteeEditProfileShell,
  },
};

// ── Public routes (no guard) ──────────────────────────────────
export const PUBLIC_ROUTES: RouteDef[] = [
  { path: "/register", Page: Register },
  // Bare /login shows the default role's login page.
  //DEFAULT_LOGIN_ROLE--"mentee"
  { path: "/login", Page: ROLE_PAGES[DEFAULT_LOGIN_ROLE].Login },
  ...ALL_ROLES.map((role) => ({
    path: ROLE_CONFIG[role].loginPath,
    Page: ROLE_PAGES[role].Login,
  })),
  { path: "/verify-email", Page: VerifyEmail },
  { path: "/forgot-password", Page: ForgotPassword },
  { path: "/sso-callback", Page: SSOCallback },
];

// ── Role-guarded routes, generated from the registry ──────────
const roleRoutes = (role: Role): GuardedRouteDef[] => {
  const { onboardingPath, dashboardPath, editProfilePath } = ROLE_CONFIG[role];
  const pages = ROLE_PAGES[role];
  const access: RouteAccess = { roles: [role] };

  const candidates: Array<GuardedRouteDef | null> = [
    onboardingPath ? { path: onboardingPath, Page: pages.Onboarding, access } : null,
    editProfilePath ? { path: editProfilePath, Page: pages.EditProfile, access } : null,
    dashboardPath ? { path: dashboardPath, Page: pages.Dashboard, access } : null,
    ...(pages.extra ?? []).map(({ path, Page, permissions }) => ({
      path,
      Page,
      // The role decides which login page an anonymous visitor is sent to;
      // the permission is what actually gates the page.
      access: { roles: [role], permissions },
    })),
  ];
  return candidates.filter((route): route is GuardedRouteDef => route !== null);
};

export const ROLE_GUARDED_ROUTES: GuardedRouteDef[] = ALL_ROLES.flatMap(roleRoutes);

// ── Admin (separate cookie-session domain) ────────────────────
export const ADMIN_LOGIN_ROUTE: RouteDef = {
  path: ROLE_CONFIG[ADMIN_ROLE].loginPath,
  Page: AdminLogin,
};

const adminAccess: RouteAccess = { roles: [ADMIN_ROLE] };

export const ADMIN_ROUTES: GuardedRouteDef[] = [
  { path: "/admin/users", Page: AdminUserManagement },
  { path: "/admin/engagements", Page: AdminEngagements },
  { path: "/admin/reports", Page: AdminReports },
  { path: "/admin/payments", Page: AdminPayments },
  { path: "/admin/settings", Page: AdminSettings },
  { path: "/admin/wallet-requests", Page: AdminWalletRequests },
  { path: "/admin/support", Page: AdminSupportMessages, Layout: AdminLayout },
  { path: "/admin/verifications", Page: AdminVerifications, Layout: AdminLayout },
].map((route) => ({ ...route, access: adminAccess }));
