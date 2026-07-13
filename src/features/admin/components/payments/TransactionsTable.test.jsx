import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import TransactionsTable from "./TransactionsTable";
import { formatDecimal } from "@lib/formatters/number";

// Mock external subcomponents using path aliases
vi.mock("@features/admin/components/payments/Avatar", () => ({
  default: ({ name }) => <span data-testid="mock-avatar">{name}</span>,
}));

vi.mock("@features/admin/components/payments/TypeBadge", () => ({
  default: ({ type }) => <span data-testid="mock-type-badge">{type}</span>,
}));

vi.mock("@features/admin/components/payments/TxStatusBadge", () => ({
  default: ({ status }) => (
    <span data-testid="mock-status-badge">{status}</span>
  ),
}));

// Mock absolute configuration constants
vi.mock("@features/admin/constants/payments.constants", () => ({
  FONT: "sans-serif",
  MONO: "monospace",
  SKELETON_ROW_IDS: ["s1", "s2"],
  SKELETON_COL_IDS: ["c1", "c2", "c3"],
  SKELETON_COL_WIDTHS: ["50px", "100px", "80px"],
  TYPE_FILTERS: [
    { key: "all", label: "All Transactions" },
    { key: "payout", label: "Payouts Only" },
  ],
  TABLE_COLUMNS: [
    "ID",
    "User Details",
    "Value",
    "Classification",
    "Timestamp",
    "State",
  ],
}));

// Mock standalone data utility methods
vi.mock("@lib/formatters/number", () => ({
  formatDecimal: vi.fn((val) => `${val}.00 USD`),
}));

describe("TransactionsTable", () => {
  let defaultProps;

  beforeEach(() => {
    vi.clearAllMocks();

    defaultProps = {
      transactions: [
        {
          id: "tx-101",
          txId: "TXID-9988",
          user: { name: "Alex Morgan", email: "alex@leapmentor.app" },
          amount: 250,
          type: "escrow",
          date: "2026-07-12",
          status: "completed",
        },
      ],
      loading: false,
      pagination: {
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      },
      search: "",
      typeFilter: "all",
      onSearchChange: vi.fn(),
      onTypeFilterChange: vi.fn(),
      onPageChange: vi.fn(),
    };
  });

  it("should render the layout, headings, and data table populated with transactions", () => {
    render(<TransactionsTable {...defaultProps} />);

    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("1 total transactions")).toBeInTheDocument();
    expect(screen.getByText("TXID-9988")).toBeInTheDocument();

    // Verifies both layout occurrences of the username render successfully
    expect(screen.getAllByText("Alex Morgan").length).toBe(2);

    expect(screen.getByText("alex@leapmentor.app")).toBeInTheDocument();
    expect(screen.getByText("250.00 USD")).toBeInTheDocument();
    expect(formatDecimal).toHaveBeenCalledWith(250);
  });

  it("should render skeleton placeholder loading blocks when loading is set to true", () => {
    defaultProps.loading = true;
    const { container } = render(<TransactionsTable {...defaultProps} />);

    // Verify presence of structural pulse classes
    const skeletonElements = container.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
    expect(screen.queryByText("TXID-9988")).not.toBeInTheDocument();
  });

  it("should render fallback text statement when transactions dataset array is empty", () => {
    defaultProps.transactions = [];
    defaultProps.pagination.totalCount = 0;

    render(<TransactionsTable {...defaultProps} />);

    expect(screen.getByText("No transactions found.")).toBeInTheDocument();
  });

  it("should render an empty string when transaction amount field evaluates to null", () => {
    defaultProps.transactions = [
      {
        id: "tx-102",
        txId: "TXID-0000",
        user: { name: "John Doe", email: "john@leapmentor.app" },
        amount: null,
        type: "refund",
        date: "2026-07-12",
        status: "refunded",
      },
    ];

    render(<TransactionsTable {...defaultProps} />);

    expect(screen.getByText("TXID-0000")).toBeInTheDocument();
    expect(formatDecimal).not.toHaveBeenCalled();
  });

  it("should invoke search callbacks and adjust dynamic input border colors on focus and blur events", () => {
    render(<TransactionsTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search user...");

    // Test interactive input update cycle
    fireEvent.change(searchInput, { target: { value: "Alex" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("Alex");

    // Test inline focus style updates
    fireEvent.focus(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(147, 197, 253)"); // #93c5fd

    // Test inline blur fallback updates
    fireEvent.blur(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(226, 232, 240)"); // #e2e8f0
  });

  it("should trigger type filter modification callback methods upon clicking filter buttons", () => {
    render(<TransactionsTable {...defaultProps} />);

    const filterButton = screen.getByRole("button", { name: "Payouts Only" });
    fireEvent.click(filterButton);

    expect(defaultProps.onTypeFilterChange).toHaveBeenCalledWith("payout");
  });

  it("should apply customized highlighted inline styling layout for active type filter keys", () => {
    defaultProps.typeFilter = "payout";
    render(<TransactionsTable {...defaultProps} />);

    const activeFilter = screen.getByRole("button", { name: "Payouts Only" });
    const inactiveFilter = screen.getByRole("button", {
      name: "All Transactions",
    });

    expect(activeFilter.style.color).toBe("white");
    expect(inactiveFilter.style.color).toBe("rgb(71, 85, 105)"); // #475569
  });

  it("should modify table row inline backgrounds safely upon mouse hover transitions", () => {
    render(<TransactionsTable {...defaultProps} />);

    const tableRow = screen.getByText("TXID-9988").closest("tr");

    fireEvent.mouseEnter(tableRow);
    expect(tableRow.style.background).toBe("rgb(250, 251, 252)"); // #fafbfc

    fireEvent.mouseLeave(tableRow);
    expect(tableRow.style.background).toBe("transparent");
  });

  it("should process navigation commands and toggle disabled status states on boundary thresholds", () => {
    defaultProps.pagination = {
      totalCount: 30,
      currentPage: 2,
      totalPages: 3,
    };

    render(<TransactionsTable {...defaultProps} />);

    const prevButton = screen.getByRole("button", { name: "‹" });
    const nextButton = screen.getByRole("button", { name: "›" });

    // Ensure buttons are active when within bounds
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(prevButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(nextButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it("should restrict navigation actions when pagination rests exactly on boundary indexes", () => {
    defaultProps.pagination = {
      totalCount: 10,
      currentPage: 1,
      totalPages: 1,
    };

    render(<TransactionsTable {...defaultProps} />);

    const prevButton = screen.getByRole("button", { name: "‹" });
    const nextButton = screen.getByRole("button", { name: "›" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("should generate clipped pagination item series up to maximum ceiling allowance constraint", () => {
    defaultProps.pagination = {
      totalCount: 100,
      currentPage: 3,
      totalPages: 10, // Exceeds the Math.min(totalPages, 5) threshold limit
    };

    render(<TransactionsTable {...defaultProps} />);

    // Verify rendering limits display exactly 5 absolute number keys
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "6" })).not.toBeInTheDocument();

    const middlePageButton = screen.getByRole("button", { name: "4" });
    fireEvent.click(middlePageButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });
});
