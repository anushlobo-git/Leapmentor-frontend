/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCookie,
  clearCookie,
  getRole,
  hasSessionHint,
  isLoggedIn,
  clearAuthRole,
  setAuthRole,
} from "./cookies";

describe("cookies", () => {
  beforeEach(() => {
    // Mock document.cookie
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  afterEach(() => {
    document.cookie = "";
  });

  describe("getCookie", () => {
    it("should return cookie value when cookie exists", () => {
      document.cookie = "authRole=mentor";
      const result = getCookie("authRole");
      expect(result).toBe("mentor");
    });

    it("should return null when cookie does not exist", () => {
      document.cookie = "otherCookie=value";
      const result = getCookie("authRole");
      expect(result).toBe(null);
    });

    it("should return null when no cookies exist", () => {
      const result = getCookie("authRole");
      expect(result).toBe(null);
    });

    it("should handle URL-encoded values", () => {
      document.cookie = "authRole=mentor%20admin";
      const result = getCookie("authRole");
      expect(result).toBe("mentor admin");
    });

    it("should handle multiple cookies", () => {
      document.cookie = "other1=value1; authRole=mentee; other2=value2";
      const result = getCookie("authRole");
      expect(result).toBe("mentee");
    });

    it("should handle cookie with empty value", () => {
      document.cookie = "authRole=";
      const result = getCookie("authRole");
      expect(result).toBe("");
    });

    it("should handle cookie name as substring of another", () => {
      document.cookie = "authRole=mentor; authRoleAdmin=admin";
      const result = getCookie("authRole");
      expect(result).toBe("mentor");
    });
  });

  describe("clearCookie", () => {
    it("should set cookie with expired date", () => {
      clearCookie("authRole");
      expect(document.cookie).toContain("authRole=");
      expect(document.cookie).toContain("expires=Thu, 01 Jan 1970 00:00:00 GMT");
      expect(document.cookie).toContain("path=/");
    });

    it("should work with any cookie name", () => {
      clearCookie("testCookie");
      expect(document.cookie).toContain("testCookie=");
    });
  });

  describe("getRole", () => {
    it("should return mentor when authRole cookie is mentor", () => {
      document.cookie = "authRole=mentor";
      const result = getRole();
      expect(result).toBe("mentor");
    });

    it("should return mentee when authRole cookie is mentee", () => {
      document.cookie = "authRole=mentee";
      const result = getRole();
      expect(result).toBe("mentee");
    });

    it("should return admin when authRole cookie is admin", () => {
      document.cookie = "authRole=admin";
      const result = getRole();
      expect(result).toBe("admin");
    });

    it("should return null when authRole cookie does not exist", () => {
      const result = getRole();
      expect(result).toBe(null);
    });
  });

  describe("hasSessionHint", () => {
    it("should return true when authRole cookie exists", () => {
      document.cookie = "authRole=mentor";
      const result = hasSessionHint();
      expect(result).toBe(true);
    });

    it("should return false when authRole cookie does not exist", () => {
      const result = hasSessionHint();
      expect(result).toBe(false);
    });

  });

  describe("isLoggedIn", () => {
    it("should be an alias for hasSessionHint", () => {
      expect(isLoggedIn).toBe(hasSessionHint);
    });

    it("should return true when authRole cookie exists", () => {
      document.cookie = "authRole=mentor";
      const result = isLoggedIn();
      expect(result).toBe(true);
    });

    it("should return false when authRole cookie does not exist", () => {
      const result = isLoggedIn();
      expect(result).toBe(false);
    });
  });

  describe("clearAuthRole", () => {
    it("should clear authRole cookie", () => {
      document.cookie = "authRole=mentor";
      clearAuthRole();
      expect(document.cookie).toContain("authRole=");
      expect(document.cookie).toContain("expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });
  });

  describe("setAuthRole", () => {
    it("should set authRole cookie with role", () => {
      setAuthRole("mentor");
      expect(document.cookie).toContain("authRole=mentor");
      expect(document.cookie).toContain("path=/");
      expect(document.cookie).toContain("SameSite=Lax");
    });

    it("should set authRole cookie with mentee", () => {
      setAuthRole("mentee");
      expect(document.cookie).toContain("authRole=mentee");
    });

    it("should set authRole cookie with admin", () => {
      setAuthRole("admin");
      expect(document.cookie).toContain("authRole=admin");
    });

    it("should handle role with spaces", () => {
      setAuthRole("mentor admin");
      expect(document.cookie).toContain("authRole=mentor admin");
    });
  });
});
