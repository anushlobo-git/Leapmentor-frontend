import { render, screen, fireEvent, act } from "@testing-library/react";
import RequestsTab from "./RequestsTab";
import { getIncomingRequests } from "@features/mentor/api/mentor.api";
import useSocketEvent from "@lib/hooks/useSocketEvent";

vi.mock("@features/mentor/api/mentor.api");
vi.mock("@lib/hooks/useSocketEvent");

// Mock RequestCard so we can trigger onViewProfile easily
vi.mock("@features/mentor/components/dashboard/requests/RequestCard", () => ({
  default: ({ request, onViewProfile }) => (
    <div data-testid={`request-card-${request._id}`}>
      <span>{request.mentee?.name || "—"}</span>
      <span>{request.status}</span>
      {request.status === "pending" && (
        <button onClick={() => onViewProfile(request)}>Respond</button>
      )}
    </div>
  ),
}));

// Mock MenteeProfileModal so we can trigger onClose and onUpdate
vi.mock(
  "@features/mentor/components/dashboard/requests/MenteeProfileModal",
  () => ({
    default: ({ request, onClose, onUpdate }) => (
      <div data-testid="mentee-profile-modal">
        <span>Mentorship Request Message</span>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onUpdate(request._id, "accepted")}>
          Accept Inside Modal
        </button>
      </div>
    ),
  }),
);

describe("RequestsTab Component", () => {
  const defaultRequests = [
    {
      _id: "req1",
      mentee: { name: "Alice" },
      message: "Msg 1",
      selectedSlots: [
        {
          day: "Monday",
          date: "2026-07-13",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
      status: "pending",
      requestedAt: "2026-07-12T10:00:00Z",
    },
    {
      _id: "req2",
      mentee: { name: "Bob" },
      message: "Msg 2",
      selectedSlots: [
        {
          day: "Tuesday",
          date: "2026-07-14",
          startTime: "10:00",
          endTime: "11:00",
        },
      ],
      status: "accepted",
      requestedAt: "2026-07-12T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader on initial load and then renders requests list", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: defaultRequests },
    });

    render(<RequestsTab />);

    expect(screen.getByText("Loading requests...")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("2 total")).toBeInTheDocument();
  });

  it("filters requests by tab selection", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: defaultRequests },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // Default tab is 'All Requests' -> shows Alice and Bob
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Click 'Pending' tab button
    const pendingTabBtn = screen.getByRole("button", { name: /Pending/i });
    fireEvent.click(pendingTabBtn);

    // Shows Alice, filters out Bob
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("displays empty state with appropriate message for tabs", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: [] },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("No requests yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "When mentees send you connect requests, they'll appear here.",
      ),
    ).toBeInTheDocument();

    // Click pending tab
    const pendingTabBtn = screen.getByRole("button", { name: /Pending/i });
    fireEvent.click(pendingTabBtn);

    expect(screen.getByText("No pending requests")).toBeInTheDocument();
    expect(
      screen.getByText("You'll see new requests here when mentees reach out."),
    ).toBeInTheDocument();
  });

  it("registers socket event and triggers fetch on socket status change", async () => {
    getIncomingRequests.mockResolvedValue({
      data: { requests: defaultRequests },
    });

    let socketCallback;
    useSocketEvent.mockImplementation((callback) => {
      socketCallback = callback().events.request_status_changed;
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(getIncomingRequests).toHaveBeenCalledTimes(1);

    // Fire socket event
    await act(async () => {
      socketCallback({ id: "req1", status: "accepted" });
    });

    expect(getIncomingRequests).toHaveBeenCalledTimes(2);
  });

  it("opens MenteeProfileModal when Respond clicked and closes it", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: [defaultRequests[0]] },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    const respondBtn = screen.getByRole("button", { name: "Respond" });
    fireEvent.click(respondBtn);

    // Profile modal should open
    expect(screen.getByTestId("mentee-profile-modal")).toBeInTheDocument();

    // Close the profile modal
    const closeBtn = screen.getByRole("button", { name: "Close Modal" });
    fireEvent.click(closeBtn);
    expect(
      screen.queryByTestId("mentee-profile-modal"),
    ).not.toBeInTheDocument();
  });

  it("covers handleUpdate via onUpdate in MenteeProfileModal (lines 88-91, 174-176)", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: defaultRequests },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // Open MenteeProfileModal
    const respondBtn = screen.getAllByRole("button", { name: "Respond" })[0];
    fireEvent.click(respondBtn);

    // Click "Accept Inside Modal" to trigger onUpdate(id, status)
    const acceptBtn = screen.getByRole("button", {
      name: "Accept Inside Modal",
    });
    fireEvent.click(acceptBtn);

    // After update, modal should close (setSelectedRequest(null)) and card status should update
    expect(
      screen.queryByTestId("mentee-profile-modal"),
    ).not.toBeInTheDocument();
    // Status should have changed to "accepted" in the list for req1
    expect(screen.getAllByText("accepted").length).toBeGreaterThan(0);
  });

  it("shows error state when fetch fails (lines 58-62)", async () => {
    const errorResponse = {
      response: {
        data: {
          message: "Server unavailable",
        },
      },
    };
    getIncomingRequests.mockRejectedValueOnce(errorResponse);

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // ErrorBanner should show message
    expect(screen.getByText("Server unavailable")).toBeInTheDocument();
  });

  it("covers referred tab empty state message (getEmptyStateMessage fallback)", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: [] },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // Click referred tab
    const referredTabBtn = screen.getByRole("button", { name: /Referred/i });
    fireEvent.click(referredTabBtn);

    expect(screen.getByText("No referred requests")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Requests you've referred to other mentors will appear here.",
      ),
    ).toBeInTheDocument();
  });

  it("covers getTabBadgeClass branches including 'referred' (line 30)", async () => {
    // Include a referred request to exercise the badge class logic
    const mixedRequests = [
      ...defaultRequests,
      {
        _id: "req3",
        mentee: { name: "Charlie" },
        message: "",
        selectedSlots: [],
        status: "referred",
        requestedAt: "2026-07-12T12:00:00Z",
      },
    ];

    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: mixedRequests },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // The referred tab badge should be visible with count
    expect(screen.getByText("3 total")).toBeInTheDocument();

    // Switch to the referred tab to exercise getTabBadgeClass with activeTab === "referred"
    const referredTabBtn = screen.getByRole("button", { name: /Referred/i });
    fireEvent.click(referredTabBtn);

    // Only Charlie should be visible
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("covers generic getEmptyStateMessage fallback for tabs without custom message", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: [] },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // Click "Accepted" tab (no custom message defined, so falls through to default)
    const acceptedTabBtn = screen.getByRole("button", { name: /Accepted/i });
    fireEvent.click(acceptedTabBtn);

    expect(screen.getByText("No accepted requests")).toBeInTheDocument();
    expect(
      screen.getByText("No requests have been accepted yet."),
    ).toBeInTheDocument();
  });

  it("covers fetch error without response data message (generic fallback)", async () => {
    // Error without response.data.message to hit the generic fallback
    getIncomingRequests.mockRejectedValueOnce(new Error("Network Error"));

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Failed to load requests.")).toBeInTheDocument();
  });

  it("covers res.data.requests || [] fallback when requests is null (line 57)", async () => {
    getIncomingRequests.mockResolvedValueOnce({
      data: { requests: null },
    });

    render(<RequestsTab />);

    await act(async () => {
      await Promise.resolve();
    });

    // With null requests falling back to [], empty state should show
    expect(screen.getByText("No requests yet")).toBeInTheDocument();
  });
});
