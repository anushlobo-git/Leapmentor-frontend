import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePaymentsData } from "./usePaymentsData";
import {
  getPaymentStats,
  getPaymentChart,
  getPaymentTransactions,
} from "@features/admin/api/admin.api";

// Mock external API module using path aliases
vi.mock("@features/admin/api/admin.api", () => ({
  getPaymentStats: vi.fn(),
  getPaymentChart: vi.fn(),
  getPaymentTransactions: vi.fn(),
}));

describe("usePaymentsData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default states and fetch data successfully on mount (Happy Path)", async () => {
    const mockStats = { revenue: 5000 };
    const mockChart = [{ date: "2026-01-01", value: 100 }];
    const mockTransactions = [{ id: 1, amount: 50 }];
    const mockPagination = { totalCount: 1, currentPage: 1, totalPages: 1 };

    getPaymentStats.mockResolvedValueOnce({ data: { data: mockStats } });
    getPaymentChart.mockResolvedValueOnce({ data: { data: mockChart } });
    getPaymentTransactions.mockResolvedValueOnce({
      data: { transactions: mockTransactions, pagination: mockPagination },
    });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    expect(hookResult.current.stats).toEqual(mockStats);
    expect(hookResult.current.chartData).toEqual(mockChart);
    expect(hookResult.current.transactions).toEqual(mockTransactions);
    expect(hookResult.current.pagination).toEqual(mockPagination);
    expect(hookResult.current.loading).toBe(false);
    expect(hookResult.current.loadingChart).toBe(false);
    expect(hookResult.current.toast).toBeNull();
  });

  it("should evaluate logical OR fallback assignments for alternate API data structures", async () => {
    getPaymentStats.mockResolvedValueOnce({ data: { grossRevenue: 2000 } });
    getPaymentChart.mockResolvedValueOnce({ data: { data: null } });
    getPaymentTransactions.mockResolvedValueOnce({
      data: { transactions: null, pagination: { totalCount: 0 } },
    });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    expect(hookResult.current.stats).toEqual({ grossRevenue: 2000 });
    expect(hookResult.current.chartData).toEqual([]);
    expect(hookResult.current.transactions).toEqual([]);
  });

  it("should execute fallback to empty object when response structure is completely empty", async () => {
    // Providing a falsy primitive string avoids property access runtime crashes while targeting the || {} branch
    getPaymentStats.mockResolvedValueOnce({ data: "" });
    getPaymentChart.mockResolvedValueOnce({ data: {} });
    getPaymentTransactions.mockResolvedValueOnce({ data: {} });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    expect(hookResult.current.stats).toEqual({});
  });

  it("should handle API failure triggers and manage automatic toast alert clearance", async () => {
    getPaymentStats.mockRejectedValueOnce(new Error("Stats Failure"));
    getPaymentChart.mockRejectedValueOnce(new Error("Chart Failure"));
    getPaymentTransactions.mockRejectedValueOnce(
      new Error("Transactions Failure"),
    );

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    expect(hookResult.current.toast).toEqual({
      msg: "Failed to load transactions.",
      type: "error",
    });

    await act(async () => {
      vi.advanceTimersByTime(3500);
    });

    expect(hookResult.current.toast).toBeNull();
  });

  it("should handle debounced search input text values and prevent redundant API executions", async () => {
    getPaymentStats.mockResolvedValueOnce({ data: {} });
    getPaymentChart.mockResolvedValueOnce({ data: {} });
    getPaymentTransactions.mockResolvedValueOnce({ data: {} });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    vi.clearAllMocks();

    act(() => {
      hookResult.current.handleSearch("Leapmentor");
    });

    expect(hookResult.current.search).toBe("Leapmentor");
    expect(getPaymentTransactions).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(getPaymentTransactions).not.toHaveBeenCalled();

    act(() => {
      hookResult.current.handleSearch("Leapmentor platform");
    });

    // Await the timer advancement to catch underlying asynchronous execution chains completely
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(getPaymentTransactions).toHaveBeenCalledTimes(1);
    expect(getPaymentTransactions).toHaveBeenCalledWith({
      page: 1,
      limit: 15,
      search: "Leapmentor platform",
    });
  });

  it("should process structural parameter filter update operations immediately", async () => {
    getPaymentStats.mockResolvedValueOnce({ data: {} });
    getPaymentChart.mockResolvedValueOnce({ data: {} });
    getPaymentTransactions.mockResolvedValueOnce({ data: {} });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    vi.clearAllMocks();

    await act(async () => {
      hookResult.current.handleTypeFilter("payout");
    });

    expect(hookResult.current.typeFilter).toBe("payout");
    expect(getPaymentTransactions).toHaveBeenCalledTimes(1);
    expect(getPaymentTransactions).toHaveBeenCalledWith({
      page: 1,
      limit: 15,
      type: "payout",
    });
  });

  it("should process custom page navigation indexes directly via goToPage invocation methods", async () => {
    getPaymentStats.mockResolvedValueOnce({ data: {} });
    getPaymentChart.mockResolvedValueOnce({ data: {} });
    getPaymentTransactions.mockResolvedValueOnce({ data: {} });

    let hookResult;
    await act(async () => {
      const { result } = renderHook(() => usePaymentsData());
      hookResult = result;
    });

    vi.clearAllMocks();

    await act(async () => {
      hookResult.current.goToPage(4);
    });

    expect(getPaymentTransactions).toHaveBeenCalledTimes(1);
    expect(getPaymentTransactions).toHaveBeenCalledWith({
      page: 4,
      limit: 15,
    });
  });
});
