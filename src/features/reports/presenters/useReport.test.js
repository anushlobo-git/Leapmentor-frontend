/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/__tests__/useReport.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useReport from "./useReport";
import { getFeedback, submitFeedbackRequest } from "@features/reports/models/reports.api";
import logger from "@lib/monitoring/logger";
import { mapFeedback } from "@features/reports/models/reportMapper";

vi.mock("@features/reports/models/reports.api", () => ({
  getFeedback: vi.fn(),
  submitFeedbackRequest: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@features/reports/models/reportMapper", () => ({
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
      expect(getFeedback).not.toHaveBeenCalled();
    });

    it("fetches feedback on mount and maps both feedback objects", async () => {
      getFeedback.mockResolvedValueOnce({
        data: {
          myFeedback: { rating: 5 },
          theirFeedback: { rating: 4 },
          sessionStatus: "completed",
        },
      });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(getFeedback).toHaveBeenCalledWith(CONNECT_REQUEST_ID);
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
      getFeedback.mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.myFeedback).toBeNull();
      expect(result.current.theirFeedback).toBeNull();
      expect(result.current.sessionStatus).toBeNull();
      expect(mapFeedback).not.toHaveBeenCalled();
    });

    it("sets an error message from the response when fetching fails", async () => {
      getFeedback.mockRejectedValueOnce({
        response: { data: { message: "Feedback not found" } },
      });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Feedback not found");
    });

    it("falls back to a generic error message when the error has no response message", async () => {
      getFeedback.mockRejectedValueOnce(new Error("network down"));

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Failed to load feedback.");
    });

    it("refetches when refreshKey changes", async () => {
      getFeedback.mockResolvedValue({ data: {} });

      const { result, rerender } = renderHook(
        ({ refreshKey }) => useReport(CONNECT_REQUEST_ID, refreshKey),
        { initialProps: { refreshKey: 0 } },
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(getFeedback).toHaveBeenCalledTimes(1);

      rerender({ refreshKey: 1 });

      await waitFor(() =>
        expect(getFeedback).toHaveBeenCalledTimes(2),
      );
    });
  });

  describe("submitFeedback", () => {
    const setupResolvedFetch = () => {
      getFeedback.mockResolvedValue({ data: {} });
    };

    it("returns a failure result and does not call the API when connectRequestId is missing", async () => {
      const { result } = renderHook(() => useReport(undefined));

      let response;
      await act(async () => {
        response = await result.current.submitFeedback(5, "great", 0);
      });

      expect(response).toEqual({ success: false });
      expect(submitFeedbackRequest).not.toHaveBeenCalled();
    });

    it("submits feedback, logs the attempt, and stores the mapped result on success", async () => {
      setupResolvedFetch();
      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const feedbackPayload = { rating: 5, comment: "great" };
      submitFeedbackRequest.mockResolvedValueOnce({
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
      expect(submitFeedbackRequest).toHaveBeenCalledWith({
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

      submitFeedbackRequest.mockRejectedValueOnce({
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

      submitFeedbackRequest.mockRejectedValueOnce(new Error("network down"));

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
      getFeedback.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useReport(CONNECT_REQUEST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      getFeedback.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(getFeedback).toHaveBeenCalledTimes(1);
    });
  });
});
