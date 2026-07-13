/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useRespondToRequest from "./useRespondToRequest";
import axiosInstance from "@lib/axiosInstance";

// Mock dependencies
vi.mock("@lib/axiosInstance", () => ({
  default: {
    patch: vi.fn(),
  },
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock("@app/providers/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe("useRespondToRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useRespondToRequest());

      expect(result.current.responding).toBe(false);
      expect(result.current.referring).toBe(false);
      expect(typeof result.current.respond).toBe("function");
      expect(typeof result.current.refer).toBe("function");
    });
  });

  describe("respond - accept", () => {
    it("should accept request successfully", async () => {
      axiosInstance.patch.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.respond({
          requestId: "req1",
          status: "accepted",
          confirmedSlot: "2024-01-01T10:00:00Z",
          menteeName: "John Doe",
        });
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith("/connect-requests/req1", {
        status: "accepted",
        confirmedSlot: "2024-01-01T10:00:00Z",
      });
      expect(mockShowToast).toHaveBeenCalledWith({
        type: "success",
        title: "Request Accepted! 🎉",
        message: "You accepted John Doe's request. A calendar invite has been sent.",
      });
      expect(response).toBe(true);
      expect(result.current.responding).toBe(false);
    });

    it("should set responding to true during request", async () => {
      axiosInstance.patch.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100)));

      const { result } = renderHook(() => useRespondToRequest());

      act(() => {
        result.current.respond({
          requestId: "req1",
          status: "accepted",
          confirmedSlot: "2024-01-01T10:00:00Z",
          menteeName: "John Doe",
        });
      });

      expect(result.current.responding).toBe(true);
    });
  });

  describe("respond - reject", () => {
    it("should reject request successfully", async () => {
      axiosInstance.patch.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.respond({
          requestId: "req1",
          status: "rejected",
          confirmedSlot: null,
          menteeName: "Jane Smith",
        });
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith("/connect-requests/req1", {
        status: "rejected",
        confirmedSlot: null,
      });
      expect(mockShowToast).toHaveBeenCalledWith({
        type: "info",
        title: "Request Declined",
        message: "You declined Jane Smith's connect request.",
      });
      expect(response).toBe(true);
    });
  });

  describe("respond - error", () => {
    it("should handle respond error", async () => {
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Invalid request" } },
      });

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.respond({
          requestId: "req1",
          status: "accepted",
          confirmedSlot: "2024-01-01T10:00:00Z",
          menteeName: "John Doe",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "error",
        title: "Action failed",
        message: "Invalid request",
      });
      expect(response).toBe(false);
      expect(result.current.responding).toBe(false);
    });

    it("should handle respond error with no response message", async () => {
      axiosInstance.patch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.respond({
          requestId: "req1",
          status: "accepted",
          confirmedSlot: "2024-01-01T10:00:00Z",
          menteeName: "John Doe",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "error",
        title: "Action failed",
        message: "Failed to respond to request.",
      });
      expect(response).toBe(false);
    });
  });

  describe("refer", () => {
    it("should refer request successfully", async () => {
      axiosInstance.patch.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.refer({
          requestId: "req1",
          referToMentorId: "mentor2",
          menteeName: "John Doe",
          referredMentorName: "Jane Smith",
        });
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith("/connect-requests/req1/refer", {
        referToMentorId: "mentor2",
      });
      expect(mockShowToast).toHaveBeenCalledWith({
        type: "info",
        title: "Request Referred",
        message: "John Doe's request has been referred to Jane Smith.",
      });
      expect(response).toBe(true);
      expect(result.current.referring).toBe(false);
    });

    it("should set referring to true during referral", async () => {
      axiosInstance.patch.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100)));

      const { result } = renderHook(() => useRespondToRequest());

      act(() => {
        result.current.refer({
          requestId: "req1",
          referToMentorId: "mentor2",
          menteeName: "John Doe",
          referredMentorName: "Jane Smith",
        });
      });

      expect(result.current.referring).toBe(true);
    });
  });

  describe("refer - error", () => {
    it("should handle refer error", async () => {
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Referral failed" } },
      });

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.refer({
          requestId: "req1",
          referToMentorId: "mentor2",
          menteeName: "John Doe",
          referredMentorName: "Jane Smith",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "error",
        title: "Referral failed",
        message: "Referral failed",
      });
      expect(response).toBe(false);
      expect(result.current.referring).toBe(false);
    });

    it("should handle refer error with no response message", async () => {
      axiosInstance.patch.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useRespondToRequest());

      const response = await act(async () => {
        return await result.current.refer({
          requestId: "req1",
          referToMentorId: "mentor2",
          menteeName: "John Doe",
          referredMentorName: "Jane Smith",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: "error",
        title: "Referral failed",
        message: "Failed to refer request.",
      });
      expect(response).toBe(false);
    });
  });

  describe("multiple operations", () => {
    it("should handle multiple operations sequentially", async () => {
      axiosInstance.patch.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useRespondToRequest());

      const response1 = await act(async () => {
        return await result.current.respond({
          requestId: "req1",
          status: "accepted",
          confirmedSlot: "2024-01-01T10:00:00Z",
          menteeName: "John Doe",
        });
      });

      const response2 = await act(async () => {
        return await result.current.refer({
          requestId: "req2",
          referToMentorId: "mentor2",
          menteeName: "Jane Smith",
          referredMentorName: "Bob Johnson",
        });
      });

      expect(response1).toBe(true);
      expect(response2).toBe(true);
      expect(axiosInstance.patch).toHaveBeenCalledTimes(2);
    });
  });
});
