/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEscrowPayment } from "./useEscrowPayment";

// Mock dependencies
vi.mock("@features/connects/api/escrow.api", () => ({
  getEscrowStatus: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

import { getEscrowStatus } from "@features/connects/api/escrow.api";
import logger from "@lib/logger";

describe("useEscrowPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useEscrowPayment(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.fetching).toBe(true);
    expect(result.current.error).toBe("");
    expect(result.current.walletBalance).toBe(null);
    expect(result.current.commissionRate).toBe(20);
    expect(result.current.sessionRate).toBe(0);
    expect(result.current.remoteSessionCount).toBe(null);
  });

  it("should use custom default values", () => {
    const { result } = renderHook(() =>
      useEscrowPayment(null, 100, 15)
    );

    expect(result.current.commissionRate).toBe(15);
    expect(result.current.sessionRate).toBe(100);
  });

  it("should fetch escrow status when connectId is provided", async () => {
    const mockData = {
      wallet: { balance: 500 },
      commissionRate: 25,
      sessionRate: 150,
      sessionCount: 5,
    };
    getEscrowStatus.mockResolvedValue(mockData);

    const { result } = renderHook(() => useEscrowPayment("connect-123"));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(getEscrowStatus).toHaveBeenCalledWith("connect-123");
    expect(result.current.walletBalance).toBe(500);
    expect(result.current.commissionRate).toBe(25);
    expect(result.current.sessionRate).toBe(150);
    expect(result.current.remoteSessionCount).toBe(5);
  });


  it("should handle API errors gracefully", async () => {
    const mockError = new Error("API Error");
    mockError.response = { data: "Error details" };
    getEscrowStatus.mockRejectedValue(mockError);

    const { result } = renderHook(() => useEscrowPayment("connect-123"));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(logger.warn).toHaveBeenCalled();
    expect(result.current.walletBalance).toBe(null);
  });

  it("should use default session rate when remote rate is null", async () => {
    const mockData = {
      wallet: { balance: 500 },
      commissionRate: 25,
    };
    getEscrowStatus.mockResolvedValue(mockData);

    const { result } = renderHook(() => useEscrowPayment("connect-123", 100));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(result.current.sessionRate).toBe(100);
  });

  it("should use remote session rate when available", async () => {
    const mockData = {
      wallet: { balance: 500 },
      sessionRate: 200,
    };
    getEscrowStatus.mockResolvedValue(mockData);

    const { result } = renderHook(() => useEscrowPayment("connect-123", 100));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(result.current.sessionRate).toBe(200);
  });

  it("should handle null wallet balance", async () => {
    const mockData = {};
    getEscrowStatus.mockResolvedValue(mockData);

    const { result } = renderHook(() => useEscrowPayment("connect-123"));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(result.current.walletBalance).toBe(null);
  });


  it("should refetch when connectId changes", async () => {
    getEscrowStatus.mockResolvedValue({ wallet: { balance: 500 } });

    const { result, rerender } = renderHook(
      ({ connectId }) => useEscrowPayment(connectId),
      { initialProps: { connectId: "connect-1" } }
    );

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(getEscrowStatus).toHaveBeenCalledTimes(1);

    rerender({ connectId: "connect-2" });

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(getEscrowStatus).toHaveBeenCalledTimes(2);
    expect(getEscrowStatus).toHaveBeenLastCalledWith("connect-2");
  });
});
