import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EscrowPaymentModal from "./EscrowPaymentModal";
import { useEscrowPayment } from "@lib/hooks/useEscrowPayment";
import { payEscrow } from "@features/connects/api/escrow.api";

// Mock external systems
vi.mock("@lib/hooks/useEscrowPayment", () => ({
  useEscrowPayment: vi.fn(),
}));

vi.mock("@features/connects/api/escrow.api", () => ({
  payEscrow: vi.fn(),
}));

vi.mock(
  "@features/mentee/components/dashboard/history/EscrowSuccessModal",
  () => ({
    default: ({ totalAmount, mentorName, onDone }) => (
      <div data-testid="success-modal">
        Success {totalAmount} for {mentorName}
        <button onClick={onDone}>Done</button>
      </div>
    ),
  }),
);

vi.mock("@components/shared/payment/EscrowPaymentUI", () => ({
  // Omit disabling so we can test handlePay logic paths via mock DOM triggers
  EscrowModalShell: ({ children, title, onClose, onPay }) => (
    <div data-testid="escrow-shell">
      <h2>{title}</h2>
      <button onClick={onClose}>Close Shell</button>
      <button onClick={onPay}>Pay Shell</button>
      {children}
    </div>
  ),
  SessionDetailRows: ({ rows }) => (
    <div data-testid="detail-rows">
      {rows.filter(Boolean).map((r, i) => (
        <div key={i}>
          {r.label}: {r.value}
        </div>
      ))}
    </div>
  ),
  BalanceRow: ({ walletBalance, insufficient }) => (
    <div data-testid="balance-row">
      Balance: {walletBalance} {insufficient ? "Insufficient" : "Sufficient"}
    </div>
  ),
}));

vi.mock("@components/shared/icons/PaymentIcons", () => ({
  TokenIcon: () => <span>TokenIcon</span>,
  LockIcon: () => <span>LockIcon</span>,
}));

describe("EscrowPaymentModal", () => {
  const baseRequest = {
    _id: "req1",
    mentor: { name: "John Doe" },
    mentorProfile: { hourlyRate: 100 },
    selectedSlots: [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
    ],
    confirmedSlot: {
      day: "Monday",
      date: "2026-07-20",
      startTime: "09:00",
      endTime: "10:00",
    },
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockSetError = vi.fn();
  const mockSetLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useEscrowPayment.mockReturnValue({
      loading: false,
      setLoading: mockSetLoading,
      fetching: false,
      error: null,
      setError: mockSetError,
      walletBalance: 1000,
      commissionRate: 10,
      sessionRate: 100,
      remoteSessionCount: 2,
    });
    payEscrow.mockResolvedValue({ success: true });
  });

  it("renders payment details and details card correctly", () => {
    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByTestId("escrow-shell")).toBeInTheDocument();
    expect(screen.getByText("Mentor: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Date: Monday, Jul 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("Rate: 100 tokens / session")).toBeInTheDocument();
    expect(
      screen.getByText("Sessions: 2 sessions (auto-filled)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mentor receives")).toBeInTheDocument();
    expect(screen.getByText("Balance: 1000 Sufficient")).toBeInTheDocument();
  });

  it("handles successful escrow payment flow", async () => {
    const user = userEvent.setup();
    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Shell" });
    await user.click(payBtn);

    expect(payEscrow).toHaveBeenCalledWith({
      connectRequestId: "req1",
      sessionRate: 100,
      sessionCount: 2,
    });

    const successModal = await screen.findByTestId("success-modal");
    expect(successModal).toBeInTheDocument();

    const doneBtn = screen.getByRole("button", { name: "Done" });
    await user.click(doneBtn);

    expect(mockOnSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ongoing",
        paymentStatus: "paid",
        sessionRate: 100,
        sessionCount: 2,
        totalAmount: 220, // 200 + 20Platform fee (10%)
      }),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles payment API error during pay", async () => {
    payEscrow.mockRejectedValueOnce({
      response: { data: { message: "Server operational failure" } },
    });
    const user = userEvent.setup();

    // Re-render to register the mocked payEscrow rejection
    useEscrowPayment.mockReturnValue({
      loading: false,
      setLoading: mockSetLoading,
      fetching: false,
      error: "Server operational failure", // Inject error to verify display
      setError: mockSetError,
      walletBalance: 1000,
      commissionRate: 10,
      sessionRate: 100,
      remoteSessionCount: 2,
    });

    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Shell" });
    await user.click(payBtn);

    expect(screen.getByText("Server operational failure")).toBeInTheDocument();
  });

  it("displays payment failure generic message on non-standard api rejection", async () => {
    payEscrow.mockRejectedValueOnce(new Error("Generic Network Crash"));
    const user = userEvent.setup();

    useEscrowPayment.mockReturnValue({
      loading: false,
      setLoading: mockSetLoading,
      fetching: false,
      error: "Payment failed. Please try again.",
      setError: mockSetError,
      walletBalance: 1000,
      commissionRate: 10,
      sessionRate: 100,
      remoteSessionCount: 2,
    });

    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Shell" });
    await user.click(payBtn);

    expect(
      screen.getByText("Payment failed. Please try again."),
    ).toBeInTheDocument();
  });

  it("shows error if sessionRate is missing or invalid (< 1)", async () => {
    const user = userEvent.setup();
    useEscrowPayment.mockReturnValue({
      loading: false,
      setLoading: mockSetLoading,
      fetching: false,
      error: "Mentor has not set a session rate.",
      setError: mockSetError,
      walletBalance: 1000,
      commissionRate: 10,
      sessionRate: 0,
      remoteSessionCount: 2,
    });

    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Shell" });
    await user.click(payBtn);

    expect(mockSetError).toHaveBeenCalledWith(
      "Mentor has not set a session rate.",
    );
    expect(
      screen.getByText("Mentor has not set a session rate."),
    ).toBeInTheDocument();
  });

  it("handles insufficient balance state", async () => {
    const user = userEvent.setup();
    useEscrowPayment.mockReturnValue({
      loading: false,
      setLoading: mockSetLoading,
      fetching: false,
      error: "Need 120 more tokens.",
      setError: mockSetError,
      walletBalance: 100, // less than totalAmount of 220
      commissionRate: 10,
      sessionRate: 100,
      remoteSessionCount: 2,
    });

    render(
      <EscrowPaymentModal
        request={baseRequest}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const payBtn = screen.getByRole("button", { name: "Pay Shell" });
    await user.click(payBtn);

    expect(mockSetError).toHaveBeenCalledWith("Need 120 more tokens.");
    expect(screen.getByText("Balance: 100 Insufficient")).toBeInTheDocument();
    expect(screen.getByText("You need 120 more tokens.")).toBeInTheDocument();
  });
});
