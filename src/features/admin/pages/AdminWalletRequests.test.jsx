import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminWalletRequests from "./AdminWalletRequests";
import {
  getLeapRequests,
  approveLeapRequest,
  rejectLeapRequest,
} from "@features/admin/api/admin.api";

// ── Mock API Endpoints ──────────────────────────────────────────────────────
vi.mock("@features/admin/api/admin.api", () => ({
  getLeapRequests: vi.fn(),
  approveLeapRequest: vi.fn(),
  rejectLeapRequest: vi.fn(),
}));

// ── Mock Subcomponents & Layout Wrapper ─────────────────────────────────────
vi.mock("@features/admin/components/AdminLayout", () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock("@features/admin/components/wallet/MenteeHistoryModal", () => ({
  default: ({ mentee, onClose }) => (
    <div data-testid="mock-history-modal">
      <span>History For: {mentee.name}</span>
      <button onClick={onClose}>Close History</button>
    </div>
  ),
}));

vi.mock("@features/admin/components/wallet/WalletRequestTable", () => ({
  EmptyState: ({ label }) => <div data-testid="mock-empty-state">{label}</div>,
  Toast: ({ toast }) =>
    toast ? (
      <div data-testid="mock-toast" className={toast.type}>
        {toast.message}
      </div>
    ) : null,
  RequestRow: ({ req, onApprove, onReject, actionLoading, onViewHistory }) => (
    <tr data-testid={`request-row-${req._id}`}>
      <td>{req.mentee?.name || "No Name"}</td>
      <td>{req.mentee?.email || "No Email"}</td>
      <td>{req.status}</td>
      <td>
        <button
          onClick={() => onApprove(req._id)}
          disabled={actionLoading === req._id}
        >
          Approve
        </button>
        <button onClick={() => onReject(req._id)}>Reject</button>
        <button onClick={() => onViewHistory(req.mentee)}>View History</button>
      </td>
    </tr>
  ),
}));

vi.mock("./walletRequests.utils", () => ({
  TABS: [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ],
  getEmptyStateLabel: (search, activeTab) => `Empty: ${activeTab}-${search}`,
}));

// ── Test Mock Fixtures ──────────────────────────────────────────────────────
const mockRequestsPayload = [
  {
    _id: "req-1",
    status: "pending",
    mentee: { name: "John Doe", email: "john@test.com" },
  },
  {
    _id: "req-2",
    status: "approved",
    mentee: { name: "Alice Smith", email: "alice@test.com" },
  },
  {
    _id: "req-3",
    status: "rejected",
    mentee: { name: "Bob Johnson", email: "bob@test.com" },
  },
  { _id: "req-4", status: "pending", mentee: { name: null, email: null } },
];

describe("AdminWalletRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // ── Initialization & Loading States ────────────────────────────────────────
  it("should display the loading skeleton spinner elements during initial fetch requests", async () => {
    getLeapRequests.mockReturnValue(new Promise(() => {}));
    render(<AdminWalletRequests />);
    expect(screen.getByText("Loading requests…")).toBeInTheDocument();
  });

  it("should process structural payloads using the fallback layout array parsing branch variant", async () => {
    getLeapRequests.mockResolvedValue({ data: mockRequestsPayload });
    render(<AdminWalletRequests />);
    expect(await screen.findByTestId("request-row-req-1")).toBeInTheDocument();
  });

  it("should fail loading gracefully and display a system message if the network request fails", async () => {
    getLeapRequests.mock詐kedValue
      ? getLeapRequests.mockRejectedValue(new Error("Network Error"))
      : getLeapRequests.mockRejectedValue(new Error("Network Error"));
    render(<AdminWalletRequests />);
    expect(
      await screen.findByText("Failed to load requests."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-empty-state")).toBeInTheDocument();
  });

  // ── Tab & Data Metrics Calculation Branches ─────────────────────────────────
  it("should parse standard structured server payloads and accurately compute status counts", async () => {
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    render(<AdminWalletRequests />);
    expect(await screen.findByText("2 Pending")).toBeInTheDocument();
    expect(screen.getByText("1 Approved")).toBeInTheDocument();
  });

  it("should dynamically filter row lists when alternating between system tabs", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });

    render(<AdminWalletRequests />);

    expect(await screen.findByTestId("request-row-req-1")).toBeInTheDocument();
    expect(screen.queryByTestId("request-row-req-2")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Approved/ }));
    expect(screen.getByTestId("request-row-req-2")).toBeInTheDocument();
    expect(screen.queryByTestId("request-row-req-1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^All/ }));
    expect(screen.getByTestId("request-row-req-1")).toBeInTheDocument();
    expect(screen.getByTestId("request-row-req-2")).toBeInTheDocument();
    expect(screen.getByTestId("request-row-req-3")).toBeInTheDocument();
  });

  // ── Search Input Constraints & Null Protection Checks ───────────────────────
  it("should narrow table contents down to targeted items upon character input search matchers", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });

    render(<AdminWalletRequests />);

    const searchInput = await screen.findByPlaceholderText(
      "Search by name or email…",
    );

    await user.type(searchInput, "John");
    expect(screen.getByTestId("request-row-req-1")).toBeInTheDocument();
    expect(screen.queryByTestId("request-row-req-4")).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, "alice@test.com");

    await user.click(screen.getByRole("button", { name: /^All/ }));
    expect(screen.getByTestId("request-row-req-2")).toBeInTheDocument();
    expect(screen.queryByTestId("request-row-req-1")).not.toBeInTheDocument();
  });

  it("should fall back cleanly to empty string evaluations when user context records are missing", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: [mockRequestsPayload[3]] },
    });

    render(<AdminWalletRequests />);

    const searchInput = await screen.findByPlaceholderText(
      "Search by name or email…",
    );
    await user.type(searchInput, "randomXYZ");

    expect(screen.getByTestId("mock-empty-state")).toHaveTextContent(
      "Empty: pending-randomXYZ",
    );
  });

  // ── Approval Pipeline Scenarios ─────────────────────────────────────────────
  it("should successfully execute approval pipeline adjustments and mutate localized state states", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    approveLeapRequest.mockResolvedValue({ success: true });

    render(<AdminWalletRequests />);

    const approveBtns = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(approveBtns[0]);

    expect(approveLeapRequest).toHaveBeenCalledWith("req-1");
    expect(
      screen.getByText("500 LP added to mentee's wallet successfully!"),
    ).toBeInTheDocument();
  });

  it("should capture and process structured server error payloads during approval execution faults", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });

    const mockServerError = {
      response: { data: { message: "Limits exceeded." } },
    };
    approveLeapRequest.mockRejectedValue(mockServerError);

    render(<AdminWalletRequests />);

    const approveBtns = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(approveBtns[0]);

    expect(screen.getByText("Limits exceeded.")).toBeInTheDocument();
  });

  it("should deploy generic backup text during execution failures when custom messages are unavailable", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    approveLeapRequest.mockRejectedValue(new Error("Raw system break"));

    render(<AdminWalletRequests />);

    const approveBtns = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(approveBtns[0]);

    expect(screen.getByText("Approval failed.")).toBeInTheDocument();
  });

  // ── Rejection Pipeline Scenarios ─────────────────────────────────────────────
  it("should process requests rejection routines and transfer items across tracking queues correctly", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    rejectLeapRequest.mockResolvedValue({ success: true });

    render(<AdminWalletRequests />);

    const rejectBtns = await screen.findAllByRole("button", { name: "Reject" });
    await user.click(rejectBtns[0]);

    expect(rejectLeapRequest).toHaveBeenCalledWith("req-1");
    expect(screen.getByText("Request rejected.")).toBeInTheDocument();
  });

  it("should cleanly capture response contextual errors upon standard rejection framework breakdowns", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });

    const mockServerError = {
      response: { data: { message: "Invalid permissions." } },
    };
    rejectLeapRequest.mockRejectedValue(mockServerError);

    render(<AdminWalletRequests />);

    const rejectBtns = await screen.findAllByRole("button", { name: "Reject" });
    await user.click(rejectBtns[0]);

    expect(screen.getByText("Invalid permissions.")).toBeInTheDocument();
  });

  it("should assign global generic rejection messages when server responses yield empty structures", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    rejectLeapRequest.mockRejectedValue(new Error("Generic Network Crash"));

    render(<AdminWalletRequests />);

    const rejectBtns = await screen.findAllByRole("button", { name: "Reject" });
    await user.click(rejectBtns[0]);

    expect(screen.getByText("Rejection failed.")).toBeInTheDocument();
  });

  // ── Modals & Alert Lifecycle Timeouts ───────────────────────────────────────
  it("should toggle history modal visibility controls accurately across configuration cycles", async () => {
    const user = userEvent.setup();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });

    render(<AdminWalletRequests />);

    const historyBtns = await screen.findAllByRole("button", {
      name: "View History",
    });
    await user.click(historyBtns[0]);

    expect(screen.getByTestId("mock-history-modal")).toBeInTheDocument();
    expect(screen.getByText("History For: John Doe")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close History" }));
    expect(screen.queryByTestId("mock-history-modal")).not.toBeInTheDocument();
  });

  it("should completely reset toast message references on scheduled countdown timer completion", async () => {
    vi.useFakeTimers();
    getLeapRequests.mockResolvedValue({
      data: { requests: mockRequestsPayload },
    });
    approveLeapRequest.mockResolvedValue({ success: true });

    render(<AdminWalletRequests />);

    // Flush initial load requests promise
    await act(async () => {
      await Promise.resolve();
    });

    const approveBtns = screen.getAllByRole("button", { name: "Approve" });

    // Fire click event synchronously
    fireEvent.click(approveBtns[0]);

    // Flush the async approveLeapRequest promise microtasks completely
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("mock-toast")).toBeInTheDocument();

    // Move timers forward by 3500ms to clear out the visual notification
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByTestId("mock-toast")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
