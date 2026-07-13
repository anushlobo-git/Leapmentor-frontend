import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenteeHistoryModal from "./MenteeHistoryModal";
import { getEngagements } from "@features/admin/api/admin.api";
import logger from "@lib/logger";

// ── 1. Mock External Modules & Libraries ──────────────────────────────────
vi.mock("@features/admin/api/admin.api", () => ({
  getEngagements: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("./WalletStatusBadge", () => ({
  default: ({ status }) => (
    <span data-testid="wallet-status-badge">{status}</span>
  ),
}));

vi.mock("../../pages/walletRequests.utils", () => ({
  getInitials: vi.fn((name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : "M",
  ),
  getAvatarColor: vi.fn(() => ({ bg: "#000000", text: "#ffffff" })),
  formatDate: vi.fn((date) => (date ? `Formatted-${date}` : "—")),
}));

describe("MenteeHistoryModal", () => {
  const mockMentee = {
    _id: "mentee-123",
    name: "John Doe",
    email: "john@leapmentor.com",
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state upon initial render", () => {
    getEngagements.mockReturnValue(new Promise(() => {}));

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    expect(screen.getByText("Loading engagement history…")).toBeInTheDocument();
  });

  it("should handle api tracking error gracefully and show empty state log", async () => {
    const apiError = new Error("Database network failure");
    getEngagements.mockRejectedValueOnce(apiError);

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    expect(await screen.findByText("No engagements found")).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledWith("Failed to fetch engagements", {
      menteeId: mockMentee._id,
      error: apiError,
    });
  });

  it("should show empty message state if fetched engagements list matches no criteria", async () => {
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: [
          {
            _id: "eng-other",
            mentee: { _id: "other-id", email: "other@leapmentor.com" },
          },
        ],
      },
    });

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    expect(await screen.findByText("No engagements found")).toBeInTheDocument();
  });

  it("should correctly render summary calculations for filtering metrics by ID or Email match matching strategy", async () => {
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: [
          {
            _id: "eng-1",
            mentor: { name: "Mentor A" },
            mentee: { _id: "mentee-123", email: "diff@leapmentor.com" },
            selectedSlots: [{ status: "completed" }, { status: "pending" }],
          },
          {
            _id: "eng-2",
            mentor: { name: "Mentor B" },
            mentee: { _id: "diff-id", email: "john@leapmentor.com" },
            selectedSlots: [{ status: "completed" }],
          },
          {
            _id: "eng-unmatched",
            mentor: { name: "Mentor C" },
            mentee: { _id: "diff-id", email: "diff@leapmentor.com" },
            selectedSlots: [{ status: "completed" }],
          },
        ],
      },
    });

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    expect(await screen.findByText("Mentor: Mentor A")).toBeInTheDocument();
    expect(screen.getByText("Mentor: Mentor B")).toBeInTheDocument();

    // Scoped container queries to isolate identical counter metrics safely
    const engagementsCard = screen.getByText("Engagements").parentElement;
    const totalSessionsCard = screen.getByText("Total Sessions").parentElement;
    const completedCard = screen.getByText("Completed").parentElement;

    expect(within(engagementsCard).getByText("2")).toBeInTheDocument();
    expect(within(totalSessionsCard).getByText("3")).toBeInTheDocument();
    expect(within(completedCard).getByText("2")).toBeInTheDocument();
  });

  it("should toggle the expanded layout section view context structure upon button row click target events", async () => {
    const user = userEvent.setup();
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: [
          {
            _id: "eng-target",
            mentor: { name: "Jane Coach" },
            mentee: { _id: "mentee-123" },
            requestedAt: "2026-01-01",
            respondedAt: "2026-01-02",
            completedAt: "2026-01-03",
            paymentStatus: "paid",
            sessionRate: 500,
            selectedSlots: [
              {
                date: "2026-07-12",
                startTime: "10:00 AM",
                endTime: "11:00 AM",
                status: "completed",
              },
            ],
          },
        ],
      },
    });

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    const expandBtn = await screen.findByRole("button", {
      name: /Mentor: Jane Coach/i,
    });
    expect(screen.queryByText("Rate/Session:")).not.toBeInTheDocument();

    // Expand
    await user.click(expandBtn);
    expect(screen.getByText("Rate/Session:")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM – 11:00 AM")).toBeInTheDocument();

    // Collapse
    await user.click(expandBtn);
    expect(screen.queryByText("Rate/Session:")).not.toBeInTheDocument();
  });

  it("should handle edge case variations for empty rates, missing times, or empty slots configurations gracefully", async () => {
    const user = userEvent.setup();
    getEngagements.mockResolvedValueOnce({
      data: {
        engagements: [
          {
            _id: "eng-edge",
            mentor: null,
            mentee: { _id: "mentee-123" },
            sessionRate: null,
            paymentStatus: undefined,
            selectedSlots: [{ date: null, startTime: null, endTime: null }],
          },
          {
            _id: "eng-no-slots",
            mentor: { name: "No Slots Mentor" },
            mentee: { _id: "mentee-123" },
            selectedSlots: [],
          },
        ],
      },
    });

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    const edgeBtn = await screen.findByRole("button", { name: /Mentor: —/i });
    await user.click(edgeBtn);

    expect(screen.getByText("Payment:")).toBeInTheDocument();
    expect(screen.getByTestId("wallet-status-badge")).toHaveTextContent(
      "unpaid",
    );

    const fallbackElements = screen.getAllByText("—");
    expect(fallbackElements.length).toBeGreaterThan(0);

    const noSlotsBtn = screen.getByRole("button", {
      name: /Mentor: No Slots Mentor/i,
    });
    await user.click(noSlotsBtn);
    expect(screen.getByText("No slots found.")).toBeInTheDocument();
  });

  it("should invoke onClose action handler when modal header dismiss toggle icon gets clicked", async () => {
    const user = userEvent.setup();
    getEngagements.mockReturnValue(new Promise(() => {}));

    render(<MenteeHistoryModal mentee={mockMentee} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", {
      name: "Close history modal",
    });
    await user.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
