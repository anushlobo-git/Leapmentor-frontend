/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useTrackEarnings from "./useTrackEarnings";
import {
  getMentorEarnings,
  getMentorEarningsChart,
  getMentorEarningsPayouts,
  withdrawMentorEarnings,
} from "@features/mentor/models/mentor.api";
import logger from "@lib/monitoring/logger";
import {
  mapEarningsSummary,
  mapChartPoint,
  mapPayoutsResponse,
} from "@features/mentor/models/earningsMapper";

// Mock dependencies
vi.mock("@features/mentor/models/mentor.api", () => ({
  getMentorEarnings: vi.fn(),
  getMentorEarningsChart: vi.fn(),
  getMentorEarningsPayouts: vi.fn(),
  withdrawMentorEarnings: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@features/mentor/models/earningsMapper", () => ({
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

      getMentorEarnings.mockResolvedValueOnce({ data: mockStats });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: mockChartData } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: mockPayouts });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingStats).toBe(false);
        expect(result.current.loadingChart).toBe(false);
        expect(result.current.loadingPayouts).toBe(false);
      });

      expect(getMentorEarnings).toHaveBeenCalledWith();
      expect(getMentorEarningsChart).toHaveBeenCalledWith("monthly");
      expect(getMentorEarningsPayouts).toHaveBeenCalledWith("page=1&limit=10");
      expect(mapEarningsSummary).toHaveBeenCalledWith(mockStats);
      expect(result.current.chartData).toEqual(mockChartData);
      expect(result.current.payouts).toEqual(mockPayouts.payouts);
    });

    it("should handle empty chart data", async () => {
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: null } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingChart).toBe(false);
      });

      expect(result.current.chartData).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      getMentorEarnings.mockRejectedValueOnce(new Error("Stats error"));
      getMentorEarningsChart.mockRejectedValueOnce(new Error("Chart error"));
      getMentorEarningsPayouts.mockRejectedValueOnce(new Error("Payouts error"));

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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

      const { result } = renderHook(() => useTrackEarnings());

      await waitFor(() => {
        expect(result.current.loadingChart).toBe(false);
      });

      act(() => {
        result.current.handleChartPeriod("weekly");
      });

      expect(result.current.chartPeriod).toBe("weekly");
      expect(getMentorEarningsChart).toHaveBeenCalledWith("weekly");
    });
  });

  describe("search", () => {
    it("should update search and trigger debounced fetch", async () => {
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts
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
        expect(getMentorEarningsPayouts).toHaveBeenCalledWith(
          "page=1&limit=10&search=test",
        );
      });
    });

    it("should debounce search input", async () => {
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts
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
        // initial mount call (1) + final debounced search call (1)
        expect(getMentorEarningsPayouts).toHaveBeenCalledTimes(2);
      });
      expect(getMentorEarnings).toHaveBeenCalledTimes(1);
      expect(getMentorEarningsChart).toHaveBeenCalledTimes(1);
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

      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts
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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts
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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts
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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });

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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      withdrawMentorEarnings.mockResolvedValue({
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

      expect(withdrawMentorEarnings).toHaveBeenCalledWith();
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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      withdrawMentorEarnings.mockRejectedValue({
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
      getMentorEarnings.mockResolvedValueOnce({ data: {} });
      getMentorEarningsChart.mockResolvedValueOnce({ data: { data: [] } });
      getMentorEarningsPayouts.mockResolvedValueOnce({ data: { payouts: [], pagination: {} } });
      withdrawMentorEarnings.mockRejectedValue(new Error("Network error"));

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
      // Blanket default across all three GET-style endpoints, mirroring the
      // original single shared getter default for this test.
      getMentorEarnings.mockResolvedValue({ data: mockStats });
      getMentorEarningsChart.mockResolvedValue({ data: mockStats });
      getMentorEarningsPayouts.mockResolvedValue({ data: mockStats });

      const { result } = renderHook(() => useTrackEarnings());

      await act(async () => {
        await result.current.fetchStats();
      });

      expect(getMentorEarnings).toHaveBeenCalledWith();
      expect(mapEarningsSummary).toHaveBeenCalledWith(mockStats);
    });
  });

  describe("state setters", () => {
    it("should update search", async () => {
      getMentorEarnings.mockResolvedValue({ data: {} });
      getMentorEarningsChart.mockResolvedValue({ data: {} });
      getMentorEarningsPayouts.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setSearch("new search");
      });

      expect(result.current.search).toBe("new search");
    });

    it("should update showWithdraw", async () => {
      getMentorEarnings.mockResolvedValue({ data: {} });
      getMentorEarningsChart.mockResolvedValue({ data: {} });
      getMentorEarningsPayouts.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setShowWithdraw(true);
      });

      expect(result.current.showWithdraw).toBe(true);
    });

    it("should update page", async () => {
      getMentorEarnings.mockResolvedValue({ data: {} });
      getMentorEarningsChart.mockResolvedValue({ data: {} });
      getMentorEarningsPayouts.mockResolvedValue({ data: {} });

      const { result } = renderHook(() => useTrackEarnings());

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });
  });
});
