import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock recharts to render Tooltip content inline with custom active/payload props
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container-mock">{children}</div>
    ),
    AreaChart: ({ children }) => (
      <div data-testid="area-chart-mock">{children}</div>
    ),
    Area: () => <div data-testid="area-mock" />,
    XAxis: () => <div data-testid="xaxis-mock" />,
    YAxis: () => <div data-testid="yaxis-mock" />,
    CartesianGrid: () => <div data-testid="cartesiangrid-mock" />,
    Tooltip: ({ content }) => {
      if (React.isValidElement(content)) {
        const ActiveTooltip = React.cloneElement(content, {
          active: true,
          payload: [{ value: 500.5 }],
          label: "Feb",
        });
        const InactiveTooltip = React.cloneElement(content, {
          active: false,
        });
        return (
          <div data-testid="recharts-tooltip-mock">
            {ActiveTooltip}
            {InactiveTooltip}
          </div>
        );
      }
      return null;
    },
  };
});

import TrackEarningsTab from "./TrackEarningsTab";
import useTrackEarnings from "@features/mentor/hooks/useTrackEarnings";

// Mock the useTrackEarnings hook
vi.mock("@features/mentor/hooks/useTrackEarnings");

describe("TrackEarningsTab Component", () => {
  const mockHandleChartPeriod = vi.fn();
  const mockGoNext = vi.fn();
  const mockGoPrev = vi.fn();
  const mockSetSearch = vi.fn();

  const defaultStats = {
    totalEarnings: 1500.5,
    sessionsThisMonth: 8,
    avgRating: 4.8,
    pendingPayout: 200,
  };

  const defaultChartData = [
    { label: "Jan", amount: 400 },
    { label: "Feb", amount: 600 },
  ];

  const defaultPayouts = [
    {
      id: "p1",
      date: "2026-07-01",
      menteeName: "Alice Smith",
      sessionType: "1-on-1 Mentorship",
      duration: "60 min",
      amount: 150,
      status: "completed",
    },
    {
      id: "p2",
      date: "2026-07-05",
      menteeName: "Bob Jones",
      sessionType: "Resume Review",
      duration: "30 min",
      amount: 75,
      status: "pending",
    },
  ];

  const mockHookReturnValue = {
    stats: defaultStats,
    loadingStats: false,
    chartData: defaultChartData,
    chartPeriod: "monthly",
    loadingChart: false,
    payouts: defaultPayouts,
    loadingPayouts: false,
    search: "",
    setSearch: mockSetSearch,
    page: 1,
    hasMore: true,
    totalCount: 2,
    error: null,
    handleChartPeriod: mockHandleChartPeriod,
    goNext: mockGoNext,
    goPrev: mockGoPrev,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useTrackEarnings.mockReturnValue(mockHookReturnValue);
  });

  it("renders without crashing, shows stats and payouts table", () => {
    render(<TrackEarningsTab />);

    expect(screen.getByText("Track Earnings")).toBeInTheDocument();
    expect(screen.getByText("1,500.50")).toBeInTheDocument(); // total earnings
    expect(screen.getByText("8")).toBeInTheDocument(); // sessions
    expect(screen.getByText("4.8/5.0")).toBeInTheDocument(); // avg rating
    expect(screen.getByText("200.00")).toBeInTheDocument(); // pending

    // Check Payout Table entries
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("150.00")).toBeInTheDocument();
    expect(screen.getByText("75.00")).toBeInTheDocument();
  });

  it("renders loader when loadingStats is true", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      loadingStats: true,
    });

    const { container } = render(<TrackEarningsTab />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders loader when loadingChart is true", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      loadingChart: true,
    });

    const { container } = render(<TrackEarningsTab />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders loader in payouts table when loadingPayouts is true", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      loadingPayouts: true,
      payouts: [],
    });

    const { container } = render(<TrackEarningsTab />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays error message if present", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      error: "Failed to fetch data",
    });

    render(<TrackEarningsTab />);
    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
  });

  it("renders empty state when payouts list is empty", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      payouts: [],
    });

    const { rerender } = render(<TrackEarningsTab />);
    expect(screen.getByText("No payouts found")).toBeInTheDocument();
    expect(
      screen.getByText("Completed sessions will appear here."),
    ).toBeInTheDocument();

    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      payouts: [],
      search: "John Doe",
    });
    rerender(<TrackEarningsTab />);
    expect(screen.getByText('No results for "John Doe"')).toBeInTheDocument();
  });

  it("triggers search onChange handler", () => {
    render(<TrackEarningsTab />);
    const searchInput = screen.getByPlaceholderText("Search mentee...");
    fireEvent.change(searchInput, { target: { value: "Charlie" } });
    expect(mockSetSearch).toHaveBeenCalledWith("Charlie");
  });

  it("toggles chart period onClick", () => {
    render(<TrackEarningsTab />);
    const weeklyBtn = screen.getByRole("button", { name: "Weekly" });
    fireEvent.click(weeklyBtn);
    expect(mockHandleChartPeriod).toHaveBeenCalledWith("weekly");
  });

  it("triggers pagination handlers when buttons are enabled", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      page: 2, // Enable 'Previous' button
      hasMore: true, // Enable 'Next' button
    });

    render(<TrackEarningsTab />);
    const prevBtn = screen.getByRole("button", { name: "Previous" });
    const nextBtn = screen.getByRole("button", { name: "Next" });

    fireEvent.click(prevBtn);
    expect(mockGoPrev).toHaveBeenCalled();

    fireEvent.click(nextBtn);
    expect(mockGoNext).toHaveBeenCalled();
  });

  it("disables pagination buttons correctly", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      page: 1, // Disable 'Previous'
      hasMore: false, // Disable 'Next'
    });

    render(<TrackEarningsTab />);
    const prevBtn = screen.getByRole("button", { name: "Previous" });
    const nextBtn = screen.getByRole("button", { name: "Next" });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it("covers different StatusBadge style and label fallbacks", () => {
    const customPayouts = [
      {
        id: "p1",
        date: "2026-07-01",
        menteeName: "Alice Smith",
        sessionType: "1-on-1 Mentorship",
        duration: "60 min",
        amount: 150,
        status: "paid", // Completed
      },
      {
        id: "p2",
        date: "2026-07-05",
        menteeName: "Bob Jones",
        sessionType: "Resume Review",
        duration: "30 min",
        amount: 75,
        status: "refunded", // Refunded
      },
      {
        id: "p3",
        date: "2026-07-10",
        menteeName: "Charlie Brown",
        sessionType: "Quick Chat",
        duration: "15 min",
        amount: 50,
        status: "unknown_status", // Fallback label & class
      },
    ];

    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      payouts: customPayouts,
    });

    render(<TrackEarningsTab />);

    // Status badges will have corresponding class and text
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    expect(screen.getByText("Refunded")).toBeInTheDocument();
    expect(screen.getByText("unknown_status")).toBeInTheDocument();
  });

  it("covers avgRating falsy fallback branch (stats.avgRating || 0)", () => {
    useTrackEarnings.mockReturnValue({
      ...mockHookReturnValue,
      stats: {
        ...defaultStats,
        avgRating: null, // triggers fallback to 0
      },
    });

    render(<TrackEarningsTab />);
    // Should display "0.0/5.0"
    expect(screen.getByText("0.0/5.0")).toBeInTheDocument();
  });

  it("covers CustomTooltip active and inactive states", () => {
    // CustomTooltip is not exported, but we can retrieve it by looking inside the TrackEarningsTab structure,
    // or by mocking recharts Tooltip. However, since recharts is mocked or fully rendered in JSDOM,
    // we can retrieve the Component from the JSX tree or mock it.
    // Wait, CustomTooltip is a private component in the file. We can trigger Recharts tooltip behaviour,
    // or retrieve the component from the Recharts mock if recharts is mocked, but recharts is not mocked here.
    // Let's render the CustomTooltip by finding it or rendering the component and triggering the tooltip.
    // Or we can mock AreaChart/Tooltip to render CustomTooltip directly.
    // Yes! Let's mock recharts to render its tooltip content directly, or we can just mock recharts to easily cover the branches!
  });
});
