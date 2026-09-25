/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/**
 * @fileoverview Route registry (data router)
 * @description
 * This file has two jobs:
 *
 *  1. Declare *who* can see each page — the same flat, role-driven data as
 *     before (PUBLIC_ROUTES / ROLE_GUARDED_ROUTES / ADMIN_ROUTES). Adding a
 *     new account role still only means editing constants/roles.ts plus one
 *     entry in ROLE_PAGES below.
 *  2. Turn that data into the actual react-router-dom v7 data-router tree
 *     (`appRoutes`, a RouteObject[]) that `createBrowserRouter` consumes —
 *     with route organization (layout routes for each guarded group, one
 *     `<ProtectedRoute>` per group instead of one per page), an index route
 *     for `/admin`, per-route code-splitting via the router's own `lazy`
 *     property, and an `errorElement` per group so a crash in, say, the
 *     mentor dashboard doesn't take down the rest of the app.
 *
 * How to add a new account role (say "moderator"):
 *   1. constants/roles.ts — add it to ROLES, ROLE_PRIORITY, ROLE_CONFIG
 *      (loginPath, dashboardPath, onboardingPath, editProfilePath) and
 *      ROLE_PERMISSIONS (mirror the backend).
 *   2. Below — add ONE entry to ROLE_PAGES with that role's components.
 *      ROLE_PAGES is typed Record<Role, …>, so TypeScript refuses to
 *      compile until you do; the login, onboarding, dashboard and
 *      edit-profile routes (and their guards) are then generated for you,
 *      including their own layout route in `appRoutes`.
 *   3. App.tsx does not change.
 *
 * Route access lives on each route as `access: { roles?, permissions? }`
 * and is enforced by <ProtectedRoute>. Remember the frontend only decides
 * what to *show* — the backend (authenticate + requireRole /
 * requirePermission) is the real enforcement.
 */
import type { ComponentType } from "react";
import {
  Outlet,
  ScrollRestoration,
  redirect,
  useNavigation,
  type RouteObject,
} from "react-router-dom";
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
import ProtectedRoute from "@features/auth/components/ProtectedRoute";
import RouteErrorBoundary from "./RouteErrorBoundary";
import PageLoader from "./PageLoader";

// ── Eager loaded — tiny, always needed immediately ────────────
import Home from "@features/marketing/views/Home";
import NotFound from "@app/pages/NotFound";

/** A page/layout's code, as a dynamic import — this is what makes each
 * route's `lazy` property (Phase 3) able to code-split it. */
type Importer = () => Promise<{ default: ComponentType<any> }>;

export interface RouteAccess {
  /** The user must hold at least one of these roles. */
  roles?: RouteRole[];
  /** The user's roles must grant at least one of these permissions. */
  permissions?: Permission[];
}

export interface RouteDef {
  path: string;
  Page: Importer;
  /** Optional wrapper rendered around the page (inside the guard). */
  Layout?: Importer;
}

export interface GuardedRouteDef extends RouteDef {
  access: RouteAccess;
}

// ── Public pages ──────────────────────────────────────────────
const Register: Importer = () => import("@features/auth/views/Register");
const VerifyEmail: Importer = () => import("@features/auth/views/VerifyEmail");
const ForgotPassword: Importer = () => import("@features/auth/views/ForgotPassword");
const SSOCallback: Importer = () => import("@features/auth/views/SSOCallback");

// ── Per-role pages ────────────────────────────────────────────
const LoginMentor: Importer = () => import("@features/auth/views/LoginMentor");
const LoginMentee: Importer = () => import("@features/auth/views/LoginMentee");
const MentorOnboarding: Importer = () => import("@features/mentor/views/MentorOnboarding");
const MentorVerification: Importer = () => import("@features/mentor/views/MentorVerification");
const MenteeOnboarding: Importer = () => import("@features/mentee/views/MenteeOnboarding");
const MentorEditProfileShell: Importer = () =>
  import("@features/mentor/views/profile/MentorEditProfileShell");
const MenteeEditProfileShell: Importer = () =>
  import("@features/mentee/views/profile/MenteeEditProfileShell");
const MentorDashboard: Importer = () => import("@features/mentor/views/MentorDashboard");
const MenteeDashboard: Importer = () => import("@features/mentee/views/MenteeDashboard");

// ── Shared dashboard ────────────────────────────────────────────
const SharedDashboardPage: Importer = () =>
  import("@features/shared-dashboard/views/SharedDashboardPage");

// ── Admin pages ───────────────────────────────────────────────
const AdminSessionGate: Importer = () => import("@features/admin/views/AdminSessionGate");
const AdminLogin: Importer = () => import("@features/admin/views/AdminLogin");
const AdminUserManagement: Importer = () => import("@features/admin/views/AdminUserManagement");
const AdminEngagements: Importer = () => import("@features/admin/views/AdminEngagements");
const AdminReports: Importer = () => import("@features/admin/views/AdminReports");
const AdminPayments: Importer = () => import("@features/admin/views/AdminPayments");
const AdminSettings: Importer = () => import("@features/admin/views/AdminSettings");
const AdminSupportMessages: Importer = () => import("@features/admin/views/AdminSupportMessages");
const AdminLayout: Importer = () => import("@features/admin/views/AdminLayout");
const AdminWalletRequests: Importer = () => import("@features/admin/views/AdminWalletRequests");
const AdminVerifications: Importer = () => import("@features/admin/views/AdminVerifications");

/**
 * The only place that maps a role to its concrete components. URLs come
 * from ROLE_CONFIG; this just says which component renders at each one.
 */
interface RolePages {
  Login: Importer;
  Onboarding: Importer;
  Dashboard: Importer;
  EditProfile: Importer;
  /** Extra guarded pages only this role uses. */
  extra?: Array<{ path: string; Page: Importer; permissions?: Permission[] }>;
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

// ════════════════════════════════════════════════════════════════
// Everything below turns the data above into the RouteObject[] tree
// that createBrowserRouter actually consumes.
// ════════════════════════════════════════════════════════════════

/** Nested route paths must be relative (no leading "/") to the parent
 * they sit under — react-router throws otherwise. All our groups nest
 * directly under the pathless root, so stripping the leading slash is
 * always correct here. */
const relative = (path: string) => path.replace(/^\//, "");

/**
 * Builds the `{ lazy }` half of a route object: code-splits the page (and,
 * if given, a Layout that wraps it) via a single dynamic import, and
 * optionally wraps the result in an inner permission-only <ProtectedRoute>
 * (the role itself is already enforced by the group's layout route, so
 * this only ever checks `permissions`).
 */
const page = (
  Page: Importer,
  opts: { Layout?: Importer; permissions?: Permission[] } = {},
): Pick<RouteObject, "lazy"> => ({
  lazy: async () => {
    const [{ default: PageComponent }, LayoutComponent] = await Promise.all([
      Page(),
      opts.Layout ? opts.Layout().then((m) => m.default) : Promise.resolve(null),
    ]);

    const rendered = LayoutComponent ? (
      <LayoutComponent>
        <PageComponent />
      </LayoutComponent>
    ) : (
      <PageComponent />
    );

    const Component = opts.permissions?.length
      ? () => <ProtectedRoute permissions={opts.permissions}>{rendered}</ProtectedRoute>
      : () => rendered;

    return { Component };
  },
});

/** One layout route per guarded role group: the guard (`<ProtectedRoute
 * roles={[role]}>`) and the group's own errorElement are written once,
 * here — every page below inherits both instead of repeating them. */
const buildRoleGroup = (role: Role): RouteObject => ({
  element: (
    <ProtectedRoute roles={[role]}>
      <Outlet />
    </ProtectedRoute>
  ),
  errorElement: <RouteErrorBoundary />,
  children: roleRoutes(role).map(({ path, Page, access }) => ({
    path: relative(path),
    ...page(Page, { permissions: access.permissions }),
  })),
});

/** Admin: AdminSessionGate (cookie-session probe) → guard(admin) →
 * AdminLayout for the pages that use it → pages. `/admin` itself is an
 * index route that redirects to `/admin/users` instead of 404ing. */
const buildAdminRoute = (): RouteObject => ({
  path: "admin",
  ...page(AdminSessionGate),
  errorElement: <RouteErrorBoundary />,
  children: [
    { path: ADMIN_LOGIN_ROUTE.path.replace(/^\/admin\//, ""), ...page(ADMIN_LOGIN_ROUTE.Page) },
    {
      element: (
        <ProtectedRoute roles={[ADMIN_ROLE]}>
          <Outlet />
        </ProtectedRoute>
      ),
      children: [
        // Redirect-only index route: no UI of its own, so it needs no
        // Component — `/admin` on its own just lands on `/admin/users`.
        { index: true, element: null, loader: () => redirect("/admin/users") },
        ...ADMIN_ROUTES.map(({ path, Page, Layout }) => ({
          path: path.replace(/^\/admin\//, ""),
          ...page(Page, { Layout }),
        })),
      ],
    },
  ],
});

/**
 * Root layout: `<ScrollRestoration />` (Phase 6 — restores scroll position
 * on back/forward, which a plain <BrowserRouter> never did) plus a slim
 * top progress bar driven by `useNavigation()` while a lazy route's code
 * (or, later, a loader) is still resolving.
 */
const RootLayout = () => {
  const navigation = useNavigation();
  return (
    <>
      {navigation.state === "loading" && (
        <div
          aria-hidden
          className="animate-pulse"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 9999,
            background: "#2563eb",
          }}
        />
      )}
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

/**
 * The route tree handed to `createBrowserRouter`. URLs are identical to
 * the previous <Routes> setup — this only changes *how* the router is
 * built, not what renders where (Phase 1's "no behavior change" goal).
 */
export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    // Shown on first load while this route's matched lazy page (and its
    // loader) is still resolving — the v7
    // replacement for <RouterProvider fallbackElement>, which v7 removed.
    hydrateFallbackElement: <PageLoader />,
    children: [
      { index: true, element: <Home /> },

      // ── Public: register, logins, verify, SSO ─────────────
      ...PUBLIC_ROUTES.map(({ path, Page }) => ({ path: relative(path), ...page(Page) })),

      // ── Role-guarded groups: one guard + one error screen
      //    each, generated from the role registry ────────────
      ...ALL_ROLES.map(buildRoleGroup),

      // ── Shared dashboard ───────────────────────────────────
      {
        path: relative("/shared-dashboard/:connectRequestId"),
        errorElement: <RouteErrorBoundary />,
        // Phase 5: the connect fetch lives in a loader (auth redirect + 403
        // included) instead of a useEffect in the page. Loader module is
        // lazy-loaded together with the page so it stays out of the main chunk.
        lazy: async () => {
          const [{ default: Component }, loaderModule] = await Promise.all([
            SharedDashboardPage(),
            import("@features/shared-dashboard/models/sharedDashboard.loader"),
          ]);
          return {
            Component,
            loader: loaderModule.sharedDashboardLoader,
            shouldRevalidate: loaderModule.shouldRevalidateSharedDashboard,
          };
        },
      },

      // ── Admin (cookie session, gated by AdminSessionGate) ──
      buildAdminRoute(),

      // ── 404 ─────────────────────────────────────────────────
      { path: "*", element: <NotFound /> },
    ],
  },
];
