import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EscrowModalShell,
  SessionDetailRows,
  BalanceRow,
} from "./EscrowPaymentUI";

// Mock external icons module
vi.mock("@components/shared/icons/PaymentIcons", () => ({
  LockIcon: ({ size }) => (
    <span data-testid="lock-icon" data-size={size}>
      LockIcon
    </span>
  ),
  CloseIcon: () => <span data-testid="close-icon">CloseIcon</span>,
  SpinnerIcon: () => <span data-testid="spinner-icon">SpinnerIcon</span>,
}));

// Mock external WalletBalanceDisplay component to isolate tests
vi.mock("@components/shared/WalletBalanceDisplay", () => ({
  default: ({ fetching, walletBalance, insufficient }) => (
    <div data-testid="wallet-balance-display">
      Balance: {walletBalance}, Fetching: {String(fetching)}, Insufficient:{" "}
      {String(insufficient)}
    </div>
  ),
}));

describe("EscrowPaymentUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── EscrowModalShell Tests ──

  it("should render modal shell with title, totalAmount, and children when not loading", () => {
    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={vi.fn()}
        onPay={vi.fn()}
        payDisabled={false}
        loading={false}
        totalAmount={500}
      >
        <div data-testid="modal-child">Child Content</div>
      </EscrowModalShell>,
    );

    expect(screen.getByText("Secure Escrow Payment")).toBeInTheDocument();
    expect(screen.getByText("Confirm & Pay 500 Tokens")).toBeInTheDocument();
    expect(screen.getByTestId("modal-child")).toBeInTheDocument();
    expect(screen.queryByTestId("spinner-icon")).not.toBeInTheDocument();
  });

  it("should render processing state when loading is true", () => {
    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={vi.fn()}
        onPay={vi.fn()}
        payDisabled={false}
        loading={true}
        totalAmount={500}
      />,
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner-icon")).toBeInTheDocument();
    expect(
      screen.queryByText("Confirm & Pay 500 Tokens"),
    ).not.toBeInTheDocument();

    // Cancel button must be disabled during loading phase
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should trigger onClose callback when the header close icon button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={mockOnClose}
        onPay={vi.fn()}
        payDisabled={false}
        loading={false}
        totalAmount={100}
      />,
    );

    // Query using the accessible name calculated from the inner mock text
    const closeButton = screen.getByRole("button", { name: /CloseIcon/i });
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should trigger onClose callback when the footer cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={mockOnClose}
        onPay={vi.fn()}
        payDisabled={false}
        loading={false}
        totalAmount={100}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should trigger onPay callback when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnPay = vi.fn();

    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={vi.fn()}
        onPay={mockOnPay}
        payDisabled={false}
        loading={false}
        totalAmount={250}
      />,
    );

    const payButton = screen.getByRole("button", { name: /Confirm & Pay/i });
    await user.click(payButton);
    expect(mockOnPay).toHaveBeenCalledTimes(1);
  });

  it("should disable the pay button when payDisabled is set to true", () => {
    render(
      <EscrowModalShell
        title="Secure Escrow Payment"
        onClose={vi.fn()}
        onPay={vi.fn()}
        payDisabled={true}
        loading={false}
        totalAmount={250}
      />,
    );

    const payButton = screen.getByRole("button", { name: /Confirm & Pay/i });
    expect(payButton).toBeDisabled();
  });

  // ── SessionDetailRows Tests ──

  it("should render row label and values while skipping falsy items in rows array", () => {
    const mixedRows = [
      { label: "Mentor Name", value: "Dr. John Doe" },
      false,
      { label: "Duration", value: "60 mins" },
      null,
      undefined,
    ];

    render(<SessionDetailRows rows={mixedRows} />);

    expect(screen.getByText("Mentor Name")).toBeInTheDocument();
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("60 mins")).toBeInTheDocument();
  });

  // ── BalanceRow Tests ──

  it("should forward all props directly to the WalletBalanceDisplay component", () => {
    render(
      <BalanceRow fetching={true} walletBalance={750} insufficient={true} />,
    );

    expect(screen.getByText("Your balance")).toBeInTheDocument();

    const displayWrapper = screen.getByTestId("wallet-balance-display");
    expect(displayWrapper).toHaveTextContent("Balance: 750");
    expect(displayWrapper).toHaveTextContent("Fetching: true");
    expect(displayWrapper).toHaveTextContent("Insufficient: true");
  });
});
