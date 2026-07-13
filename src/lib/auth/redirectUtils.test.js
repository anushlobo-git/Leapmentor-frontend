/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPrimaryRole,
  getDashboardPath,
  getOnboardingPath,
  REDIRECT_DELAYS,
  getBaseUrl,
  buildOAuthUrl,
} from "./redirectUtils";

describe("redirectUtils", () => {
  describe("getPrimaryRole", () => {
    it("should return mentor when mentor is in roles", () => {
      expect(getPrimaryRole(["mentor", "mentee"])).toBe("mentor");
    });

    it("should return mentee when only mentee is in roles", () => {
      expect(getPrimaryRole(["mentee"])).toBe("mentee");
    });

    it("should return mentor when only mentor is in roles", () => {
      expect(getPrimaryRole(["mentor"])).toBe("mentor");
    });

    it("should return null when roles array is empty", () => {
      expect(getPrimaryRole([])).toBe(null);
    });

    it("should return null when roles is null", () => {
      expect(getPrimaryRole(null)).toBe(null);
    });

    it("should return null when roles is undefined", () => {
      expect(getPrimaryRole(undefined)).toBe(null);
    });

    it("should return null when roles array has neither mentor nor mentee", () => {
      expect(getPrimaryRole(["admin"])).toBe(null);
    });
  });

  describe("getDashboardPath", () => {
    it("should return correct path for mentor", () => {
      expect(getDashboardPath("mentor")).toBe("/dashboard/mentor");
    });

    it("should return correct path for mentee", () => {
      expect(getDashboardPath("mentee")).toBe("/dashboard/mentee");
    });

    it("should return root path when role is null", () => {
      expect(getDashboardPath(null)).toBe("/");
    });

    it("should return root path when role is empty string", () => {
      expect(getDashboardPath("")).toBe("/");
    });

    it("should return root path when role is undefined", () => {
      expect(getDashboardPath(undefined)).toBe("/");
    });
  });

  describe("getOnboardingPath", () => {
    it("should return correct path for mentor", () => {
      expect(getOnboardingPath("mentor")).toBe("/onboarding/mentor");
    });

    it("should return correct path for mentee", () => {
      expect(getOnboardingPath("mentee")).toBe("/onboarding/mentee");
    });

    it("should return root path when role is null", () => {
      expect(getOnboardingPath(null)).toBe("/");
    });

    it("should return root path when role is empty string", () => {
      expect(getOnboardingPath("")).toBe("/");
    });

    it("should return root path when role is undefined", () => {
      expect(getOnboardingPath(undefined)).toBe("/");
    });
  });

  describe("REDIRECT_DELAYS", () => {
    it("should have all delay constants", () => {
      expect(REDIRECT_DELAYS.IMMEDIATE).toBe(0);
      expect(REDIRECT_DELAYS.SHORT).toBe(500);
      expect(REDIRECT_DELAYS.MEDIUM).toBe(700);
      expect(REDIRECT_DELAYS.LONG).toBe(1000);
      expect(REDIRECT_DELAYS.EXTRA_LONG).toBe(1500);
    });
  });

  describe("getBaseUrl", () => {
    it("should return environment variable when set", () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
      expect(getBaseUrl()).toBe("https://api.example.com/api/v1");
    });

    it("should return fallback URL when environment variable is not set", () => {
      vi.stubEnv("VITE_API_BASE_URL", undefined);
      expect(getBaseUrl()).toBe("http://localhost:5000/api/v1");
    });

  });

  describe("buildOAuthUrl", () => {
    it("should build correct OAuth URL for google", () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
      const result = buildOAuthUrl("google");
      expect(result).toBe("https://api.example.com/api/v1/auth/google?");
    });

    it("should build OAuth URL with params", () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
      const result = buildOAuthUrl("google", { redirect: "/dashboard" });
      expect(result).toBe("https://api.example.com/api/v1/auth/google?redirect=%2Fdashboard");
    });

    it("should build OAuth URL with multiple params", () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
      const result = buildOAuthUrl("linkedin", { redirect: "/dashboard", state: "abc123" });
      expect(result).toContain("redirect=%2Fdashboard");
      expect(result).toContain("state=abc123");
    });


    it("should handle empty params object", () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/v1");
      const result = buildOAuthUrl("google", {});
      expect(result).toBe("https://api.example.com/api/v1/auth/google?");
    });
  });
});
