/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/__tests__/useReport.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useReport from "./useReport";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import { mapFeedback } from "@features/reports/mappers/reportMapper";

vi.mock("@lib/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("@lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@features/reports/mappers/reportMapper", () => ({
  mapFeedback: vi.fn((raw) => ({ ...raw, mapped: true })),
}));

const CONNECT_REQUEST_ID = "connect-123";

describe("useReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial fetch", () => {
    it("does nothing when connectRequestId is falsy", () => {
      renderHook(() => useReport(undefined));
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });

    it("fetches feedback on mount and maps both feedback objects", async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: {
          myFeedback: { rating: 5 },
          theirFeedback: { rating: 4 },
          sessionStatus: "completed",
        },
      });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/feedback/${CONNECT_REQUEST_ID}`,
      );
      expect(mapFeedback).toHaveBeenCalledWith({ rating: 5 });
      expect(mapFeedback).toHaveBeenCalledWith({ rating: 4 });
      expect(result.current.myFeedback).toEqual({ rating: 5, mapped: true });
      expect(result.current.theirFeedback).toEqual({
        rating: 4,
        mapped: true,
      });
      expect(result.current.sessionStatus).toBe("completed");
      expect(result.current.error).toBeNull();
    });

    it("sets myFeedback/theirFeedback to null when the API returns none", async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.myFeedback).toBeNull();
      expect(result.current.theirFeedback).toBeNull();
      expect(result.current.sessionStatus).toBeNull();
      expect(mapFeedback).not.toHaveBeenCalled();
    });

    it("sets an error message from the response when fetching fails", async () => {
      axiosInstance.get.mockRejectedValueOnce({
        response: { data: { message: "Feedback not found" } },
      });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Feedback not found");
    });

    it("falls back to a generic error message when the error has no response message", async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error("network down"));

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Failed to load feedback.");
    });

    it("refetches when refreshKey changes", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result, rerender } = renderHook(
        ({ refreshKey }) => useReport(CONNECT_REQUEST_ID, refreshKey),
        { initialProps: { refreshKey: 0 } },
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);

      rerender({ refreshKey: 1 });

      await waitFor(() =>
        expect(axiosInstance.get).toHaveBeenCalledTimes(2),
      );
    });
  });

  describe("submitFeedback", () => {
    const setupResolvedFetch = () => {
      axiosInstance.get.mockResolvedValue({ data: {} });
    };

    it("returns a failure result and does not call the API when connectRequestId is missing", async () => {
      const { result } = renderHook(() => useReport(undefined));

      let response;
      await act(async () => {
        response = await result.current.submitFeedback(5, "great", 0);
      });

      expect(response).toEqual({ success: false });
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it("submits feedback, logs the attempt, and stores the mapped result on success", async () => {
      setupResolvedFetch();
      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const feedbackPayload = { rating: 5, comment: "great" };
      axiosInstance.post.mockResolvedValueOnce({
        data: { feedback: feedbackPayload },
      });

      let response;
      await act(async () => {
        response = await result.current.submitFeedback(5, "great", 2);
      });

      expect(logger.info).toHaveBeenCalledWith("Sending feedback", {
        connectRequestId: CONNECT_REQUEST_ID,
        rating: 5,
        comment: "great",
        slotIndex: 2,
      });
      expect(axiosInstance.post).toHaveBeenCalledWith("/feedback", {
        connectRequestId: CONNECT_REQUEST_ID,
        rating: 5,
        comment: "great",
        slotIndex: 2,
      });
      expect(mapFeedback).toHaveBeenCalledWith(feedbackPayload);
      expect(response).toEqual({ success: true });
      expect(result.current.myFeedback).toEqual({
        ...feedbackPayload,
        mapped: true,
      });
      expect(result.current.submitting).toBe(false);
    });

    it("returns a failure result and sets error with the response message on failure", async () => {
      setupResolvedFetch();
      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: "Already submitted" } },
      });

      let response;
      await act(async () => {
        response = await result.current.submitFeedback(1, "bad", 0);
      });

      expect(response).toEqual({
        success: false,
        message: "Already submitted",
      });
      expect(result.current.error).toBe("Already submitted");
      expect(result.current.submitting).toBe(false);
    });

    it("falls back to a generic error message when submit fails without a response message", async () => {
      setupResolvedFetch();
      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      axiosInstance.post.mockRejectedValueOnce(new Error("network down"));

      let response;
      await act(async () => {
        response = await result.current.submitFeedback(1, "bad", 0);
      });

      expect(response).toEqual({
        success: false,
        message: "Failed to submit feedback.",
      });
      expect(result.current.error).toBe("Failed to submit feedback.");
    });
  });

  describe("refetch", () => {
    it("exposes a refetch function that re-invokes the fetch", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      axiosInstance.get.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });
});
