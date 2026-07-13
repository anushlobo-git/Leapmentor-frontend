import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConnectsLayout from "./ConnectsLayout";

// ── 1. Mock External Components ───────────────────────────────────────────
vi.mock("@components/common/Loader", () => ({
  default: ({ minHeight }) => (
    <div data-testid="mock-loader">Loading with height {minHeight}</div>
  ),
}));

describe("ConnectsLayout", () => {
  const mockEmptyState = {
    message: "No connections found",
    subMessage: "Start searching for matching mentors to get rolling.",
    actionLabel: "Find Mentors",
    onAction: vi.fn(),
  };

  const defaultProps = {
    title: "My Connections",
    subtitle: "Track your engagements here",
    count: 0,
    loading: false,
    error: null,
    emptyState: mockEmptyState,
    children: <div data-testid="active-child">Active Card Content</div>,
    completedChildren: (
      <div data-testid="completed-child">Completed Card Content</div>
    ),
    completedCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Main Layout Render & Status Matrix ──────────────────────────────────
  it("should render header text strings and hide badges when list is loading", () => {
    render(<ConnectsLayout {...defaultProps} loading={true} count={5} />);

    expect(
      screen.getByRole("heading", { name: "My Connections" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Track your engagements here")).toBeInTheDocument();
    expect(screen.getByTestId("mock-loader")).toBeInTheDocument();

    // Explicitly check that the active session counter string pattern isn't present
    expect(screen.queryByText(/Active Session/i)).not.toBeInTheDocument();
  });

  it("should render singular badge terminology when active count matches 1", () => {
    const { container } = render(
      <ConnectsLayout {...defaultProps} count={1} />,
    );

    const activeBadge = screen.getByText(/1 Active Session/i);
    expect(activeBadge).toBeInTheDocument();

    // Safely verify presence of pulsed circle child element within the DOM tree
    const pulseDot = container.querySelector(".animate-pulse");
    expect(pulseDot).toBeInTheDocument();
  });

  it("should render plural badge terminology when active count exceeds 1", () => {
    render(<ConnectsLayout {...defaultProps} count={3} />);

    expect(screen.getByText(/3 Active Sessions/i)).toBeInTheDocument();
  });

  it("should render error banner notice layout block when error prop is present", () => {
    render(
      <ConnectsLayout {...defaultProps} error="Failed to sync active slots." />,
    );

    expect(
      screen.getByText("Failed to sync active slots."),
    ).toBeInTheDocument();
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });

  // ── Empty States & Branch Permutations ──────────────────────────────────
  it("should render sub-component empty state panel with buttons when metrics drop to 0 without completed runs", async () => {
    const user = userEvent.setup();
    render(<ConnectsLayout {...defaultProps} count={0} completedCount={0} />);

    expect(screen.getByText("No connections found")).toBeInTheDocument();
    expect(
      screen.getByText("Start searching for matching mentors to get rolling."),
    ).toBeInTheDocument();

    const actionBtn = screen.getByRole("button", { name: "Find Mentors" });
    await user.click(actionBtn);
    expect(mockEmptyState.onAction).toHaveBeenCalledTimes(1);
  });

  it("should cover optional prop boundary branches for EmptyState layouts with omitted text values", () => {
    const customEmptyState = {
      message: "Isolated simple empty text message string",
    };
    render(
      <ConnectsLayout
        {...defaultProps}
        count={0}
        completedCount={0}
        emptyState={customEmptyState}
      />,
    );

    expect(
      screen.getByText("Isolated simple empty text message string"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  // ── Completed Layout Render Streams ──────────────────────────────────────
  it("should split content views using section divider lines when completed sets exist", () => {
    render(<ConnectsLayout {...defaultProps} count={2} completedCount={5} />);

    expect(screen.getByTestId("active-child")).toBeInTheDocument();
    expect(screen.getByTestId("completed-child")).toBeInTheDocument();

    expect(screen.getByText("Completed Sessions (5)")).toBeInTheDocument();
    expect(screen.queryByText("No connections found")).not.toBeInTheDocument();
  });
});
