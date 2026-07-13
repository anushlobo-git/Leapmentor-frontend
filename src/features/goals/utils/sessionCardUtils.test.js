/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import {
  formatSlotDate,
  isActive,
  isValidMeetingLink,
  getSlotPillClasses,
  getDayTabClasses,
  getSessionStatus,
  getCardBorderClass,
  isMoreThan12HrsAway,
} from "./sessionCardUtils";

// Mock the formatTime import
vi.mock("@lib/formatters/dateTime", () => ({
  formatTimeString: vi.fn((time) => time),
}));

describe("sessionCardUtils", () => {
  describe("formatSlotDate", () => {
    it("should return empty string when slot is null", () => {
      expect(formatSlotDate(null)).toBe("");
    });

    it("should return empty string when slot is undefined", () => {
      expect(formatSlotDate(undefined)).toBe("");
    });

    it("should return empty string when slot.date is null", () => {
      expect(formatSlotDate({ date: null })).toBe("");
    });

    it("should return empty string when slot.date is undefined", () => {
      expect(formatSlotDate({})).toBe("");
    });

    it("should format date string correctly", () => {
      const result = formatSlotDate({ date: "2024-01-15" });
      expect(result).toContain("Monday");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("isActive", () => {
    it("should return true when slot is null (due to optional chaining)", () => {
      expect(isActive(null)).toBe(true);
    });

    it("should return true when slot is undefined (due to optional chaining)", () => {
      expect(isActive(undefined)).toBe(true);
    });

    it("should return false when status is cancelled", () => {
      expect(isActive({ status: "cancelled" })).toBe(false);
    });

    it("should return true when status is not cancelled", () => {
      expect(isActive({ status: "pending" })).toBe(true);
    });

    it("should return true when status is missing", () => {
      expect(isActive({})).toBe(true);
    });

    it("should return true when status is null", () => {
      expect(isActive({ status: null })).toBe(true);
    });
  });

  describe("isValidMeetingLink", () => {
    it("should return false for null", () => {
      expect(isValidMeetingLink(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isValidMeetingLink(undefined)).toBe(false);
    });

    it("should return false for invalid URL", () => {
      expect(isValidMeetingLink("not a url")).toBe(false);
    });

    it("should return false for http protocol", () => {
      expect(isValidMeetingLink("http://meet.google.com/abc")).toBe(false);
    });

    it("should return true for https meet.google.com", () => {
      expect(isValidMeetingLink("https://meet.google.com/abc")).toBe(true);
    });

    it("should return true for https zoom.us", () => {
      expect(isValidMeetingLink("https://zoom.us/j/123")).toBe(true);
    });

    it("should return true for https teams.microsoft.com", () => {
      expect(isValidMeetingLink("https://teams.microsoft.com/l/meetup")).toBe(true);
    });

    it("should return true for https whereby.com", () => {
      expect(isValidMeetingLink("https://whereby.com/room")).toBe(true);
    });

    it("should return true for https around.co", () => {
      expect(isValidMeetingLink("https://around.co/room")).toBe(true);
    });

    it("should return true for https meet.jit.si", () => {
      expect(isValidMeetingLink("https://meet.jit.si/room")).toBe(true);
    });

    it("should return true for https webex.com", () => {
      expect(isValidMeetingLink("https://webex.com/meet")).toBe(true);
    });

    it("should return true for subdomain of allowed domain", () => {
      expect(isValidMeetingLink("https://sub.meet.google.com/abc")).toBe(true);
    });

    it("should return false for non-allowed domain", () => {
      expect(isValidMeetingLink("https://example.com/meet")).toBe(false);
    });
  });

  describe("getSlotPillClasses", () => {
    it("should return selected classes when selected is true", () => {
      const result = getSlotPillClasses(true, false);
      expect(result).toBe("bg-blue-900 border-blue-900 shadow-lg shadow-blue-100 scale-[1.02]");
    });

    it("should return booked classes when booked is true", () => {
      const result = getSlotPillClasses(false, true);
      expect(result).toBe("bg-slate-50 border-slate-100 cursor-not-allowed opacity-40");
    });

    it("should return default classes when neither selected nor booked", () => {
      const result = getSlotPillClasses(false, false);
      expect(result).toBe("bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md cursor-pointer");
    });

    it("should prioritize selected over booked", () => {
      const result = getSlotPillClasses(true, true);
      expect(result).toBe("bg-blue-900 border-blue-900 shadow-lg shadow-blue-100 scale-[1.02]");
    });
  });

  describe("getDayTabClasses", () => {
    it("should return active classes when isActiveTab is true", () => {
      const result = getDayTabClasses(true, 5);
      expect(result).toBe("bg-blue-900 border-blue-900 shadow-md");
    });

    it("should return disabled classes when freeCnt is 0", () => {
      const result = getDayTabClasses(false, 0);
      expect(result).toBe("bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed");
    });

    it("should return default classes when not active and has free slots", () => {
      const result = getDayTabClasses(false, 5);
      expect(result).toBe("bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50");
    });

    it("should prioritize active over zero free count", () => {
      const result = getDayTabClasses(true, 0);
      expect(result).toBe("bg-blue-900 border-blue-900 shadow-md");
    });
  });

  describe("getSessionStatus", () => {
    it("should return cancelled config when cancelled is true", () => {
      const result = getSessionStatus({}, true, false);
      expect(result).toEqual({
        label: "Cancelled",
        className: "bg-red-50 text-red-500 border-red-200",
      });
    });

    it("should return completed config when bothDone is true", () => {
      const result = getSessionStatus({}, false, true);
      expect(result).toEqual({
        label: "Completed",
        className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      });
    });

    it("should return inProgress config when menteeMarked is true", () => {
      const result = getSessionStatus({ menteeMarked: true }, false, false);
      expect(result).toEqual({
        label: "In Progress",
        className: "bg-amber-50 text-amber-600 border-amber-200",
      });
    });

    it("should return inProgress config when mentorMarked is true", () => {
      const result = getSessionStatus({ mentorMarked: true }, false, false);
      expect(result).toEqual({
        label: "In Progress",
        className: "bg-amber-50 text-amber-600 border-amber-200",
      });
    });

    it("should return pending config when no conditions met", () => {
      const result = getSessionStatus({}, false, false);
      expect(result).toEqual({
        label: "Pending",
        className: "bg-slate-100 text-slate-500 border-slate-200",
      });
    });

    it("should prioritize cancelled over bothDone", () => {
      const result = getSessionStatus({}, true, true);
      expect(result.label).toBe("Cancelled");
    });
  });

  describe("getCardBorderClass", () => {
    it("should return cancelled border when cancelled is true", () => {
      const result = getCardBorderClass(true, false);
      expect(result).toBe("opacity-60 border-red-100");
    });

    it("should return completed border when bothDone is true", () => {
      const result = getCardBorderClass(false, true);
      expect(result).toBe("border-emerald-200");
    });

    it("should return default border when neither cancelled nor bothDone", () => {
      const result = getCardBorderClass(false, false);
      expect(result).toBe("border-slate-200");
    });

    it("should prioritize cancelled over bothDone", () => {
      const result = getCardBorderClass(true, true);
      expect(result).toBe("opacity-60 border-red-100");
    });
  });

  describe("isMoreThan12HrsAway", () => {
    it("should return false when targetSlot is null", () => {
      expect(isMoreThan12HrsAway(null)).toBe(false);
    });

    it("should return false when targetSlot is undefined", () => {
      expect(isMoreThan12HrsAway(undefined)).toBe(false);
    });

    it("should return false when targetSlot.date is missing", () => {
      expect(isMoreThan12HrsAway({})).toBe(false);
    });

    it("should return false when targetSlot.startTime is missing", () => {
      expect(isMoreThan12HrsAway({ date: "2024-01-01" })).toBe(false);
    });

    it("should return true for session more than 12 hours away", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 13);
      const dateStr = futureDate.toISOString().split("T")[0];
      const timeStr = futureDate.toTimeString().split(" ")[0].substring(0, 5);

      const result = isMoreThan12HrsAway({ date: dateStr, startTime: timeStr });
      expect(result).toBe(true);
    });

    it("should return false for session less than 12 hours away", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 11);
      const dateStr = futureDate.toISOString().split("T")[0];
      const timeStr = futureDate.toTimeString().split(" ")[0].substring(0, 5);

      const result = isMoreThan12HrsAway({ date: dateStr, startTime: timeStr });
      expect(result).toBe(false);
    });

    it("should return false for session exactly 12 hours away", () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 12);
      const dateStr = futureDate.toISOString().split("T")[0];
      const timeStr = futureDate.toTimeString().split(" ")[0].substring(0, 5);

      const result = isMoreThan12HrsAway({ date: dateStr, startTime: timeStr });
      expect(result).toBe(false);
    });

    it("should return false for past session", () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      const dateStr = pastDate.toISOString().split("T")[0];
      const timeStr = pastDate.toTimeString().split(" ")[0].substring(0, 5);

      const result = isMoreThan12HrsAway({ date: dateStr, startTime: timeStr });
      expect(result).toBe(false);
    });
  });
});
