/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdditionalSessionPaymentModal from "./AdditionalSessionPaymentModal";

// ── Mocks ──────────────────────────────────────────────────────
vi.mock("@features/connects/api/escrow.api", () => ({
  payAdditionalEscrow: vi.fn(),
}));

vi.mock("@features/mentee/components/dashboard/history/EscrowSuccessModal", () => ({
  default: ({ totalAmount, mentorName, onDone }) => (
    <div data-testid="escrow-success-modal">
      <span>Success total: {totalAmount}</span>
      <span>Mentor: {mentorName}</span>
      <button onClick={onDone}>Done</button>
    </div>
  ),
}));

vi.mock("@components/shared/icons/PaymentIcons", () => ({
  TokenIcon: ({ size }) => <span data-testid="token-icon" data-size={size} />,
  LockIcon: ({ size }) => <span data-testid="lock-icon" data-size={size} />,
}));

vi.mock("@components/shared/payment/EscrowPaymentUI", () => ({
  EscrowModalShell: ({ title, onClose, onPay, payDisabled, loading, totalAmount, children }) => (
    <div data-testid="escrow-modal-shell">
      <h1>{title}</h1>
      <span>Total: {totalAmount}</span>
      <span>Loading: {String(loading)}</span>
      <button onClick={onClose}>Close</button>
      <button onClick={onPay} disabled={payDisabled}>
        Pay
      </button>
      {children}
    </div>
  ),
  SessionDetailRows: ({ rows }) => (
    <div data-testid="session-detail-rows">
      {rows
        .filter(Boolean)
        .map((row) => (
          <div key={row.label}>
            {row.label}: {row.value}
          </div>
        ))}
    </div>
  ),
  BalanceRow: ({ fetching, walletBalance, insufficient }) => (
    <div data-testid="balance-row">
      Balance: {String(walletBalance)}, Fetching: {String(fetching)}, Insufficient:{" "}
      {String(insufficient)}
    </div>
  ),
}));

vi.mock("@lib/formatters/dateTime", () => ({
  formatTimeString: (value) => `time(${value})`,
  formatSlotDate: (value) => `date(${value})`,
}));

const mockUseEscrowPayment = vi.fn();
vi.mock("@lib/hooks/useEscrowPayment", () => ({
  useEscrowPayment: (...args) => mockUseEscrowPayment(...args),
}));

import { payAdditionalEscrow } from "@features/connects/api/escrow.api";

// ── Fixtures ───────────────────────────────────────────────────
const baseConnect = {
  _id: "connect-1",
  mentorProfile: { hourlyRate: 100 },
  mentor: { name: "Jane Mentor" },
};

const baseSlot = {
  date: "2026-01-15",
  day: "Thursday",
  startTime: "2026-01-15T09:00:00Z",
  endTime: "2026-01-15T10:00:00Z",
};

const makeHookState = (overrides = {}) => ({
  loading: false,
  setLoading: vi.fn(),
  fetching: false,
  error: "",
  setError: vi.fn(),
  walletBalance: 500,
  commissionRate: 20,
  sessionRate: 100,
  ...overrides,
});

describe("AdditionalSessionPaymentModal", () => {
  let onClose;
  let onSuccess;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    onSuccess = vi.fn();
    mockUseEscrowPayment.mockReturnValue(makeHookState());
  });

  it("should render the modal shell with title and computed total amount", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("Pay for Additional Session")).toBeInTheDocument();
    // sessionRate 100 + platformFee ceil(100*20/100)=20 => 120
    expect(screen.getByText("Total: 120")).toBeInTheDocument();
  });

  it("should render slot info rows including mentor, date, time and rate", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/Mentor: Jane Mentor/)).toBeInTheDocument();
    expect(screen.getByText(/Date: Thursday, date\(2026-01-15\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/Time: time\(2026-01-15T09:00:00Z\) – time\(2026-01-15T10:00:00Z\)/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rate: 100 tokens \/ session/)).toBeInTheDocument();
  });

  it("should omit date and time rows when slot has no date/startTime", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={{}}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.queryByText(/^Date:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Time:/)).not.toBeInTheDocument();
  });

  it("should fall back to 'Mentor' when connect.mentor.name is missing", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={{ _id: "c1" }}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/Mentor: Mentor/)).toBeInTheDocument();
  });

  it("should show commission rate placeholder while fetching", () => {
    mockUseEscrowPayment.mockReturnValue(makeHookState({ fetching: true }));

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("(…%)")).toBeInTheDocument();
  });

  it("should show the resolved commission rate percentage once fetched", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("(20%)")).toBeInTheDocument();
  });

  it("should render the insufficient balance banner when balance is too low", () => {
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ walletBalance: 50, sessionRate: 100 }),
    );

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("You need 70 more tokens.")).toBeInTheDocument();
  });

  it("should not render the insufficient balance banner when balance is sufficient", () => {
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.queryByText(/more tokens\./)).not.toBeInTheDocument();
  });

  it("should disable the pay action when balance is insufficient", () => {
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ walletBalance: 0, sessionRate: 100 }),
    );

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByRole("button", { name: "Pay" })).toBeDisabled();
  });

  it("should disable the pay action while fetching escrow status", () => {
    mockUseEscrowPayment.mockReturnValue(makeHookState({ fetching: true }));

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByRole("button", { name: "Pay" })).toBeDisabled();
  });

  it("should disable the pay action when sessionRate is falsy", () => {
    mockUseEscrowPayment.mockReturnValue(makeHookState({ sessionRate: 0 }));

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByRole("button", { name: "Pay" })).toBeDisabled();
  });

  it("should call onClose when the close button in the shell is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should set an error and skip the API call when sessionRate is a truthy value below 1", async () => {
    const setError = vi.fn();
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ sessionRate: 0.5, setError }),
    );

    const user = userEvent.setup();
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const payButton = screen.getByRole("button", { name: "Pay" });
    expect(payButton).not.toBeDisabled();

    await user.click(payButton);

    expect(setError).toHaveBeenCalledWith("Mentor has not set a session rate.");
    expect(payAdditionalEscrow).not.toHaveBeenCalled();
  });

  it("should submit payment successfully and show the success modal", async () => {
    payAdditionalEscrow.mockResolvedValueOnce({});
    const user = userEvent.setup();

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pay" }));

    expect(payAdditionalEscrow).toHaveBeenCalledWith({
      connectRequestId: "connect-1",
      sessionRate: 100,
      slotId: "slot-1",
    });

    expect(await screen.findByTestId("escrow-success-modal")).toBeInTheDocument();
    expect(screen.getByText("Success total: 120")).toBeInTheDocument();
    expect(screen.getByText("Mentor: Jane Mentor")).toBeInTheDocument();
  });

  it("should call onSuccess and onClose when the success modal Done button is clicked", async () => {
    payAdditionalEscrow.mockResolvedValueOnce({});
    const user = userEvent.setup();

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pay" }));
    await screen.findByTestId("escrow-success-modal");

    await user.click(screen.getByText("Done"));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should set a fallback error message when the payment API call fails without a response message", async () => {
    const setError = vi.fn();
    const setLoading = vi.fn();
    payAdditionalEscrow.mockRejectedValueOnce(new Error("network down"));
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ setError, setLoading }),
    );

    const user = userEvent.setup();
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pay" }));

    expect(setError).toHaveBeenCalledWith("Payment failed. Please try again.");
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("should set the server-provided error message when the payment API call fails with a response message", async () => {
    const setError = vi.fn();
    payAdditionalEscrow.mockRejectedValueOnce({
      response: { data: { message: "Insufficient funds on server" } },
    });
    mockUseEscrowPayment.mockReturnValue(makeHookState({ setError }));

    const user = userEvent.setup();
    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pay" }));

    expect(setError).toHaveBeenCalledWith("Insufficient funds on server");
  });

  it("should render the provided error message text", () => {
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ error: "Something went wrong" }),
    );

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should pass the balance row props through from the hook state", () => {
    mockUseEscrowPayment.mockReturnValue(
      makeHookState({ walletBalance: 300, fetching: true }),
    );

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const balanceRow = screen.getByTestId("balance-row");
    expect(balanceRow).toHaveTextContent("Balance: 300");
    expect(balanceRow).toHaveTextContent("Fetching: true");
  });

  it("should default the session rate from mentorProfile.hourlyRate when connect has no _id-based rate yet", () => {
    mockUseEscrowPayment.mockImplementation((connectId, defaultSessionRate) => {
      expect(defaultSessionRate).toBe(100);
      return makeHookState();
    });

    render(
      <AdditionalSessionPaymentModal
        connect={baseConnect}
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
  });

  it("should default the session rate to 0 when connect is not provided", () => {
    mockUseEscrowPayment.mockImplementation((connectId, defaultSessionRate) => {
      expect(connectId).toBeUndefined();
      expect(defaultSessionRate).toBe(0);
      return makeHookState({ sessionRate: 0 });
    });

    render(
      <AdditionalSessionPaymentModal
        slot={baseSlot}
        slotId="slot-1"
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
  });
});
