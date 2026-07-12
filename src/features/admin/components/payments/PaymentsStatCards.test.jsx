import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentsStatCards from "./PaymentsStatCards";

// Mock the presentation StatCard component to isolate testing of prop-mapping logic
vi.mock("@features/admin/components/common/StatCard", () => ({
  default: vi.fn(({ label, value, sub, accent, icon }) => (
    <div
      data-testid="mock-stat-card"
      data-label={label}
      data-value={value !== undefined ? value : "undefined"}
      data-sub={sub || "none"}
      data-accent={accent}
    >
      <span>{label}</span>
      <span>{value}</span>
      <span>{sub}</span>
      <div data-testid="icon-container">{icon}</div>
    </div>
  )),
}));

describe("PaymentsStatCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render four stat cards with their corresponding labels and visual configurations", () => {
    render(<PaymentsStatCards stats={null} />);

    const cards = screen.getAllByTestId("mock-stat-card");
    expect(cards).toHaveLength(4);

    expect(cards[0]).toHaveAttribute("data-label", "Total Revenue");
    expect(cards[1]).toHaveAttribute("data-label", "Platform Commission");
    expect(cards[2]).toHaveAttribute("data-label", "Pending Payouts");
    expect(cards[3]).toHaveAttribute("data-label", "Refunded Requests");
  });

  it("should correctly forward all numerical values from the stats object to the child cards", () => {
    const mockStats = {
      totalRevenue: 5000,
      platformCommission: 750,
      commissionRate: 15,
      pendingPayouts: 1200,
      refundedRequests: 3,
    };

    render(<PaymentsStatCards stats={mockStats} />);

    const cards = screen.getAllByTestId("mock-stat-card");

    expect(cards[0]).toHaveAttribute("data-value", "5000");
    expect(cards[1]).toHaveAttribute("data-value", "750");
    expect(cards[1]).toHaveAttribute("data-sub", "15% rate");
    expect(cards[2]).toHaveAttribute("data-value", "1200");
    expect(cards[2]).toHaveAttribute("data-sub", "Held in escrow");
    expect(cards[3]).toHaveAttribute("data-value", "3");
    expect(cards[3]).toHaveAttribute("data-sub", "Requires Action");
  });

  it("should display a fallback dash for commission rate subtitle when commissionRate is null", () => {
    const mockStats = {
      totalRevenue: 1000,
      platformCommission: 100,
      commissionRate: null,
      pendingPayouts: 0,
      refundedRequests: 0,
    };

    render(<PaymentsStatCards stats={mockStats} />);

    const cards = screen.getAllByTestId("mock-stat-card");
    expect(cards[1]).toHaveAttribute("data-sub", "—");
  });

  it("should display a fallback dash for commission rate subtitle when commissionRate is undefined", () => {
    const mockStats = {
      totalRevenue: 1000,
      platformCommission: 100,
      pendingPayouts: 0,
      refundedRequests: 0,
    };

    render(<PaymentsStatCards stats={mockStats} />);

    const cards = screen.getAllByTestId("mock-stat-card");
    expect(cards[1]).toHaveAttribute("data-sub", "—");
  });

  it("should safely handle a missing or empty stats prop without crashing", () => {
    render(<PaymentsStatCards stats={undefined} />);

    const cards = screen.getAllByTestId("mock-stat-card");
    expect(cards).toHaveLength(4);

    expect(cards[0]).toHaveAttribute("data-value", "undefined");
    expect(cards[1]).toHaveAttribute("data-sub", "—");
  });
});
