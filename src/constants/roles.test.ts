/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  ADMIN_ROLE,
  ALL_ROLES,
  PERMISSIONS,
  ROLES,
  ROLE_CONFIG,
  ROLE_PERMISSIONS,
  ROLE_PRIORITY,
  getPermissionsForRoles,
  getPrimaryRole,
  hasAnyPermission,
  hasPermission,
} from "./roles";

describe("role registry", () => {
  it("every account role has the full set of paths the router relies on", () => {
    for (const role of ALL_ROLES) {
      const cfg = ROLE_CONFIG[role];
      expect(cfg.loginPath, `${role}.loginPath`).toBeTruthy();
      expect(cfg.dashboardPath, `${role}.dashboardPath`).toBeTruthy();
      expect(cfg.onboardingPath, `${role}.onboardingPath`).toBeTruthy();
      expect(cfg.editProfilePath, `${role}.editProfilePath`).toBeTruthy();
      expect(cfg.sessionType).toBe("bearer");
    }
  });

  it("gives every account role a ROLE_PERMISSIONS entry and a ROLE_PRIORITY slot", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(ROLE_PRIORITY).toContain(role);
    }
  });

  it("keeps admin a separate cookie-session role with no dashboard", () => {
    expect(ROLE_CONFIG[ADMIN_ROLE].sessionType).toBe("cookie");
    expect(ROLE_CONFIG[ADMIN_ROLE].dashboardPath).toBeUndefined();
    expect((ALL_ROLES as string[]).includes(ADMIN_ROLE)).toBe(false);
  });

  it("picks the primary role by priority", () => {
    expect(getPrimaryRole(["mentee", "mentor"])).toBe(ROLES.MENTOR);
  });
});

describe("permission mirror of the backend", () => {
  // These literals are copied from Leapmentor-backend/constants/roles.js.
  // If this test fails after a backend change, update the frontend mirror.
  const BACKEND_PERMISSION_STRINGS = [
    "session:book", "mentor:search", "feedback:submit", "goal:manage",
    "availability:manage", "connect_request:respond", "earnings:view",
    "verification:upload", "message:send", "note:upload",
    "private_note:manage", "report:submit",
  ];

  it("defines exactly the backend's 12 permissions", () => {
    expect([...Object.values(PERMISSIONS)].sort()).toEqual(
      [...BACKEND_PERMISSION_STRINGS].sort(),
    );
  });

  it("grants mentees and mentors the same sets as the backend", () => {
    expect([...ROLE_PERMISSIONS.mentee].sort()).toEqual(
      [
        "session:book", "mentor:search", "feedback:submit", "goal:manage",
        "message:send", "note:upload", "private_note:manage", "report:submit",
      ].sort(),
    );
    expect([...ROLE_PERMISSIONS.mentor].sort()).toEqual(
      [
        "availability:manage", "connect_request:respond", "earnings:view",
        "verification:upload", "message:send", "note:upload",
        "private_note:manage", "report:submit",
      ].sort(),
    );
  });
});

describe("permission helpers", () => {
  it("unions permissions across every held role, de-duplicated", () => {
    const both = getPermissionsForRoles([ROLES.MENTOR, ROLES.MENTEE]);
    expect(new Set(both).size).toBe(both.length);
    expect(both).toContain(PERMISSIONS.VIEW_EARNINGS);
    expect(both).toContain(PERMISSIONS.BOOK_SESSION);
  });

  it("returns nothing for missing, non-array, or unknown roles", () => {
    expect(getPermissionsForRoles(undefined)).toEqual([]);
    expect(getPermissionsForRoles(null)).toEqual([]);
    expect(getPermissionsForRoles("mentor" as unknown as string[])).toEqual([]);
    expect(getPermissionsForRoles(["ghost", "admin"])).toEqual([]);
  });

  it("hasPermission / hasAnyPermission follow role grants", () => {
    expect(hasPermission(["mentee"], PERMISSIONS.BOOK_SESSION)).toBe(true);
    expect(hasPermission(["mentee"], PERMISSIONS.VIEW_EARNINGS)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.VIEW_EARNINGS)).toBe(false);
    expect(
      hasAnyPermission(["mentee"], [PERMISSIONS.VIEW_EARNINGS, PERMISSIONS.BOOK_SESSION]),
    ).toBe(true);
    expect(hasAnyPermission(["mentee"], [PERMISSIONS.VIEW_EARNINGS])).toBe(false);
    expect(hasAnyPermission(["mentor"], [])).toBe(false);
  });
});
