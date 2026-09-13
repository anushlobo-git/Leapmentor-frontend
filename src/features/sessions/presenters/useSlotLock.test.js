/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSlotLock from "./useSlotLock";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";

vi.mock("@lib/axiosInstance", () => ({
  default: { post: vi.fn() },
}));

vi.mock("@lib/logger", () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

describe("useSlotLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("lockSlot", () => {
    it("should lock a slot successfully", async () => {
      axiosInstance.post.mockResolvedValue({
        data: { expiresAt: "2026-01-01T00:05:00Z" },
      });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      let response;
      await act(async () => {
        response = await result.current.lockSlot(
          "2026-01-05",
          "10:00",
          "11:00",
        );
      });

      expect(axiosInstance.post).toHaveBeenCalledWith("/slot-locks/lock", {
        mentorId: "mentor-1",
        date: "2026-01-05",
        startTime: "10:00",
        endTime: "11:00",
      });
      expect(response).toEqual({ ok: true, expiresAt: "2026-01-01T00:05:00Z" });
    });

    it("should return code and message from the API on failure", async () => {
      axiosInstance.post.mockRejectedValue({
        response: {
          data: { code: "SLOT_TAKEN", message: "Slot already locked" },
        },
      });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      let response;
      await act(async () => {
        response = await result.current.lockSlot(
          "2026-01-05",
          "10:00",
          "11:00",
        );
      });

      expect(response).toEqual({
        ok: false,
        code: "SLOT_TAKEN",
        msg: "Slot already locked",
      });
    });

    it("should fall back to a default message when there is no response data", async () => {
      axiosInstance.post.mockRejectedValue(new Error("network down"));
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      let response;
      await act(async () => {
        response = await result.current.lockSlot(
          "2026-01-05",
          "10:00",
          "11:00",
        );
      });

      expect(response).toEqual({
        ok: false,
        code: undefined,
        msg: "Could not lock slot",
      });
    });
  });

  describe("unlockSlot", () => {
    it("should call the unlock endpoint with the right payload", async () => {
      axiosInstance.post.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockSlot("2026-01-05", "10:00", "11:00");
      });

      expect(axiosInstance.post).toHaveBeenCalledWith("/slot-locks/unlock", {
        mentorId: "mentor-1",
        date: "2026-01-05",
        startTime: "10:00",
        endTime: "11:00",
      });
    });

    it("should log a warning and not throw when the unlock request fails", async () => {
      axiosInstance.post.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockSlot("2026-01-05", "10:00", "11:00");
      });

      expect(logger.warn).toHaveBeenCalledWith("unlock failed silently:", {
        error: "boom",
      });
    });
  });

  describe("unlockAll", () => {
    it("should call the unlock-all endpoint with the mentorId", async () => {
      axiosInstance.post.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockAll();
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/slot-locks/unlock-all",
        {
          mentorId: "mentor-1",
        },
      );
    });

    it("should log a warning and not throw when the unlock-all request fails", async () => {
      axiosInstance.post.mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockAll();
      });

      expect(logger.warn).toHaveBeenCalledWith("unlock-all failed silently:", {
        error: "boom",
      });
    });
  });
});
