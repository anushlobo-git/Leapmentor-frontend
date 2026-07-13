/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useTrackEarnings from "./useTrackEarnings";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";
import {
  mapEarningsSummary,
  mapChartPoint,
  mapPayoutsResponse,
} from "@features/mentor/mappers/earningsMapper";

// Mock dependencies
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@features/mentor/mappers/earningsMapper", () => ({
  mapEarningsSummary: vi.fn((data) => ({
    totalEarnings: data?.totalEarnings || 0,
    sessionsThisMonth: data?.sessionsThisMonth || 0,
    avgRating: data?.avgRating || 0,
    pendingPayout: data?.pendingPayout || 0,
    walletBalance: data?.walletBalance || 0,
  })),
  mapChartPoint: vi.fn((point) => point),
  mapPayoutsResponse: vi.fn((data) => ({
    payouts: data?.payouts || [],
    pagination: {
      hasMore: data?.pagination?.hasMore || false,
      totalCount: data?.pagination?.totalCount || 0,
    },
  })),
}));

describe("useTrackEarnings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useTrackEarnings());

      expect(result.current.stats).toEqual({
        totalEarnings: 0,
        sessionsThisMonth: 0,
        avgRating: 0,
        pendingPayout: 0,
        walletBalance: 0,
      });
      expect(result.current.loadingStats).toBe(true);
      expect(result.current.chartData).toEqual([]);
      expect(result.current.chartPeriod).toBe("monthly");
      expect(result.current.loadingChart).toBe(true);
      expect(result.current.payouts).toEqual([]);
      expect(result.current.loadingPayouts).toBe(true);
      expect(result.current.search).toBe("");
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.showWithdraw).toBe(false);
      expect(result.current.withdrawing).toBe(false);
      expect(result.current.withdrawMsg).toEqual({ type: "", text: "" });
      expect(result.current.error).toBe("");
    });
  });

  describe("fetch on mount", () => {
    it("should fetch stats, chart, and payouts on mount", async () => {
      const mockStats = {
        totalEarnings: 1000,
        sessionsThisMonth: 5,
        avgRating: 4.5,
        pendingPayout: 200,
        walletBalance: 800,
      };
      const mockChartData = [{ date: "2024-01", value: 100 }];
      const mockPayouts = {
        payouts: [{ id: "p1", amount: 100 }],
        pagination: { hasMore: true, totalCount: 1 },
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: mockStats })
        .mockResolvedValueOnce({ data: { data: mockChartData } })
        .mockResolvedValueOnce({ data: mockPayouts });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
        expect(result.current.loadingChart).toBe(false);
        expect(result.current.loadingPayouts).toBe(false);
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor/earnings");
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/mentor/earnings/chart?period=monthly",
      );
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/mentor/earnings/payouts?page=1&limit=10",
      );
      expect(mapEarningsSummary).toHaveBeenCalledWith(mockStats);
      expect(result.current.chartData).toEqual(mockChartData);
      expect(result.current.payouts).toEqual(mockPayouts.payouts);
    });

    it("should handle empty chart data", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: null } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingChart).toBe(false);
      });

      expect(result.current.chartData).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      axiosInstance.get
        .mockRejectedValueOnce(new Error("Stats error"))
        .mockRejectedValueOnce(new Error("Chart error"))
        .mockRejectedValueOnce(new Error("Payouts error"));

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
        expect(result.current.loadingChart).toBe(false);
        expect(result.current.loadingPayouts).toBe(false);
      });

      expect(result.current.error).toBe("Stats error");
      expect(logger.error).toHaveBeenCalledWith("Chart fetch error:", {
        error: "Chart error",
      });
      expect(logger.error).toHaveBeenCalledWith("Payouts fetch error:", {
        error: "Payouts error",
      });
    });
  });

  describe("handleChartPeriod", () => {
    it("should change chart period and fetch new data", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } })
        .mockResolvedValueOnce({ data: { data: [] } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingChart).toBe(false);
      });

      act(() => {
        result.current.handleChartPeriod("weekly");
      });

      expect(result.current.chartPeriod).toBe("weekly");
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "/mentor/earnings/chart?period=weekly",
      );
    });
  });

  describe("search", () => {
    it("should update search and trigger debounced fetch", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      act(() => {
        result.current.setSearch("test");
      });

      expect(result.current.search).toBe("test");

      await new Promise((resolve) => setTimeout(resolve, 350));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/mentor/earnings/payouts?page=1&limit=10&search=test",
        );
      });
    });

    it("should debounce search input", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      act(() => {
        result.current.setSearch("t");
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.setSearch("te");
      });
      await new Promise((resolve) => setTimeout(resolve, 100));

      act(() => {
        result.current.setSearch("test");
      });
      await new Promise((resolve) => setTimeout(resolve, 350));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(4); // initial + final search
      });
    });
  });

  describe("pagination", () => {
    it("should load more payouts", async () => {
      const mockPayouts1 = {
        payouts: [{ id: "p1" }],
        pagination: { hasMore: true, totalCount: 2 },
      };
      const mockPayouts2 = {
        payouts: [{ id: "p2" }],
        pagination: { hasMore: false, totalCount: 2 },
      };

      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: mockPayouts1 })
        .mockResolvedValueOnce({ data: mockPayouts2 });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      await act(async () => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
        expect(result.current.payouts).toHaveLength(2);
      });
    });

    it("should go to next page", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      act(() => {
        result.current.goNext();
      });

      expect(result.current.page).toBe(2);
    });

    it("should go to previous page", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      act(() => {
        result.current.setPage(3);
      });

      await act(async () => {
        result.current.goPrev();
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });
    });

    it("should not go below page 1", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingPayouts).toBe(false);
      });

      act(() => {
        result.current.goPrev();
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe("handleWithdraw", () => {
    it("should withdraw successfully", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      axiosInstance.post.mockResolvedValue({
        data: { message: "Withdrawal successful" },
      });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
      });

      act(() => {
        result.current.setShowWithdraw(true);
      });

      await act(async () => {
        await result.current.handleWithdraw();
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/mentor/earnings/withdraw",
        {},
      );
      expect(result.current.withdrawMsg).toEqual({
        type: "success",
        text: "Withdrawal successful",
      });
      expect(result.current.stats.walletBalance).toBe(0);

      await new Promise((resolve) => setTimeout(resolve, 1550));

      await waitFor(() => {
        expect(result.current.showWithdraw).toBe(false);
      });
      expect(result.current.withdrawMsg).toEqual({ type: "", text: "" });
    });

    it("should handle withdraw error", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Insufficient balance" } },
      });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
      });

      act(() => {
        result.current.setShowWithdraw(true);
      });

      await act(async () => {
        await result.current.handleWithdraw();
      });

      expect(result.current.withdrawMsg).toEqual({
        type: "error",
        text: "Insufficient balance",
      });
      expect(result.current.withdrawing).toBe(false);
    });

    it("should handle withdraw error with no response message", async () => {
      axiosInstance.get
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      axiosInstance.post.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
      });

      act(() => {
        result.current.setShowWithdraw(true);
      });

      await act(async () => {
        await result.current.handleWithdraw();
      });

      expect(result.current.withdrawMsg).toEqual({
        type: "error",
        text: "Withdrawal failed.",
      });
    });
  });

  describe("fetchStats", () => {
    it("should manually fetch stats", async () => {
      const mockStats = { totalEarnings: 2000 };
      axiosInstance.get.mockResolvedValue({ data: mockStats });

      const { result } = renderHook(() => useTrackEarnings());

      await act(async () => {
        await result.current.fetchStats();
      });

      expect(axiosInstance.get).toHaveBeenCalledWith("/mentor/earnings");
      expect(mapEarningsSummary).toHaveBeenCalledWith(mockStats);
    });
  });

  describe("state setters", () => {
    it("should update search", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setSearch("new search");
      });

      expect(result.current.search).toBe("new search");
    });

    it("should update showWithdraw", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setShowWithdraw(true);
      });

      expect(result.current.showWithdraw).toBe(true);
    });

    it("should update page", async () => {
      axiosInstance.get.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });
  });
});
