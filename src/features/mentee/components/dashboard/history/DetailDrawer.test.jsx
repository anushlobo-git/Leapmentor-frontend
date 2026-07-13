import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailDrawer from "./DetailDrawer";

vi.mock("@features/mentee/components/dashboard/history/StatusBadge", () => ({
  default: ({ status }) => <div data-testid="status-badge">{status}</div>,
}));

vi.mock(
  "@features/mentee/components/dashboard/history/EscrowPaymentModal",
  () => ({
    default: ({ onSuccess, onClose }) => (
      <div data-testid="escrow-modal">
        <button onClick={() => onSuccess({ status: "ongoing" })}>
          Pay Success
        </button>
        <button onClick={onClose}>Close Escrow</button>
      </div>
    ),
  }),
);

vi.mock(
  "@features/mentee/components/dashboard/history/RequestStatusViews",
  () => ({
    PendingContent: ({ onDelete }) => (
      <button onClick={onDelete}>Delete Pending</button>
    ),
    AcceptedContent: ({ onPayClick }) => (
      <button onClick={onPayClick}>Pay Accepted</button>
    ),
    CompletedContent: () => <div>Completed</div>,
    RejectedContent: () => <div>Rejected</div>,
  }),
);

vi.mock(
  "@features/mentee/components/dashboard/history/OngoingReferredContent",
  () => ({
    OngoingContent: () => <div>Ongoing</div>,
    ReferredContent: ({ onDelete }) => (
      <button onClick={onDelete}>Delete Referred</button>
    ),
  }),
);

describe("DetailDrawer", () => {
  const baseRequest = {
    _id: "req1",
    mentor: { name: "Alice", email: "alice@example.com" },
    status: "pending",
    requestedAt: "2026-07-20T10:00:00Z",
  };

  const mockOnClose = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdateRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if request is not provided", () => {
    const { container } = render(
      <DetailDrawer
        request={null}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders pending request details and triggers delete", async () => {
    const user = userEvent.setup();
    render(
      <DetailDrawer
        request={baseRequest}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();

    const delBtn = screen.getByRole("button", { name: "Delete Pending" });
    await user.click(delBtn);

    expect(mockOnDelete).toHaveBeenCalledWith("req1");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders accepted request content and handles escrow payment lifecycle", async () => {
    const user = userEvent.setup();
    const acceptedRequest = { ...baseRequest, status: "accepted" };

    render(
      <DetailDrawer
        request={acceptedRequest}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Accepted" });
    await user.click(payBtn);

    expect(screen.getByTestId("escrow-modal")).toBeInTheDocument();

    const paySuccessBtn = screen.getByRole("button", { name: "Pay Success" });
    await user.click(paySuccessBtn);

    expect(mockOnUpdateRequest).toHaveBeenCalledWith("req1", {
      status: "ongoing",
    });

    // Close payment modal
    const closeEscrowBtn = screen.getByRole("button", { name: "Close Escrow" });
    await user.click(closeEscrowBtn);
    expect(screen.queryByTestId("escrow-modal")).not.toBeInTheDocument();
  });

  it("renders ongoing request status content", () => {
    const request = { ...baseRequest, status: "ongoing" };
    render(
      <DetailDrawer
        request={request}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
  });

  it("renders completed request status content", () => {
    const request = {
      ...baseRequest,
      status: "completed",
      respondedAt: "2026-07-21T10:00:00Z",
    };
    render(
      <DetailDrawer
        request={request}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders referred request status content and handles delete", async () => {
    const user = userEvent.setup();
    const request = { ...baseRequest, status: "referred" };
    render(
      <DetailDrawer
        request={request}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );

    expect(screen.getByText("Delete Referred")).toBeInTheDocument();
    const delBtn = screen.getByRole("button", { name: "Delete Referred" });
    await user.click(delBtn);

    expect(mockOnDelete).toHaveBeenCalledWith("req1");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders rejected request status content", () => {
    const request = { ...baseRequest, status: "rejected" };
    render(
      <DetailDrawer
        request={request}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("calls onClose when close buttons are clicked", async () => {
    const user = userEvent.setup();
    render(
      <DetailDrawer
        request={baseRequest}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
        onUpdateRequest={mockOnUpdateRequest}
      />,
    );

    // Click backdrop
    const backdrop = screen.getByRole("button", {
      name: /Close request details/i,
    });
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Click header close button
    const closeBtn = screen.getByRole("button", { name: "" }); // close button is an icon button
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
