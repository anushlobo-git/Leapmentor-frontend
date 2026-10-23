/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  getInitials,
  getAvatarColor,
  formatDate,
  TABS,
  getEmptyStateLabel,
} from "./walletRequests.utils";

describe("walletRequests.utils", () => {
  describe("getInitials", () => {
    it("should return empty string for empty name", () => {
      expect(getInitials("")).toBe("");
    });

    it("should return empty string for undefined name", () => {
      expect(getInitials()).toBe("");
    });

    it("should return first letter for single word name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should return first two letters for two word name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should return first two letters for multi-word name", () => {
      expect(getInitials("John Middle Doe")).toBe("JM");
    });

    it("should convert to uppercase", () => {
      expect(getInitials("john doe")).toBe("JD");
    });

    it("should handle extra spaces", () => {
      expect(getInitials("John  Doe")).toBe("JD");
    });

    it("should limit to 2 characters", () => {
      expect(getInitials("John Middle Last Doe")).toBe("JM");
    });
  });

  describe("getAvatarColor", () => {
    it("should return color for empty string", () => {
      const result = getAvatarColor("");
      expect(result).toHaveProperty("bg");
      expect(result).toHaveProperty("text");
    });

    it("should return color for undefined", () => {
      const result = getAvatarColor();
      expect(result).toHaveProperty("bg");
      expect(result).toHaveProperty("text");
    });

    it("should return consistent color for same name", () => {
      const result1 = getAvatarColor("John");
      const result2 = getAvatarColor("John");
      expect(result1).toEqual(result2);
    });

    it("should return different colors for different names", () => {
      const result1 = getAvatarColor("John");
      const result2 = getAvatarColor("Alice");
      expect(result1).not.toEqual(result2);
    });

    it("should return color with bg and text properties", () => {
      const result = getAvatarColor("Test");
      expect(typeof result.bg).toBe("string");
      expect(typeof result.text).toBe("string");
    });
  });

  describe("formatDate", () => {
    it("should return dash for null", () => {
      expect(formatDate(null)).toBe("—");
    });

    it("should return dash for undefined", () => {
      expect(formatDate(undefined)).toBe("—");
    });

    it("should return dash for empty string", () => {
      expect(formatDate("")).toBe("—");
    });

    it("should format date string correctly", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("2024");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
    });

    it("should format ISO date string", () => {
      const result = formatDate("2024-12-25T10:30:00Z");
      expect(result).toContain("2024");
      expect(result).toContain("Dec");
      expect(result).toContain("25");
    });
  });

  describe("TABS", () => {
    it("should be an array of tab objects", () => {
      expect(Array.isArray(TABS)).toBe(true);
      expect(TABS.length).toBeGreaterThan(0);
    });

    it("should have tab objects with key and label properties", () => {
      TABS.forEach((tab) => {
        expect(tab).toHaveProperty("key");
        expect(tab).toHaveProperty("label");
        expect(typeof tab.key).toBe("string");
        expect(typeof tab.label).toBe("string");
      });
    });

    it("should have expected tabs", () => {
      const keys = TABS.map((t) => t.key);
      expect(keys).toContain("pending");
      expect(keys).toContain("approved");
      expect(keys).toContain("rejected");
      expect(keys).toContain("all");
    });

    it("should have expected labels", () => {
      const labels = TABS.map((t) => t.label);
      expect(labels).toContain("Pending");
      expect(labels).toContain("Approved");
      expect(labels).toContain("Rejected");
      expect(labels).toContain("All");
    });
  });

  describe("getEmptyStateLabel", () => {
    it("should return search result message when search is provided", () => {
      const result = getEmptyStateLabel("john", "pending");
      expect(result).toBe('No results for "john"');
    });

    it("should return pending celebration message when tab is pending and no search", () => {
      const result = getEmptyStateLabel("", "pending");
      expect(result).toBe("No pending requests 🎉");
    });

    it("should return generic message for other tabs", () => {
      const result = getEmptyStateLabel("", "approved");
      expect(result).toBe("No approved requests yet");
    });

    it("should return generic message for rejected tab", () => {
      const result = getEmptyStateLabel("", "rejected");
      expect(result).toBe("No rejected requests yet");
    });

    it("should return generic message for all tab", () => {
      const result = getEmptyStateLabel("", "all");
      expect(result).toBe("No all requests yet");
    });

    it("should prioritize search over tab", () => {
      const result = getEmptyStateLabel("test", "pending");
      expect(result).toContain("No results for");
      expect(result).not.toContain("🎉");
    });
  });
});
