/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { MENTOR_BADGES } from "./mentorBadges";

describe("mentorBadges", () => {
  describe("MENTOR_BADGES", () => {
    it("should be an array of badge definitions", () => {
      expect(Array.isArray(MENTOR_BADGES)).toBe(true);
      expect(MENTOR_BADGES.length).toBeGreaterThan(0);
    });

    it("should have badge objects with required properties", () => {
      MENTOR_BADGES.forEach((badge) => {
        expect(badge).toHaveProperty("key");
        expect(badge).toHaveProperty("label");
        expect(badge).toHaveProperty("icon");
        expect(badge).toHaveProperty("desc");
        expect(badge).toHaveProperty("condition");
        expect(typeof badge.key).toBe("string");
        expect(typeof badge.label).toBe("string");
        expect(typeof badge.icon).toBe("string");
        expect(typeof badge.desc).toBe("string");
        expect(typeof badge.condition).toBe("function");
      });
    });

    it("should have expected badge keys", () => {
      const keys = MENTOR_BADGES.map((b) => b.key);
      expect(keys).toContain("newcomer");
      expect(keys).toContain("ten_sessions");
      expect(keys).toContain("top_rated");
      expect(keys).toContain("expert_guide");
    });

    it("should have newcomer badge that always returns true", () => {
      const newcomerBadge = MENTOR_BADGES.find((b) => b.key === "newcomer");
      expect(newcomerBadge).toBeDefined();
      expect(newcomerBadge.condition()).toBe(true);
      expect(newcomerBadge.condition({})).toBe(true);
      expect(newcomerBadge.condition({ totalSessions: 0 })).toBe(true);
    });

    it("should have ten_sessions badge that checks totalSessions >= 10", () => {
      const tenSessionsBadge = MENTOR_BADGES.find((b) => b.key === "ten_sessions");
      expect(tenSessionsBadge).toBeDefined();
      expect(tenSessionsBadge.condition({ totalSessions: 10 })).toBe(true);
      expect(tenSessionsBadge.condition({ totalSessions: 15 })).toBe(true);
      expect(tenSessionsBadge.condition({ totalSessions: 9 })).toBe(false);
      expect(tenSessionsBadge.condition({})).toBe(false);
      expect(tenSessionsBadge.condition(null)).toBe(false);
    });

    it("should have top_rated badge that checks avgRating >= 4.5", () => {
      const topRatedBadge = MENTOR_BADGES.find((b) => b.key === "top_rated");
      expect(topRatedBadge).toBeDefined();
      expect(topRatedBadge.condition({ avgRating: 4.5 })).toBe(true);
      expect(topRatedBadge.condition({ avgRating: 5.0 })).toBe(true);
      expect(topRatedBadge.condition({ avgRating: 4.4 })).toBe(false);
      expect(topRatedBadge.condition({})).toBe(false);
      expect(topRatedBadge.condition(null)).toBe(false);
    });

    it("should have expert_guide badge that checks totalSessions >= 50", () => {
      const expertGuideBadge = MENTOR_BADGES.find((b) => b.key === "expert_guide");
      expect(expertGuideBadge).toBeDefined();
      expect(expertGuideBadge.condition({ totalSessions: 50 })).toBe(true);
      expect(expertGuideBadge.condition({ totalSessions: 100 })).toBe(true);
      expect(expertGuideBadge.condition({ totalSessions: 49 })).toBe(false);
      expect(expertGuideBadge.condition({})).toBe(false);
      expect(expertGuideBadge.condition(null)).toBe(false);
    });

    it("should have correct badge labels", () => {
      const labels = MENTOR_BADGES.map((b) => b.label);
      expect(labels).toContain("Newcomer");
      expect(labels).toContain("10 Sessions");
      expect(labels).toContain("Top Rated");
      expect(labels).toContain("Expert Guide");
    });

    it("should have emoji icons", () => {
      MENTOR_BADGES.forEach((badge) => {
        expect(badge.icon.length).toBeGreaterThan(0);
      });
    });
  });
});
