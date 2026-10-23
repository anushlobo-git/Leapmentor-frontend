/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  mapMenteeSettings,
  mapMentorSettings,
  mapWallet,
  mapUserPasswordInfo,
} from "./settingsMapper";

describe("settingsMapper", () => {
  describe("mapMenteeSettings", () => {
    it("should normalize a complete mentee settings object", () => {
      const raw = {
        emailNotifications: true,
        marketingPreferences: false,
      };

      const result = mapMenteeSettings(raw);

      expect(result).toEqual({
        emailNotifications: true,
        marketingPreferences: false,
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapMenteeSettings({});

      expect(result).toEqual({
        emailNotifications: false,
        marketingPreferences: false,
      });
    });

    it("should convert boolean-like values to booleans", () => {
      const raw = {
        emailNotifications: "true",
        marketingPreferences: 1,
      };

      const result = mapMenteeSettings(raw);

      expect(result.emailNotifications).toBe(true);
      expect(result.marketingPreferences).toBe(true);
    });

    it("should handle null/undefined as false", () => {
      const raw = {
        emailNotifications: null,
        marketingPreferences: undefined,
      };

      const result = mapMenteeSettings(raw);

      expect(result.emailNotifications).toBe(false);
      expect(result.marketingPreferences).toBe(false);
    });
  });

  describe("mapMentorSettings", () => {
    it("should normalize a complete mentor settings object", () => {
      const raw = {
        hourlyRate: 100,
        emailNotifications: true,
        isProfilePublished: true,
        totalSessions: 50,
        avgRating: 4.5,
      };

      const result = mapMentorSettings(raw);

      expect(result).toEqual({
        hourlyRate: 100,
        emailNotifications: true,
        isProfilePublished: true,
        totalSessions: 50,
        avgRating: 4.5,
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapMentorSettings({});

      expect(result).toEqual({
        hourlyRate: 0,
        emailNotifications: false,
        isProfilePublished: true,
        totalSessions: 0,
        avgRating: 0,
      });
    });

    it("should convert string hourlyRate to number", () => {
      const raw = {
        hourlyRate: "150",
      };

      const result = mapMentorSettings(raw);

      expect(result.hourlyRate).toBe(150);
    });

    it("should handle invalid hourlyRate as 0", () => {
      const raw = {
        hourlyRate: "invalid",
      };

      const result = mapMentorSettings(raw);

      expect(result.hourlyRate).toBe(0);
    });

    it("should use publicProfile as fallback for isProfilePublished", () => {
      const raw = {
        publicProfile: false,
      };

      const result = mapMentorSettings(raw);

      expect(result.isProfilePublished).toBe(false);
    });

    it("should prefer isProfilePublished over publicProfile", () => {
      const raw = {
        isProfilePublished: true,
        publicProfile: false,
      };

      const result = mapMentorSettings(raw);

      expect(result.isProfilePublished).toBe(true);
    });

    it("should convert string avgRating to number", () => {
      const raw = {
        avgRating: "4.5",
      };

      const result = mapMentorSettings(raw);

      expect(result.avgRating).toBe(4.5);
    });

    it("should handle invalid avgRating as 0", () => {
      const raw = {
        avgRating: "invalid",
      };

      const result = mapMentorSettings(raw);

      expect(result.avgRating).toBe(0);
    });

    it("should handle string totalSessions as 0", () => {
      const raw = {
        totalSessions: "50",
      };

      const result = mapMentorSettings(raw);

      expect(result.totalSessions).toBe(0);
    });
  });

  describe("mapWallet", () => {
    it("should normalize a complete wallet object", () => {
      const raw = {
        balance: 1000,
        escrow: 500,
      };

      const result = mapWallet(raw);

      expect(result).toEqual({
        balance: 1000,
        escrow: 500,
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapWallet({});

      expect(result).toEqual({
        balance: 0,
        escrow: 0,
      });
    });

    it("should handle string balance as 0", () => {
      const raw = {
        balance: "1000",
      };

      const result = mapWallet(raw);

      expect(result.balance).toBe(0);
    });

    it("should handle string escrow as 0", () => {
      const raw = {
        escrow: "500",
      };

      const result = mapWallet(raw);

      expect(result.escrow).toBe(0);
    });

    it("should handle null/undefined numeric fields as 0", () => {
      const raw = {
        balance: null,
        escrow: undefined,
      };

      const result = mapWallet(raw);

      expect(result.balance).toBe(0);
      expect(result.escrow).toBe(0);
    });
  });

  describe("mapUserPasswordInfo", () => {
    it("should normalize a complete user password info object", () => {
      const raw = {
        passwordChangedAt: "2024-01-15T10:30:00Z",
      };

      const result = mapUserPasswordInfo(raw);

      expect(result).toEqual({
        passwordChangedAt: "2024-01-15T10:30:00Z",
      });
    });

    it("should handle empty input with defaults", () => {
      const result = mapUserPasswordInfo({});

      expect(result).toEqual({
        passwordChangedAt: null,
      });
    });

    it("should handle null passwordChangedAt", () => {
      const raw = {
        passwordChangedAt: null,
      };

      const result = mapUserPasswordInfo(raw);

      expect(result.passwordChangedAt).toBeNull();
    });

    it("should handle undefined passwordChangedAt", () => {
      const raw = {
        passwordChangedAt: undefined,
      };

      const result = mapUserPasswordInfo(raw);

      expect(result.passwordChangedAt).toBeNull();
    });
  });
});
