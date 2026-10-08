/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/* eslint-disable react-refresh/only-export-components */
// This file is our "map of the whole app." It does two things:
//   1. Lists every page and WHO is allowed to see it.
//   2. Turns that list into the actual route tree React Router uses.
// Because it exports both data (route lists) AND a couple of small
// components, we switch off one eslint rule that expects a file to
// export only components. That mix is normal for a route-config file.


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
 *      compile until you do; the onboarding, dashboard and edit-profile
 *      routes (and their guards) are then generated for you, including
 *      their own layout route in `appRoutes`. All roles share the one
 *      `/login` toggle page, so there is no per-role login to add.
 *   3. App.tsx does not change.
 *
 * Route access lives on each route as `access: { roles?, permissions? }`
 * and is enforced by <ProtectedRoute>. Remember the frontend only decides
 * what to *show* — the backend (authenticate + requireRole /
 * requirePermission) is the real enforcement.
 */
import type { ComponentType, ReactNode } from "react";
import {
  Outlet, // the "hole" where a child page is slotted into a parent
  ScrollRestoration,// remembers scroll position on back/forward
  redirect,
  useNavigation,   // tells us when a page is mid-loading (for the progress bar)
  type RouteObject,
} from "react-router-dom";
import {
  ADMIN_ROLE,
  ALL_ROLES,
  PERMISSIONS,
  ROLES,
  ROLE_CONFIG,     // the single source for each role's URLs (login, dashboard, etc.)
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

// An "Importer" is a function that, when called, downloads a page's code.
// Nothing is downloaded until this function is actually called — that's the
// trick that lets us load each page only when someone visits it.
//const loadLogin: Importer = () => import("./Login");
//So anything assigned to Importer must be a function that takes no arguments.
type Importer = () => Promise<{ default: ComponentType<{ children?: ReactNode }> }>;

export interface RouteAccess {
  /** The user must hold at least one of these roles. */
  //roles=[type "mentor"|"mentee"|"admin"...]
  roles?: RouteRole[];
  /** The user's roles must grant at least one of these permissions. */
  //permission=[type entire permission | ]
  permissions?: Permission[];
}

export interface RouteDef {
  path: string;
  Page: Importer;
  /** Optional wrapper rendered around the page (inside the guard). */
  Layout?: Importer;
}
//these are the interface that are required to create the appRoutes

export interface GuardedRouteDef extends RouteDef {
  access: RouteAccess;
}

// ── Public pages ──────────────────────────────────────────────
const Register: Importer = () => import("@features/auth/views/Register");
const VerifyEmail: Importer = () => import("@features/auth/views/VerifyEmail");
const ForgotPassword: Importer = () => import("@features/auth/views/ForgotPassword");
const SSOCallback: Importer = () => import("@features/auth/views/SSOCallback");

// ── Per-role pages ────────────────────────────────────────────
const Login: Importer = () => import("@features/auth/views/Login");
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

//Importer are the function that takes nothing as an argument but returns the react component inside the promise
//for the variable as import page then its Importer

// The set of pages every role needs. The URLs come from ROLE_CONFIG;
// this only says WHICH component shows at each URL.
interface RolePages {
  Onboarding: Importer;
  Dashboard: Importer;
  EditProfile: Importer;
  /** Extra guarded pages only this role uses. */
  extra?: Array<{ path: string; Page: Importer; permissions?: Permission[] }>;
}

// The one place that ties each role to its actual components.
// `Record<Role, RolePages>` = "every role MUST have an entry here,"
// which is why adding a new role forces you to fill this in (TS won't build otherwise).
//it has the pages based on the roles
const ROLE_PAGES: Record<Role, RolePages> = {
  [ROLES.MENTOR]: {
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
    Onboarding: MenteeOnboarding,
    Dashboard: MenteeDashboard,
    EditProfile: MenteeEditProfileShell,
  },
};

// ── Public routes (no guard) ──────────────────────────────────
export const PUBLIC_ROUTES: RouteDef[] = [
  { path: "/register", Page: Register },
  // The single login page: a mentee/mentor toggle (Login.tsx) so a dual-role
  // account can choose which dashboard to enter. There are no role-specific
  // login URLs — mentor/mentee both resolve here via ROLE_CONFIG.loginPath.
  { path: "/login", Page: Login },
  { path: "/verify-email", Page: VerifyEmail },
  { path: "/forgot-password", Page: ForgotPassword },
  { path: "/sso-callback", Page: SSOCallback },
];

// ── Build a role's guarded routes automatically ───────────────
// Given a role, this returns its onboarding + edit-profile + dashboard
// routes (plus any extra pages), each stamped with "you need this role."
const roleRoutes = (role: Role): GuardedRouteDef[] => {
  //it gives the 3 variable that as the dedicated path url like onboarding/mentor
  const { onboardingPath, dashboardPath, editProfilePath } = ROLE_CONFIG[role];

  const pages = ROLE_PAGES[role];
  const access: RouteAccess = { roles: [role] };

  //based on role this gives u all the routes for the role as an {path,page,access:{roles,permissions}}
  const candidates: Array<GuardedRouteDef | null> = [
    onboardingPath ? { path: onboardingPath, Page: pages.Onboarding, access } : null,
    editProfilePath ? { path: editProfilePath, Page: pages.EditProfile, access } : null,
    dashboardPath ? { path: dashboardPath, Page: pages.Dashboard, access } : null,
    // Extra pages get BOTH the role (decides which login to send anon users to)
    // AND their own permission (what actually unlocks the page).
    ...(pages.extra ?? []).map(({ path, Page, permissions }) => ({
      path,
      Page,

      access: { roles: [role], permissions },
    })),
  ];
  // Drop the nulls, keeping only real routes.
  return candidates.filter((route): route is GuardedRouteDef => route !== null);
};
// Do the above for EVERY role and flatten into one big list
export const ROLE_GUARDED_ROUTES: GuardedRouteDef[] = ALL_ROLES.flatMap(roleRoutes);

// ── Admin (separate cookie-session domain) ────────────────────
export const ADMIN_LOGIN_ROUTE: RouteDef = {
  path: ROLE_CONFIG[ADMIN_ROLE].loginPath,
  Page: AdminLogin,
};
//needs the role to be "admin"
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


//it removes / from all the child path
//because all the path and the elements are nested under the "/" so when ever u give the
//path inside as /login so remove and / and attach the parent element attaches the / making it
//  /login
const relative = (path: string) => path.replace(/^\//, "");

// Helper that gives a route its `lazy` loader. When the route is visited:
//   1. download the page's code (and its Layout, if any) at the same time,
//   2. put the page inside the Layout (if there is one),
//   3. if this page needs a PERMISSION, wrap it in a small guard for that.
// (The role check is already done by the group's guard, so here we only
//  ever check permissions.)
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

// Build ONE guarded "group" for a role. The guard and the error screen are
// written once here; every page in `children` sits behind them via <Outlet />.
// This is why we don't repeat <ProtectedRoute> on every single page.
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
//outlet is where u put the child in and navigation is if the page is loading
//this is the wrapper function which is wrapping the home page
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
    // The spinner shown on the very first load, while the matched page's
    // code is still downloading.
    hydrateFallbackElement: <PageLoader />,
    children: [
      // Home page at "/".
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

/*
appRoutes = [
  {
    path: "/",                          // ROOT
    element: <RootLayout />,            // wrapper (loading bar + scroll + <Outlet/>)
    errorElement: <RouteErrorBoundary/>,
    children: [

      { index: true, element: <Home/> },        // "/"

       ── from PUBLIC_ROUTES.map(...) ──
      { path: "register",      ...page(Register) },
      { path: "login",         ...page(Login) },
      { path: "verify-email",  ...page(VerifyEmail) },
      { path: "forgot-password", ...page(ForgotPassword) },
      { path: "sso-callback",  ...page(SSOCallback) },

       ── from ALL_ROLES.map(buildRoleGroup) ──
      {                                          // MENTOR group
        element: <ProtectedRoute roles={["mentor"]}><Outlet/></ProtectedRoute>,
        errorElement: <RouteErrorBoundary/>,
        children: [
          { path: "onboarding/mentor",   ...page(MentorOnboarding) },
          { path: "profile/mentor/edit", ...page(MentorEditProfileShell) },
          { path: "dashboard/mentor",    ...page(MentorDashboard) },
          { path: "verify-documents",    ...page(MentorVerification, {permissions:[...]}) },
        ],
      },
      {                                          // MENTEE group
        element: <ProtectedRoute roles={["mentee"]}><Outlet/></ProtectedRoute>,
        errorElement: <RouteErrorBoundary/>,
        children: [
          { path: "onboarding/mentee",   ...page(MenteeOnboarding) },
          { path: "profile/mentee/edit", ...page(MenteeEditProfileShell) },
          { path: "dashboard/mentee",    ...page(MenteeDashboard) },
        ],
      },

       ── shared dashboard ──
      { path: "shared-dashboard/:connectRequestId", ...lazy(page + loader) },

       ── from buildAdminRoute() ──
      {                                          // ADMIN section
        path: "admin",
        ...page(AdminSessionGate),               // cookie-session probe first
        errorElement: <RouteErrorBoundary/>,
        children: [
          { path: "login", ...page(AdminLogin) },
          {
            element: <ProtectedRoute roles={["admin"]}><Outlet/></ProtectedRoute>,
            children: [
              { index: true, loader: () => redirect("/admin/users") },
              { path: "users",         ...page(AdminUserManagement) },
              { path: "engagements",   ...page(AdminEngagements) },
              { path: "reports",       ...page(AdminReports) },
              { path: "payments",      ...page(AdminPayments) },
              { path: "settings",      ...page(AdminSettings) },
              { path: "wallet-requests", ...page(AdminWalletRequests) },
              { path: "support",       ...page(AdminSupportMessages, {Layout: AdminLayout}) },
              { path: "verifications", ...page(AdminVerifications, {Layout: AdminLayout}) },
            ],
          },
        ],
      },

      { path: "*", element: <NotFound/> },       // anything else → 404
    ],
  },
];

the component tree

/  (RootLayout: loading bar + scroll + Outlet)   [errorElement]
│
├── (index)  →  Home                        URL: /
│
├── register              →  Register       URL: /register        (public)
├── login                 →  Login          URL: /login           (public)
├── verify-email          →  VerifyEmail    URL: /verify-email     (public)
├── forgot-password       →  ForgotPassword URL: /forgot-password  (public)
├── sso-callback          →  SSOCallback    URL: /sso-callback     (public)
│
├── 🛡 ProtectedRoute roles=["mentor"]   [errorElement]   ← ONE guard for the group
│     ├── onboarding/mentor    →  MentorOnboarding       URL: /onboarding/mentor
│     ├── profile/mentor/edit  →  MentorEditProfileShell URL: /profile/mentor/edit
│     ├── dashboard/mentor     →  MentorDashboard        URL: /dashboard/mentor
│     └── verify-documents 🔑  →  MentorVerification     URL: /verify-documents
│
├── 🛡 ProtectedRoute roles=["mentee"]   [errorElement]
│     ├── onboarding/mentee    →  MenteeOnboarding       URL: /onboarding/mentee
│     ├── profile/mentee/edit  →  MenteeEditProfileShell URL: /profile/mentee/edit
│     └── dashboard/mentee     →  MenteeDashboard        URL: /dashboard/mentee
│
├── shared-dashboard/:connectRequestId → SharedDashboardPage (+loader)
│                                          URL: /shared-dashboard/abc123
│
├── admin  (AdminSessionGate runs first)   [errorElement]
│     ├── login               →  AdminLogin              URL: /admin/login
│     └── 🛡 ProtectedRoute roles=["admin"]
│           ├── (index)  →  redirect to /admin/users     URL: /admin
│           ├── users          →  AdminUserManagement    URL: /admin/users
│           ├── engagements    →  AdminEngagements       URL: /admin/engagements
│           ├── reports        →  AdminReports           URL: /admin/reports
│           ├── payments       →  AdminPayments          URL: /admin/payments
│           ├── settings       →  AdminSettings          URL: /admin/settings
│           ├── wallet-requests → AdminWalletRequests    URL: /admin/wallet-requests
│           ├── support   📦   →  AdminSupportMessages   URL: /admin/support
│           └── verifications 📦 → AdminVerifications    URL: /admin/verifications
│
└── *  →  NotFound                          URL: anything unmatched

🛡 = a guard sits here    🔑 = also needs a permission    📦 = wrapped in AdminLayout
*/
