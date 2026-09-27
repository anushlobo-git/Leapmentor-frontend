/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { renderHookWithStore as renderHook, makeTestStore } from "@test/renderWithStore";
import { walletSynced } from "@features/mentee/models/walletSlice";
import { useEscrowPayment } from "./useEscrowPayment";

// Mock dependencies
vi.mock("@features/connects/models/escrow.api", () => ({
  getEscrowStatus: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

import { getEscrowStatus } from "@features/connects/models/escrow.api";
import logger from "@lib/monitoring/logger";

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

    let connectId = "connect-1";
    const { result, rerender } = renderHook(() => useEscrowPayment(connectId));

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(getEscrowStatus).toHaveBeenCalledTimes(1);

    connectId = "connect-2";
    rerender();

    await waitFor(() => {
      expect(result.current.fetching).toBe(false);
    });

    expect(getEscrowStatus).toHaveBeenCalledTimes(2);
    expect(getEscrowStatus).toHaveBeenLastCalledWith("connect-2");
  });

  describe("shared wallet slice", () => {
    it("syncs the fetched balance into the wallet slice", async () => {
      getEscrowStatus.mockResolvedValue({ wallet: { balance: 500 } });

      const { result, store } = renderHook(() => useEscrowPayment("connect-123"));

      await waitFor(() => {
        expect(result.current.fetching).toBe(false);
      });

      expect(store.getState().wallet.balance).toBe(500);
      expect(store.getState().wallet.loadedOnce).toBe(true);
      // the escrow-status response only carries the balance — escrow is left alone
      expect(store.getState().wallet.escrow).toBe(0);
    });

    it("returns a balance another screen already loaded, without waiting for the status call", () => {
      getEscrowStatus.mockReturnValue(new Promise(() => {})); // never resolves
      const store = makeTestStore();
      store.dispatch(walletSynced({ balance: 320 }));

      const { result } = renderHook(() => useEscrowPayment("connect-123"), store);

      expect(result.current.fetching).toBe(true);
      expect(result.current.walletBalance).toBe(320);
    });

    it("keeps walletBalance null when the status response has no numeric balance", async () => {
      getEscrowStatus.mockResolvedValue({ wallet: { balance: "500" } });

      const { result, store } = renderHook(() => useEscrowPayment("connect-123"));

      await waitFor(() => {
        expect(result.current.fetching).toBe(false);
      });

      expect(result.current.walletBalance).toBe(null);
      expect(store.getState().wallet.loadedOnce).toBe(false);
    });

    it("reflects a balance that changes elsewhere (e.g. after another payment)", async () => {
      getEscrowStatus.mockResolvedValue({ wallet: { balance: 500 } });

      const { result, store } = renderHook(() => useEscrowPayment("connect-123"));
      await waitFor(() => {
        expect(result.current.walletBalance).toBe(500);
      });

      act(() => {
        store.dispatch(walletSynced({ balance: 380 }));
      });

      expect(result.current.walletBalance).toBe(380);
    });
  });
});
