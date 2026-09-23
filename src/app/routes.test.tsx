/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  ADMIN_ROLE,
  ALL_ROLES,
  PERMISSIONS,
  ROLE_CONFIG,
} from "@constants/roles";
import {
  ADMIN_LOGIN_ROUTE,
  ADMIN_ROUTES,
  PUBLIC_ROUTES,
  ROLE_GUARDED_ROUTES,
} from "./routes";

const allPaths = () => [
  ...PUBLIC_ROUTES.map((r) => r.path),
  ...ROLE_GUARDED_ROUTES.map((r) => r.path),
  ADMIN_LOGIN_ROUTE.path,
  ...ADMIN_ROUTES.map((r) => r.path),
];

describe("route registry", () => {
  it("has no duplicate paths", () => {
    const paths = allPaths();
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("generates login, onboarding, edit-profile and dashboard routes for every account role from ROLE_CONFIG", () => {
    const paths = allPaths();
    for (const role of ALL_ROLES) {
      const cfg = ROLE_CONFIG[role];
      expect(paths).toContain(cfg.loginPath);
      expect(paths).toContain(cfg.onboardingPath);
      expect(paths).toContain(cfg.editProfilePath);
      expect(paths).toContain(cfg.dashboardPath);
    }
  });

  it("guards each generated role route with exactly that role", () => {
    for (const role of ALL_ROLES) {
      const cfg = ROLE_CONFIG[role];
      for (const path of [cfg.onboardingPath, cfg.editProfilePath, cfg.dashboardPath]) {
        const route = ROLE_GUARDED_ROUTES.find((r) => r.path === path);
        expect(route?.access.roles).toEqual([role]);
      }
    }
  });

  it("gates /verify-documents by the verification-upload permission as well as the mentor role", () => {
    const route = ROLE_GUARDED_ROUTES.find((r) => r.path === "/verify-documents");
    expect(route?.access.roles).toEqual(["mentor"]);
    expect(route?.access.permissions).toEqual([PERMISSIONS.UPLOAD_VERIFICATION_DOCS]);
  });

  it("serves the bare /login with a login page and never guards login routes", () => {
    expect(PUBLIC_ROUTES.map((r) => r.path)).toContain("/login");
    for (const route of PUBLIC_ROUTES) {
      expect((route as any).access).toBeUndefined();
    }
  });

  it("guards every admin page with the admin role and takes the login URL from ROLE_CONFIG", () => {
    expect(ADMIN_LOGIN_ROUTE.path).toBe(ROLE_CONFIG[ADMIN_ROLE].loginPath);
    expect(ADMIN_ROUTES.length).toBeGreaterThan(0);
    for (const route of ADMIN_ROUTES) {
      expect(route.access.roles).toEqual([ADMIN_ROLE]);
    }
  });
});
