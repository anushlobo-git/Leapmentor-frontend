/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { formatSlotDate, formatSlotTime } from "./sessionFormat";

describe("sessionFormat", () => {
  describe("formatSlotDate", () => {
    it("should format a valid date string", () => {
      const slot = {
        date: "2024-01-15",
      };

      const result = formatSlotDate(slot);

      expect(result).toMatch(/Mon, Jan 15/);
    });

    it("should return empty string for null slot", () => {
      const result = formatSlotDate(null);

      expect(result).toBe("");
    });

    it("should return empty string for undefined slot", () => {
      const result = formatSlotDate(undefined);

      expect(result).toBe("");
    });

    it("should return empty string for slot without date", () => {
      const slot = {};

      const result = formatSlotDate(slot);

      expect(result).toBe("");
    });

    it("should return empty string for slot with null date", () => {
      const slot = {
        date: null,
      };

      const result = formatSlotDate(slot);

      expect(result).toBe("");
    });

    it("should return empty string for slot with undefined date", () => {
      const slot = {
        date: undefined,
      };

      const result = formatSlotDate(slot);

      expect(result).toBe("");
    });
  });

  describe("formatSlotTime", () => {
    it("should format a valid time range", () => {
      const slot = {
        startTime: "09:00",
        endTime: "10:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("9:00 AM – 10:00 AM");
    });

    it("should format afternoon times with PM", () => {
      const slot = {
        startTime: "14:00",
        endTime: "15:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("2:00 PM – 3:00 PM");
    });

    it("should format noon as 12:00 PM", () => {
      const slot = {
        startTime: "12:00",
        endTime: "13:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("12:00 PM – 1:00 PM");
    });

    it("should format midnight as 12:00 AM", () => {
      const slot = {
        startTime: "00:00",
        endTime: "01:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("12:00 AM – 1:00 AM");
    });

    it("should return empty string for null slot", () => {
      const result = formatSlotTime(null);

      expect(result).toBe("");
    });

    it("should return empty string for undefined slot", () => {
      const result = formatSlotTime(undefined);

      expect(result).toBe("");
    });

    it("should return empty string for slot without startTime", () => {
      const slot = {
        endTime: "10:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("");
    });

    it("should return empty string for slot without endTime", () => {
      const slot = {
        startTime: "09:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("");
    });

    it("should return empty string for slot with null startTime", () => {
      const slot = {
        startTime: null,
        endTime: "10:00",
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("");
    });

    it("should return empty string for slot with null endTime", () => {
      const slot = {
        startTime: "09:00",
        endTime: null,
      };

      const result = formatSlotTime(slot);

      expect(result).toBe("");
    });
  });
});
