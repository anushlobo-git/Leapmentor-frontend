/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  TABS,
  STATUS_STYLES,
  STATUS_LABELS,
  formatDate,
  formatTime,
  getInitials,
} from "./constants";

describe("history constants", () => {
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
      expect(keys).toContain("all");
      expect(keys).toContain("pending");
      expect(keys).toContain("accepted");
      expect(keys).toContain("ongoing");
      expect(keys).toContain("completed");
      expect(keys).toContain("rejected");
      expect(keys).toContain("referred");
    });

    it("should have expected labels", () => {
      const labels = TABS.map((t) => t.label);
      expect(labels).toContain("All");
      expect(labels).toContain("Pending");
      expect(labels).toContain("Accepted");
      expect(labels).toContain("Ongoing");
      expect(labels).toContain("Completed");
      expect(labels).toContain("Rejected");
      expect(labels).toContain("Referred");
    });
  });

  describe("STATUS_STYLES", () => {
    it("should be an object with status style mappings", () => {
      expect(typeof STATUS_STYLES).toBe("object");
      expect(Object.keys(STATUS_STYLES).length).toBeGreaterThan(0);
    });

    it("should have styles for all expected statuses", () => {
      expect(STATUS_STYLES).toHaveProperty("pending");
      expect(STATUS_STYLES).toHaveProperty("accepted");
      expect(STATUS_STYLES).toHaveProperty("rejected");
      expect(STATUS_STYLES).toHaveProperty("referred");
      expect(STATUS_STYLES).toHaveProperty("ongoing");
      expect(STATUS_STYLES).toHaveProperty("completed");
    });

    it("should have string values for all statuses", () => {
      Object.values(STATUS_STYLES).forEach((style) => {
        expect(typeof style).toBe("string");
      });
    });
  });

  describe("STATUS_LABELS", () => {
    it("should be an object with status label mappings", () => {
      expect(typeof STATUS_LABELS).toBe("object");
      expect(Object.keys(STATUS_LABELS).length).toBeGreaterThan(0);
    });

    it("should have labels for all expected statuses", () => {
      expect(STATUS_LABELS).toHaveProperty("pending");
      expect(STATUS_LABELS).toHaveProperty("accepted");
      expect(STATUS_LABELS).toHaveProperty("rejected");
      expect(STATUS_LABELS).toHaveProperty("referred");
      expect(STATUS_LABELS).toHaveProperty("ongoing");
      expect(STATUS_LABELS).toHaveProperty("completed");
    });

    it("should have string values for all statuses", () => {
      Object.values(STATUS_LABELS).forEach((label) => {
        expect(typeof label).toBe("string");
      });
    });

    it("should have emoji in labels", () => {
      expect(STATUS_LABELS.pending).toContain("⏳");
      expect(STATUS_LABELS.accepted).toContain("✅");
      expect(STATUS_LABELS.rejected).toContain("❌");
      expect(STATUS_LABELS.referred).toContain("↪️");
      expect(STATUS_LABELS.ongoing).toContain("🔵");
      expect(STATUS_LABELS.completed).toContain("🎓");
    });
  });

  describe("formatDate", () => {
    it("should return dash when dateStr is null", () => {
      expect(formatDate(null)).toBe("—");
    });

    it("should return dash when dateStr is undefined", () => {
      expect(formatDate(undefined)).toBe("—");
    });

    it("should return dash when dateStr is empty string", () => {
      expect(formatDate("")).toBe("—");
    });

    it("should format date string correctly", () => {
      const result = formatDate("2024-01-15");
      expect(result).toBe("Jan 15, 2024");
    });

    it("should format date string with time component", () => {
      const result = formatDate("2024-12-25T10:30:00Z");
      expect(result).toContain("Dec");
      expect(result).toContain("25");
      expect(result).toContain("2024");
    });
  });

  describe("formatTime", () => {
    it("should return empty string when time is null", () => {
      expect(formatTime(null)).toBe("");
    });

    it("should return empty string when time is undefined", () => {
      expect(formatTime(undefined)).toBe("");
    });

    it("should return empty string when time is empty string", () => {
      expect(formatTime("")).toBe("");
    });

    it("should format time in 12-hour format with AM", () => {
      expect(formatTime("09:30")).toBe("09:30 AM");
      expect(formatTime("08:00")).toBe("08:00 AM");
    });

    it("should format time in 12-hour format with PM", () => {
      expect(formatTime("14:30")).toBe("02:30 PM");
      expect(formatTime("18:00")).toBe("06:00 PM");
    });

    it("should handle 12:00 as PM", () => {
      expect(formatTime("12:00")).toBe("12:00 PM");
    });

    it("should handle 00:00 as AM", () => {
      expect(formatTime("00:00")).toBe("12:00 AM");
    });

    it("should pad hours and minutes with zeros", () => {
      expect(formatTime("9:5")).toBe("09:05 AM");
    });
  });

  describe("getInitials", () => {
    it("should return question mark when name is null", () => {
      expect(getInitials(null)).toBe("?");
    });

    it("should return question mark when name is undefined", () => {
      expect(getInitials(undefined)).toBe("?");
    });

    it("should return question mark when name is empty string", () => {
      expect(getInitials("")).toBe("?");
    });

    it("should return first two letters of name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("should return single letter if name has one word", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should return first two letters if name has multiple words", () => {
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
});
