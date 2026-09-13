/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/__tests__/useReportComplaint.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useReportComplaint from "./useReportComplaint";
import axiosInstance from "@lib/axiosInstance";

vi.mock("@lib/axiosInstance", () => ({
  default: { post: vi.fn() },
}));

const CONNECT_REQUEST_ID = "connect-123";

describe("useReportComplaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with submitting false and error null", () => {
    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.submitReport).toBe("function");
    expect(typeof result.current.setError).toBe("function");
  });

  it("returns a failure result and does not call the API when connectRequestId is missing", async () => {
    const { result } = renderHook(() => useReportComplaint(undefined));

    let response;
    await act(async () => {
      response = await result.current.submitReport({
        complaintType: "abuse",
        description: "desc",
      });
    });

    expect(response).toEqual({ success: false });
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("builds multipart form data without a screenshot and posts it", async () => {
    axiosInstance.post.mockResolvedValueOnce({});

    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    let response;
    await act(async () => {
      response = await result.current.submitReport({
        complaintType: "spam",
        description: "This user is spamming",
      });
    });

    expect(response).toEqual({ success: true });
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);

    const [url, formData] = axiosInstance.post.mock.calls[0];
    expect(url).toBe("/reports");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("connectRequestId")).toBe(CONNECT_REQUEST_ID);
    expect(formData.get("complaintType")).toBe("spam");
    expect(formData.get("description")).toBe("This user is spamming");
    expect(formData.get("screenshot")).toBeNull();

    expect(result.current.submitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("appends the screenshot to the form data when provided", async () => {
    axiosInstance.post.mockResolvedValueOnce({});
    const screenshot = new File(["x"], "shot.png", { type: "image/png" });

    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    await act(async () => {
      await result.current.submitReport({
        complaintType: "abuse",
        description: "desc",
        screenshot,
      });
    });

    const [, formData] = axiosInstance.post.mock.calls[0];
    expect(formData.get("screenshot")).toBe(screenshot);
  });

  it("returns a failure result and sets the error message from the response on failure", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: "Duplicate report" } },
    });

    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    let response;
    await act(async () => {
      response = await result.current.submitReport({
        complaintType: "abuse",
        description: "desc",
      });
    });

    expect(response).toEqual({
      success: false,
      message: "Duplicate report",
    });
    expect(result.current.error).toBe("Duplicate report");
    expect(result.current.submitting).toBe(false);
  });

  it("falls back to a generic error message when the failure has no response message", async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    let response;
    await act(async () => {
      response = await result.current.submitReport({
        complaintType: "abuse",
        description: "desc",
      });
    });

    expect(response).toEqual({
      success: false,
      message: "Failed to submit report. Please try again.",
    });
    expect(result.current.error).toBe(
      "Failed to submit report. Please try again.",
    );
  });

  it("allows manually clearing the error via setError", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: "boom" } },
    });

    const { result } = renderHook(() => useReportComplaint(CONNECT_REQUEST_ID));

    await act(async () => {
      await result.current.submitReport({
        complaintType: "abuse",
        description: "desc",
      });
    });
    expect(result.current.error).toBe("boom");

    act(() => {
      result.current.setError(null);
    });
    expect(result.current.error).toBeNull();
  });
});
