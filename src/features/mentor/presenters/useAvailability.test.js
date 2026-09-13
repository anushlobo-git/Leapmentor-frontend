/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useAvailability from "./useAvailability";
import axiosInstance from "@lib/axiosInstance";
import { HTTP_STATUS } from "@lib/httpStatus";

// Mock dependencies
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("@lib/httpStatus", () => ({
  HTTP_STATUS: {
    NOT_FOUND: 404,
  },
}));

describe("useAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useAvailability());

      expect(result.current.availability).toEqual({
        timezone: "Asia/Kolkata",
        sessionDurations: [30, 60],
        googleCalendarConnected: false,
        specificDates: [],
      });
      expect(result.current.loading).toBe(true);
      expect(result.current.saving).toBe(false);
      expect(result.current.msg).toEqual({ type: "", text: "" });
    });
  });

  describe("fetch availability on mount", () => {
    it("should fetch availability successfully", async () => {
      const mockData = {
        timezone: "America/New_York",
        sessionDurations: [30, 45, 60],
        googleCalendarConnected: true,
        specificDates: ["2024-01-01", "2024-01-02"],
      };
      axiosInstance.get.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/availability/me");
      expect(result.current.availability).toEqual({
        timezone: "America/New_York",
        sessionDurations: [30, 45, 60],
        googleCalendarConnected: true,
        specificDates: ["2024-01-01", "2024-01-02"],
      });
    });

    it("should handle missing specificDates in response", async () => {
      const mockData = {
        timezone: "America/New_York",
        sessionDurations: [30, 60],
        googleCalendarConnected: false,
      };
      axiosInstance.get.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.availability.specificDates).toEqual([]);
    });

    it("should handle 404 error gracefully", async () => {
      axiosInstance.get.mockRejectedValue({
        response: { status: HTTP_STATUS.NOT_FOUND },
      });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.msg).toEqual({ type: "", text: "" });
    });

    it("should handle other errors", async () => {
      axiosInstance.get.mockRejectedValue({
        response: { status: 500 },
      });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Failed to load availability.",
      });
    });
  });

  describe("toggleDuration", () => {
    it("should add duration if not present", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleDuration(45);
      });

      expect(result.current.availability.sessionDurations).toContain(45);
      expect(result.current.availability.sessionDurations).toEqual([30, 45, 60]);
    });

    it("should remove duration if present", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleDuration(30);
      });

      expect(result.current.availability.sessionDurations).not.toContain(30);
      expect(result.current.availability.sessionDurations).toEqual([60]);
    });

    it("should keep durations sorted", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleDuration(90);
        result.current.toggleDuration(15);
      });

      expect(result.current.availability.sessionDurations).toEqual([15, 30, 60, 90]);
    });
  });

  describe("updateTimezone", () => {
    it("should update timezone", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateTimezone("America/Los_Angeles");
      });

      expect(result.current.availability.timezone).toBe("America/Los_Angeles");
    });
  });

  describe("setSpecificDates", () => {
    it("should set specificDates with value", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newDates = ["2024-01-01", "2024-01-02"];
      act(() => {
        result.current.setSpecificDates(newDates);
      });

      expect(result.current.availability.specificDates).toEqual(newDates);
    });

    it("should set specificDates with updater function", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSpecificDates((prev) => [...prev, "2024-01-03"]);
      });

      expect(result.current.availability.specificDates).toContain("2024-01-03");
    });
  });

  describe("setAvailability", () => {
    it("should allow direct setAvailability for googleCalendarConnected", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setAvailability({
          ...result.current.availability,
          googleCalendarConnected: true,
        });
      });

      expect(result.current.availability.googleCalendarConnected).toBe(true);
    });
  });

  describe("saveAvailability", () => {
    it("should save availability successfully", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.patch.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveAvailability();
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith("/availability/me", {
        timezone: "Asia/Kolkata",
        sessionDurations: [30, 60],
        specificDates: [],
      });
      expect(result.current.msg).toEqual({
        type: "success",
        text: "Availability saved successfully!",
      });
      expect(result.current.saving).toBe(false);
    });

    it("should handle save error", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Server error" } },
      });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveAvailability();
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Server error",
      });
      expect(result.current.saving).toBe(false);
    });

    it("should handle save error with no response message", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.patch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.saveAvailability();
      });

      expect(result.current.msg).toEqual({
        type: "error",
        text: "Network error",
      });
    });
  });

  describe("cancelChanges", () => {
    it("should re-fetch availability to discard local changes", async () => {
      const mockData = {
        timezone: "America/New_York",
        sessionDurations: [30],
        specificDates: [],
      };
      axiosInstance.get.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Make local changes
      act(() => {
        result.current.updateTimezone("Europe/London");
        result.current.toggleDuration(45);
      });

      expect(result.current.availability.timezone).toBe("Europe/London");
      expect(result.current.availability.sessionDurations).toContain(45);

      // Cancel changes
      await act(async () => {
        await result.current.cancelChanges();
      });

      expect(result.current.availability.timezone).toBe("America/New_York");
      expect(result.current.availability.sessionDurations).toEqual([30]);
      expect(result.current.msg).toEqual({ type: "", text: "" });
    });

    it("should handle cancel error silently", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });
      axiosInstance.get.mockRejectedValueOnce(new Error("Error"));

      const { result } = renderHook(() => useAvailability());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.cancelChanges();
      });

      // Should not throw error
      expect(result.current.loading).toBe(false);
    });
  });
});
