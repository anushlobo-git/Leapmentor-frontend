import { render, screen, fireEvent, act } from "@testing-library/react";
import MenteeProfileModal from "./MenteeProfileModal";
import { respondToRequest } from "@features/mentor/api/mentor.api";
import logger from "@lib/logger";

vi.mock("@features/mentor/api/mentor.api");
vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

// Mock ReferModal & RequestActionModal to keep things simple
vi.mock("@features/mentor/components/dashboard/requests/ReferModal", () => ({
  default: ({ request, onClose, onReferred }) => (
    <div data-testid="refer-modal-mock">
      ReferModal Mock
      <button onClick={() => onReferred(request._id, "referred")}>
        Submit Referral
      </button>
      <button onClick={onClose}>Close Referral</button>
    </div>
  ),
}));

vi.mock(
  "@features/mentor/components/dashboard/requests/RequestActionModal",
  () => ({
    default: ({ type, menteeName, onBack }) => (
      <div data-testid="action-modal-mock">
        ActionModal Mock - {type} - {menteeName}
        <button onClick={onBack}>Back to Requests</button>
      </div>
    ),
  }),
);

describe("MenteeProfileModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  const defaultRequest = {
    _id: "req123",
    mentee: {
      name: "John Doe",
    },
    selectedSlots: [
      { date: "2026-07-15", startTime: "09:00", endTime: "10:00" },
    ],
    message: "Hi, I need help with React.",
    requestedAt: "2026-07-12T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly with request details", () => {
    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText('"Hi, I need help with React."'),
    ).toBeInTheDocument();
    expect(screen.getByText("Wednesday, Jul 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("09:00 AM – 10:00 AM")).toBeInTheDocument();
  });

  it("handles onClose when close button is clicked", () => {
    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: "" }); // close header button has no name text, just SVG
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles accept action flow successfully", async () => {
    respondToRequest.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const acceptBtn = screen.getByRole("button", { name: /Accept Request/i });
    fireEvent.click(acceptBtn);

    // Loader is active
    expect(screen.getByText("Accepting…")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(respondToRequest).toHaveBeenCalledWith("req123", {
      status: "accepted",
      confirmedSlot: defaultRequest.selectedSlots[0],
    });
    expect(mockOnUpdate).toHaveBeenCalledWith("req123", "accepted");

    // Action modal should be rendered
    expect(screen.getByTestId("action-modal-mock")).toBeInTheDocument();

    // Click back to requests
    const backBtn = screen.getByRole("button", { name: /Back to Requests/i });
    fireEvent.click(backBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles reject action flow successfully", async () => {
    respondToRequest.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const rejectBtn = screen.getByRole("button", { name: /Reject/i });
    fireEvent.click(rejectBtn);

    // Loader is active
    expect(screen.getByText("Rejecting…")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(respondToRequest).toHaveBeenCalledWith("req123", {
      status: "rejected",
    });
    expect(mockOnUpdate).toHaveBeenCalledWith("req123", "rejected");
  });

  it("logs errors on respond failure", async () => {
    const apiError = new Error("API Failure");
    respondToRequest.mockRejectedValueOnce(apiError);

    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const rejectBtn = screen.getByRole("button", { name: /Reject/i });
    fireEvent.click(rejectBtn);

    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.error).toHaveBeenCalledWith("Respond error:", {
      error: "API Failure",
    });
  });

  it("triggers refer modal with small delay on refer click", () => {
    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const referBtn = screen.getByRole("button", { name: /Refer/i });
    fireEvent.click(referBtn);

    expect(screen.getByText("Referring…")).toBeInTheDocument();

    // Fast forward timer by 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByTestId("refer-modal-mock")).toBeInTheDocument();

    // Click Close Referral inside refer modal mock (covers onClose on line 88)
    const closeReferralBtn = screen.getByRole("button", {
      name: /Close Referral/i,
    });
    fireEvent.click(closeReferralBtn);
    expect(screen.queryByTestId("refer-modal-mock")).not.toBeInTheDocument();
  });

  it("covers formatTime and formatDate fallbacks", () => {
    const emptyRequest = {
      _id: "reqEmpty",
      requestedAt: "2026-07-12T10:00:00Z",
    };

    render(
      <MenteeProfileModal
        request={emptyRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("covers onReferred callback from ReferModal (lines 89-91)", () => {
    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const referBtn = screen.getByRole("button", { name: /Refer/i });
    fireEvent.click(referBtn);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByTestId("refer-modal-mock")).toBeInTheDocument();

    // Click Submit Referral to trigger onReferred callback
    const submitReferralBtn = screen.getByRole("button", {
      name: /Submit Referral/i,
    });
    fireEvent.click(submitReferralBtn);

    expect(mockOnUpdate).toHaveBeenCalledWith("req123", "referred");
    // After onReferred, the refer modal should hide (setShowReferModal(false))
    expect(screen.queryByTestId("refer-modal-mock")).not.toBeInTheDocument();
  });

  it("covers formatTime PM branch, midnight h%12||12, and null time/date guards (lines 14-22)", () => {
    const branchRequest = {
      _id: "reqBranch",
      mentee: { name: "Test User" },
      selectedSlots: [
        { date: "2026-08-01", startTime: "14:30", endTime: "15:00" }, // PM branch (h>=12)
        { date: "2026-08-02", startTime: "00:15", endTime: "12:00" }, // midnight (h%12||12) and noon
        { date: null, startTime: null, endTime: null }, // null guards
      ],
      requestedAt: "2026-07-12T10:00:00Z",
    };

    render(
      <MenteeProfileModal
        request={branchRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    // PM time 14:30 → "02:30 PM"
    expect(screen.getByText(/02:30 PM/)).toBeInTheDocument();
    // Midnight 00:15 → "12:15 AM" (h%12=0, ||12 kicks in)
    expect(screen.getByText(/12:15 AM/)).toBeInTheDocument();
    // Noon 12:00 → "12:00 PM" (h%12=0, ||12 kicks in)
    expect(screen.getByText(/12:00 PM/)).toBeInTheDocument();
  });

  it("covers err.message || err fallback when error has no message property (line 59)", async () => {
    const errObj = { code: "UNKNOWN" }; // no .message property
    respondToRequest.mockRejectedValueOnce(errObj);

    render(
      <MenteeProfileModal
        request={defaultRequest}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />,
    );

    const rejectBtn = screen.getByRole("button", { name: /Reject/i });
    fireEvent.click(rejectBtn);

    await act(async () => {
      await Promise.resolve();
    });

    expect(logger.error).toHaveBeenCalledWith("Respond error:", {
      error: errObj,
    });
  });
});
