/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSlotLock from "./useSlotLock";
import {
  lockSlotRequest,
  unlockSlotRequest,
  unlockAllSlotsRequest,
} from "@features/sessions/models/sessions.api";
import logger from "@lib/monitoring/logger";

vi.mock("@features/sessions/models/sessions.api", () => ({
  lockSlotRequest: vi.fn(),
  unlockSlotRequest: vi.fn(),
  unlockAllSlotsRequest: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

describe("useSlotLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("lockSlot", () => {
    it("should lock a slot successfully", async () => {
      lockSlotRequest.mockResolvedValue({
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

      expect(lockSlotRequest).toHaveBeenCalledWith(
        "mentor-1",
        "2026-01-05",
        "10:00",
        "11:00",
      );
      expect(response).toEqual({ ok: true, expiresAt: "2026-01-01T00:05:00Z" });
    });

    it("should return code and message from the API on failure", async () => {
      lockSlotRequest.mockRejectedValue({
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
      lockSlotRequest.mockRejectedValue(new Error("network down"));
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
      unlockSlotRequest.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockSlot("2026-01-05", "10:00", "11:00");
      });

      expect(unlockSlotRequest).toHaveBeenCalledWith(
        "mentor-1",
        "2026-01-05",
        "10:00",
        "11:00",
      );
    });

    it("should log a warning and not throw when the unlock request fails", async () => {
      unlockSlotRequest.mockRejectedValue(new Error("boom"));
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
      unlockAllSlotsRequest.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSlotLock("mentor-1"));

      await act(async () => {
        await result.current.unlockAll();
      });

      expect(unlockAllSlotsRequest).toHaveBeenCalledWith("mentor-1");
    });

    it("should log a warning and not throw when the unlock-all request fails", async () => {
      unlockAllSlotsRequest.mockRejectedValue(new Error("boom"));
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
