import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RevenuePanel from "./RevenuePanel";
import RevenueChart from "@features/admin/components/payments/RevenueChart";

// Mock the child RevenueChart component to inspect its received props and isolate testing
vi.mock("@features/admin/components/payments/RevenueChart", () => ({
  default: vi.fn(({ data, loading }) => (
    <div data-testid="revenue-chart" data-loading={loading ? "true" : "false"}>
      Chart items count: {data?.length || 0}
    </div>
  )),
}));

// Mock constants to avoid relying on external file structures
vi.mock("@features/admin/constants/payments.constants", () => ({
  FONT: "sans-serif",
  MONO: "monospace",
}));

describe("RevenuePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render headers, labels, and static layout styling correctly", () => {
    const mockChartData = [
      { amount: 500, label: "Jan" },
      { amount: 700, label: "Feb" },
    ];

    render(<RevenuePanel chartData={mockChartData} loadingChart={false} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Revenue Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Growth trajectory")).toBeInTheDocument();
    expect(screen.getByText("Net Revenue")).toBeInTheDocument();
    expect(screen.getByText("Last 6 Months")).toBeInTheDocument();
  });

  it("should forward chartData and false loading state parameters to the chart component", () => {
    const mockChartData = [
      { amount: 1000, label: "Mar" },
      { amount: 1200, label: "Apr" },
    ];

    render(<RevenuePanel chartData={mockChartData} loadingChart={false} />);

    const chartElement = screen.getByTestId("revenue-chart");
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveAttribute("data-loading", "false");
    expect(screen.getByText("Chart items count: 2")).toBeInTheDocument();

    // Directly verify the props object passed down to RevenueChart
    expect(vi.mocked(RevenueChart).mock.calls[0][0]).toMatchObject({
      data: mockChartData,
      loading: false,
    });
  });

  it("should pass true loading status parameter down to the chart component when chart is loading", () => {
    render(<RevenuePanel chartData={[]} loadingChart={true} />);

    const chartElement = screen.getByTestId("revenue-chart");
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveAttribute("data-loading", "true");
    expect(screen.getByText("Chart items count: 0")).toBeInTheDocument();

    // Directly verify the props object passed down to RevenueChart
    expect(vi.mocked(RevenueChart).mock.calls[0][0]).toMatchObject({
      data: [],
      loading: true,
    });
  });
});
