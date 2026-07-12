import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDateString,
  formatTimeString,
  formatTimeOfDay,
  formatFullSlot,
  formatDateTime,
  formatDateSeparator,
  isSameDay,
  formatSlotDate,
} from "./dateTime";

describe("dateTime formatters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty values for falsy or invalid inputs", () => {
    expect(formatDateString("")).toBe("");
    expect(formatTimeString(null)).toBe("");
    expect(formatTimeOfDay("")).toBe("");
    expect(formatTimeOfDay("invalid")).toBe("");
    expect(formatFullSlot(undefined)).toBe("");
    expect(formatDateTime(false)).toBe("");
    expect(formatDateSeparator("")).toBe("");
    expect(formatDateSeparator("not-a-date")).toBe("");
    expect(isSameDay("", "2024-01-15")).toBe(false);
    expect(isSameDay("2024-01-15", "not-a-date")).toBe(false);
  });

  it("formats dates, times, and full slots for valid values", () => {
    const value = new Date(2024, 0, 15, 10, 5, 0);

    expect(formatDateString(value)).toBe(
      value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
    expect(formatTimeString(value)).toBe(
      value.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
    expect(formatTimeOfDay("09:05")).toBe("09:05 AM");
    expect(formatTimeOfDay("14:30")).toBe("02:30 PM");
    expect(formatFullSlot(value)).toBe(
      `${formatDateString(value)} ${formatTimeString(value)}`.trim(),
    );
    expect(formatDateTime(value)).toBe(
      value.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  });

  it("formats date separators relative to today and yesterday", () => {
    const today = new Date(2024, 0, 15, 9, 0, 0);
    const yesterday = new Date(2024, 0, 14, 9, 0, 0);
    const other = new Date(2024, 0, 10, 9, 0, 0);

    expect(formatDateSeparator(today)).toBe("Today");
    expect(formatDateSeparator(yesterday)).toBe("Yesterday");
    expect(formatDateSeparator(other)).toBe(
      other.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  });

  it("detects whether two values fall on the same day", () => {
    expect(isSameDay("2024-01-15T09:00:00", "2024-01-15T18:30:00")).toBe(true);
    expect(isSameDay("2024-01-15T09:00:00", "2024-01-16T18:30:00")).toBe(false);
  });

  it("formats slot dates correctly", () => {
    const dateStr = "2024-01-15";
    const result = formatSlotDate(dateStr);
    expect(result).toBe("Jan 15");
  });

  it("returns empty string for invalid slot date", () => {
    expect(formatSlotDate("")).toBe("");
    expect(formatSlotDate(null)).toBe("");
    expect(formatSlotDate("invalid-date")).toBe("");
  });

  it("formats slot date with custom options", () => {
    const dateStr = "2024-01-15";
    const result = formatSlotDate(dateStr, { year: "numeric" });
    expect(result).toContain("2024");
  });
});
