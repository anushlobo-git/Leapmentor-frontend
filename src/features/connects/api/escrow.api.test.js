/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  payEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowStatus,
  payAdditionalEscrow,
  getPlatformCommissionRate,
} from "./escrow.api";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("escrow.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("payEscrow", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const params = {
        connectRequestId: "req123",
        sessionRate: 100,
        sessionCount: 5,
      };

      const result = await payEscrow(params);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/escrow/pay",
        params
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Payment failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockRejectedValue(mockError);

      const params = {
        connectRequestId: "req123",
        sessionRate: 100,
        sessionCount: 5,
      };

      await expect(payEscrow(params)).rejects.toThrow("Payment failed");
    });
  });

  describe("releaseEscrow", () => {
    it("should call axiosInstance.post with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const requestId = "req123";
      const result = await releaseEscrow(requestId);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/escrow/release/${requestId}`,
        {}
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Release failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockRejectedValue(mockError);

      await expect(releaseEscrow("req123")).rejects.toThrow("Release failed");
    });
  });

  describe("refundEscrow", () => {
    it("should call axiosInstance.post with correct endpoint", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const requestId = "req123";
      const result = await refundEscrow(requestId);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/escrow/refund/${requestId}`,
        {}
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Refund failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockRejectedValue(mockError);

      await expect(refundEscrow("req123")).rejects.toThrow("Refund failed");
    });
  });

  describe("getEscrowStatus", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: { status: "locked" } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const requestId = "req123";
      const result = await getEscrowStatus(requestId);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/escrow/status/${requestId}`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Status fetch failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockRejectedValue(mockError);

      await expect(getEscrowStatus("req123")).rejects.toThrow("Status fetch failed");
    });
  });

  describe("payAdditionalEscrow", () => {
    it("should call axiosInstance.post with correct endpoint and payload", async () => {
      const mockResponse = { data: { success: true } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockResolvedValue(mockResponse);

      const params = {
        connectRequestId: "req123",
        sessionRate: 100,
        slotId: "slot456",
      };

      const result = await payAdditionalEscrow(params);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/escrow/pay-additional",
        params
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Additional payment failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.post.mockRejectedValue(mockError);

      const params = {
        connectRequestId: "req123",
        sessionRate: 100,
        slotId: "slot456",
      };

      await expect(payAdditionalEscrow(params)).rejects.toThrow("Additional payment failed");
    });
  });

  describe("getPlatformCommissionRate", () => {
    it("should call axiosInstance.get with correct endpoint", async () => {
      const mockResponse = { data: { commissionRate: 0.1 } };
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getPlatformCommissionRate();

      expect(axiosInstance.get).toHaveBeenCalledWith("/escrow/commission-rate");
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Commission rate fetch failed");
      const axiosInstance = (await import("@lib/axiosInstance")).default;
      axiosInstance.get.mockRejectedValue(mockError);

      await expect(getPlatformCommissionRate()).rejects.toThrow("Commission rate fetch failed");
    });
  });
});
