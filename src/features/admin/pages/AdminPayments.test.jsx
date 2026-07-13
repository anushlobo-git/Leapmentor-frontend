import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPayments from "./AdminPayments";
import { usePaymentsData } from "@features/admin/hooks/usePaymentsData";

vi.mock("@features/admin/hooks/usePaymentsData", () => ({
  usePaymentsData: vi.fn(),
}));

vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock("@features/admin/components/payments/Toast", () => ({
  default: ({ toast }) =>
    toast ? <div data-testid="toast">{toast.msg}</div> : null,
}));

vi.mock("@features/admin/components/payments/PaymentsStatCards", () => ({
  default: ({ stats }) => (
    <div data-testid="stat-cards">
      {stats ? JSON.stringify(stats) : "no stats"}
    </div>
  ),
}));

vi.mock("@features/admin/components/payments/RevenuePanel", () => ({
  default: ({ chartData, loadingChart }) => (
    <div data-testid="revenue-panel">
      {loadingChart ? "loading chart" : `chart: ${chartData.length} items`}
    </div>
  ),
}));

vi.mock("@features/admin/components/payments/TransactionsTable", () => ({
  default: ({
    transactions,
    loading,
    pagination,
    search,
    typeFilter,
    onSearchChange,
    onTypeFilterChange,
    onPageChange,
  }) => (
    <div data-testid="transactions-table">
      <div>loading: {String(loading)}</div>
      <div>transactions: {transactions.length}</div>
      <div>search: {search}</div>
      <div>typeFilter: {typeFilter}</div>
      <div>page: {pagination.currentPage}</div>
      <button onClick={() => onSearchChange("test")}>Search</button>
      <button onClick={() => onTypeFilterChange("credit")}>Filter</button>
      <button onClick={() => onPageChange(2)}>Next Page</button>
    </div>
  ),
}));

describe("AdminPayments", () => {
  it("should render all payment components with data from usePaymentsData hook", () => {
    usePaymentsData.mockReturnValue({
      stats: { totalRevenue: 50000, totalTransactions: 120 },
      chartData: [{ month: "Jan", revenue: 10000 }],
      transactions: [{ id: "tx1", amount: 500 }],
      pagination: { totalCount: 1, currentPage: 1, totalPages: 1 },
      search: "",
      typeFilter: "",
      loading: false,
      loadingChart: false,
      toast: null,
      handleSearch: vi.fn(),
      handleTypeFilter: vi.fn(),
      goToPage: vi.fn(),
    });

    render(<AdminPayments />);

    expect(screen.getByTestId("admin-layout")).toBeInTheDocument();
    expect(screen.getByText("Payment Tracking")).toBeInTheDocument();
    expect(screen.getByTestId("stat-cards")).toHaveTextContent("totalRevenue");
    expect(screen.getByTestId("revenue-panel")).toHaveTextContent(
      "chart: 1 items",
    );
    expect(screen.getByTestId("transactions-table")).toHaveTextContent(
      "transactions: 1",
    );
  });

  it("should display loading state for chart when loadingChart is true", () => {
    usePaymentsData.mockReturnValue({
      stats: null,
      chartData: [],
      transactions: [],
      pagination: { currentPage: 1 },
      search: "",
      typeFilter: "",
      loading: false,
      loadingChart: true,
      toast: null,
      handleSearch: vi.fn(),
      handleTypeFilter: vi.fn(),
      goToPage: vi.fn(),
    });

    render(<AdminPayments />);

    expect(screen.getByTestId("revenue-panel")).toHaveTextContent(
      "loading chart",
    );
  });

  it("should display toast when toast data is present", () => {
    usePaymentsData.mockReturnValue({
      stats: null,
      chartData: [],
      transactions: [],
      pagination: { currentPage: 1 },
      search: "",
      typeFilter: "",
      loading: false,
      loadingChart: false,
      toast: { msg: "Error loading data", type: "error" },
      handleSearch: vi.fn(),
      handleTypeFilter: vi.fn(),
      goToPage: vi.fn(),
    });

    render(<AdminPayments />);

    expect(screen.getByTestId("toast")).toHaveTextContent("Error loading data");
  });

  it("should pass search and filter handlers to TransactionsTable", () => {
    const handleSearch = vi.fn();
    const handleTypeFilter = vi.fn();
    const goToPage = vi.fn();

    usePaymentsData.mockReturnValue({
      stats: null,
      chartData: [],
      transactions: [],
      pagination: { currentPage: 1 },
      search: "test search",
      typeFilter: "debit",
      loading: false,
      loadingChart: false,
      toast: null,
      handleSearch,
      handleTypeFilter,
      goToPage,
    });

    render(<AdminPayments />);

    expect(screen.getByTestId("transactions-table")).toHaveTextContent(
      "search: test search",
    );
    expect(screen.getByTestId("transactions-table")).toHaveTextContent(
      "typeFilter: debit",
    );
  });

  it("should render page description text", () => {
    usePaymentsData.mockReturnValue({
      stats: null,
      chartData: [],
      transactions: [],
      pagination: { currentPage: 1 },
      search: "",
      typeFilter: "",
      loading: false,
      loadingChart: false,
      toast: null,
      handleSearch: vi.fn(),
      handleTypeFilter: vi.fn(),
      goToPage: vi.fn(),
    });

    render(<AdminPayments />);

    expect(
      screen.getByText(/Monitor platform revenue and financial transactions/i),
    ).toBeInTheDocument();
  });
});

/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
