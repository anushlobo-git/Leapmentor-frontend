/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useSessions from "./useSessions";
import axiosInstance from "@lib/axiosInstance";
import {
  mapSlot,
  mapSessionSlotsResponse,
} from "@features/sessions/mappers/sessionsMapper";

vi.mock("@lib/axiosInstance", () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

vi.mock("@features/sessions/mappers/sessionsMapper", () => ({
  mapSlot: vi.fn(),
  mapSessionSlotsResponse: vi.fn(),
}));

const defaultMapped = {
  slots: [{ id: "slot-1" }, { id: "slot-2" }],
  completedSlots: 0,
  totalSlots: 2,
  progress: 0,
  allComplete: false,
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mapSessionSlotsResponse.mockReturnValue(defaultMapped);
    axiosInstance.get.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial fetch", () => {
    it("should fetch and apply slot data on mount", async () => {
      const { result } = renderHook(() => useSessions("req-1"));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/sessions/req-1/slots");
      expect(result.current.slots).toEqual(defaultMapped.slots);
      expect(result.current.completedSlots).toBe(0);
      expect(result.current.totalSlots).toBe(2);
      expect(result.current.progress).toBe(0);
      expect(result.current.allComplete).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should not fetch and should stay loading when connectRequestId is missing", async () => {
      const { result } = renderHook(() => useSessions(undefined));

      await flush();

      expect(axiosInstance.get).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(true);
    });

    it("should set an error message from the API response on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue({
        response: { data: { message: "Session not found" } },
      });

      const { result } = renderHook(() => useSessions("req-1"));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Session not found");
    });

    it("should fall back to a default error message on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue(new Error("network down"));

      const { result } = renderHook(() => useSessions("req-1"));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe("Failed to load sessions.");
    });

    it("should re-fetch when connectRequestId changes", async () => {
      const { result, rerender } = renderHook(({ id }) => useSessions(id), {
        initialProps: { id: "req-1" },
      });

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(axiosInstance.get).toHaveBeenCalledWith("/sessions/req-1/slots");

      rerender({ id: "req-2" });

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/sessions/req-2/slots");
      });
    });
  });

  describe("polling", () => {
    it("should poll for updates every 5 seconds without toggling loading", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useSessions("req-1"));

      await flush();
      expect(result.current.loading).toBe(false);
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.advanceTimersByTime(5000);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result.current.loading).toBe(false);
    });

    it("should stop polling after unmount", async () => {
      vi.useFakeTimers();
      const { unmount } = renderHook(() => useSessions("req-1"));

      await flush();
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(10000);
        await Promise.resolve();
      });

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it("should not set an interval when connectRequestId is missing", async () => {
      vi.useFakeTimers();
      renderHook(() => useSessions(undefined));

      await act(async () => {
        vi.advanceTimersByTime(20000);
        await Promise.resolve();
      });

      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  describe("setMeetingLink", () => {
    const setup = async () => {
      const hook = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    };

    it("should return failure without an API call when meetingLink is blank", async () => {
      const { result } = await setup();

      let response;
      await act(async () => {
        response = await result.current.setMeetingLink(0, "   ");
      });

      expect(response).toEqual({ success: false });
      expect(axiosInstance.patch).not.toHaveBeenCalled();
    });

    it("should patch the meeting link and update the matching slot", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockResolvedValue({ data: { slot: { raw: true } } });
      mapSlot.mockReturnValue({ meetingLink: "https://zoom.us/xyz" });

      let response;
      await act(async () => {
        response = await result.current.setMeetingLink(
          0,
          "https://zoom.us/xyz",
        );
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/sessions/req-1/slots/0/meeting-link",
        { meetingLink: "https://zoom.us/xyz" },
      );
      expect(response).toEqual({ success: true });
      expect(result.current.slots[0]).toEqual({
        id: "slot-1",
        meetingLink: "https://zoom.us/xyz",
      });
      expect(result.current.savingSlots.has(0)).toBe(false);
    });

    it("should set an error and return failure when the patch request fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Invalid link" } },
      });

      let response;
      await act(async () => {
        response = await result.current.setMeetingLink(
          0,
          "https://zoom.us/xyz",
        );
      });

      expect(response).toEqual({ success: false, message: "Invalid link" });
      expect(result.current.error).toBe("Invalid link");
      expect(result.current.savingSlots.has(0)).toBe(false);
    });

    it("should fall back to a default error message when saving the link fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue(new Error("network down"));

      let response;
      await act(async () => {
        response = await result.current.setMeetingLink(
          0,
          "https://zoom.us/xyz",
        );
      });

      expect(result.current.error).toBe("Failed to save meeting link.");
      expect(response.success).toBe(false);
    });
  });

  describe("markSlotComplete", () => {
    const setup = async () => {
      const hook = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    };

    it("should mark a slot complete and apply the updated slot data", async () => {
      const { result } = await setup();
      const updatedMapped = { ...defaultMapped, completedSlots: 1 };
      axiosInstance.patch.mockResolvedValue({ data: { raw: "payload" } });
      mapSessionSlotsResponse.mockReturnValue(updatedMapped);

      let response;
      await act(async () => {
        response = await result.current.markSlotComplete(0);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/sessions/req-1/slots/0/mark-complete",
        {},
      );
      expect(response).toEqual({ raw: "payload", success: true });
      expect(result.current.completedSlots).toBe(1);
    });

    it("should set an error and return failure when marking complete fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Cannot complete" } },
      });

      let response;
      await act(async () => {
        response = await result.current.markSlotComplete(0);
      });

      expect(response).toEqual({ success: false, message: "Cannot complete" });
      expect(result.current.error).toBe("Cannot complete");
    });

    it("should fall back to a default error message when marking complete fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue(new Error("boom"));

      await act(async () => {
        await result.current.markSlotComplete(0);
      });

      expect(result.current.error).toBe("Failed to mark session complete.");
    });
  });

  describe("addSlot", () => {
    const setup = async () => {
      const hook = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    };

    const newSlot = {
      day: "Monday",
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "10:00",
    };

    it("should add a slot and return its slotId", async () => {
      const { result } = await setup();
      axiosInstance.post.mockResolvedValue({ data: { slotId: "new-1" } });

      let response;
      await act(async () => {
        response = await result.current.addSlot(newSlot);
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/sessions/req-1/add-slot",
        newSlot,
      );
      expect(response).toEqual({ success: true, slotId: "new-1" });
    });

    it("should default slotId to null when the API does not return one", async () => {
      const { result } = await setup();
      axiosInstance.post.mockResolvedValue({ data: {} });

      let response;
      await act(async () => {
        response = await result.current.addSlot(newSlot);
      });

      expect(response).toEqual({ success: true, slotId: null });
    });

    it("should set an error and return failure when adding a slot fails", async () => {
      const { result } = await setup();
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Slot conflict" } },
      });

      let response;
      await act(async () => {
        response = await result.current.addSlot(newSlot);
      });

      expect(response).toEqual({ success: false, message: "Slot conflict" });
      expect(result.current.error).toBe("Slot conflict");
    });

    it("should fall back to a default error message when adding a slot fails", async () => {
      const { result } = await setup();
      axiosInstance.post.mockRejectedValue(new Error("boom"));

      let response;
      await act(async () => {
        response = await result.current.addSlot(newSlot);
      });

      expect(response.message).toBe("Failed to add session.");
    });
  });

  describe("cancelSlot", () => {
    const setup = async () => {
      const hook = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    };

    it("should cancel a slot with the given reason", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockResolvedValue({ data: { raw: "ok" } });

      let response;
      await act(async () => {
        response = await result.current.cancelSlot(1, "Schedule conflict");
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/sessions/req-1/slots/1/cancel",
        { reason: "Schedule conflict" },
      );
      expect(response).toEqual({ raw: "ok", success: true });
    });

    it("should default the reason to an empty string", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockResolvedValue({ data: {} });

      await act(async () => {
        await result.current.cancelSlot(1);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/sessions/req-1/slots/1/cancel",
        { reason: "" },
      );
    });

    it("should set an error and return failure when cancelling fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Cannot cancel" } },
      });

      let response;
      await act(async () => {
        response = await result.current.cancelSlot(1, "reason");
      });

      expect(response).toEqual({ success: false, message: "Cannot cancel" });
      expect(result.current.error).toBe("Cannot cancel");
    });

    it("should fall back to a default error message when cancelling fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue(new Error("boom"));

      let response;
      await act(async () => {
        response = await result.current.cancelSlot(1, "reason");
      });

      expect(response.message).toBe("Failed to cancel slot.");
    });
  });

  describe("rescheduleSlot", () => {
    const setup = async () => {
      const hook = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(hook.result.current.loading).toBe(false));
      return hook;
    };

    const newTime = {
      date: "2026-02-10",
      startTime: "13:00",
      endTime: "14:00",
    };

    it("should reschedule a slot", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockResolvedValue({ data: { raw: "ok" } });

      let response;
      await act(async () => {
        response = await result.current.rescheduleSlot(0, newTime);
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/sessions/req-1/slots/0/reschedule",
        newTime,
      );
      expect(response).toEqual({ raw: "ok", success: true });
    });

    it("should set an error and return failure when rescheduling fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Cannot reschedule" } },
      });

      let response;
      await act(async () => {
        response = await result.current.rescheduleSlot(0, newTime);
      });

      expect(response).toEqual({
        success: false,
        message: "Cannot reschedule",
      });
      expect(result.current.error).toBe("Cannot reschedule");
    });

    it("should fall back to a default error message when rescheduling fails", async () => {
      const { result } = await setup();
      axiosInstance.patch.mockRejectedValue(new Error("boom"));

      let response;
      await act(async () => {
        response = await result.current.rescheduleSlot(0, newTime);
      });

      expect(response.message).toBe("Failed to reschedule slot.");
    });
  });

  describe("refetch and onAllComplete", () => {
    it("should expose fetchSlots as refetch for manual re-fetching", async () => {
      const { result } = renderHook(() => useSessions("req-1"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      axiosInstance.get.mockClear();
      await act(async () => {
        await result.current.refetch();
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/sessions/req-1/slots");
    });

    it("should accept an updated onAllComplete callback across re-renders", async () => {
      const onAllComplete1 = vi.fn();
      const onAllComplete2 = vi.fn();
      const { result, rerender } = renderHook(
        ({ cb }) => useSessions("req-1", cb),
        { initialProps: { cb: onAllComplete1 } },
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      rerender({ cb: onAllComplete2 });

      expect(result.current.slots).toEqual(defaultMapped.slots);
    });
  });
});
