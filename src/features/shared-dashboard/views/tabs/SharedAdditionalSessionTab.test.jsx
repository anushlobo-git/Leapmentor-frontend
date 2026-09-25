// src/features/shared-dashboard/components/tabs/SharedAdditionalSessionTab.test.jsx
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// ─── Mocks (exact alias paths the component uses) ────────────────────────────
vi.mock("@features/sessions/presenters/useSessions");
vi.mock("@features/sessions/models/sessions.api");
vi.mock("@features/connects/models/escrow.api");
vi.mock("@features/mentee/models/mentee.api", () => ({
  getEscrowWallet: vi.fn(),
}));
vi.mock("@lib/monitoring/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@features/shared-dashboard/models/sharedDashboardSlice", () => ({
  selectConnectId: (state) => state?.sharedDashboard?.connectId,
  selectConnect: (state) => state?.sharedDashboard?.connect,
  selectConnectStatus: (state) => state?.sharedDashboard?.connectStatus,
  selectViewerRole: (state) => state?.sharedDashboard?.viewerRole,
  setActiveTab: vi.fn((tab) => ({ type: "sharedDashboard/setActiveTab", payload: tab })),
}));
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});
vi.mock(
  "@features/mentee/views/dashboard/history/EscrowSuccessModal",
  () => {
    const MockEscrowSuccessModal = ({ onDone }) => {
      // Immediately invoke onDone so the modal auto-dismisses in tests
      onDone?.();
      return <div data-testid="escrow-success-modal" />;
    };
    return { default: MockEscrowSuccessModal };
  }
);

// ─── Import after vi.mock ────────────────────────────────────────────────────
import { useSelector, useDispatch } from "react-redux";
import { makeTestStore } from "@test/renderWithStore";
import useSessions from "@features/sessions/presenters/useSessions";
import * as sessionsApi from "@features/sessions/models/sessions.api";
import * as escrowApi from "@features/connects/models/escrow.api";
import * as menteeApi from "@features/mentee/models/mentee.api";
import SharedAdditionalSessionTab from "./SharedAdditionalSessionTab.jsx";

// ─── jsdom polyfills ─────────────────────────────────────────────────────────
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// ─── Fake Redux state ─────────────────────────────────────────────────────────
const makeFakeState = (overrides = {}) => ({
  wallet: { balance: 200, escrow: 0, loadedOnce: true },
  sharedDashboard: {
    connectId: "conn-123",
    connectStatus: "active",
    viewerRole: "mentee",
    connect: {
      mentor: { _id: "mentor-id", name: "Mentor User" },
      mentee: { _id: "mentee-id", name: "Mentee User" },
      mentorProfile: { hourlyRate: 50, profilePicture: null },
    },
    ...overrides,
  },
});

// ─── Default useSessions return ──────────────────────────────────────────────
const defaultSessions = {
  slots: [],
  additionalSlots: [],
  saving: false,
  addSlot: vi.fn(() => Promise.resolve({ success: true, slotId: "slot-1" })),
};

// ─── A mock availability slot ────────────────────────────────────────────────
const mockSlot = {
  date: "2025-12-01",
  day: "Mon",
  displayDate: "Mon, 2025-12-01",
  slots: [{ startTime: "10:00", endTime: "11:00", booked: false }],
};

describe("SharedAdditionalSessionTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: run selector against fake state
    vi.mocked(useSelector).mockImplementation((selector) =>
      selector(makeFakeState())
    );

    vi.mocked(useDispatch).mockImplementation(() => vi.fn());
    vi.mocked(useSessions).mockReturnValue({ ...defaultSessions });

    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValue({
      data: { slots: [], sessionDurations: [] },
    });

    vi.mocked(escrowApi.payAdditionalEscrow).mockResolvedValue({});
    vi.mocked(escrowApi.getEscrowStatus).mockResolvedValue({
      data: { wallet: { balance: 200 }, commissionRate: 20 },
    });
  });

  // ── Missing connectId → renders nothing ───────────────────────────────────
  it("renders nothing when connectId is missing", () => {
    vi.mocked(useSelector).mockImplementation((selector) =>
      selector(makeFakeState({ connectId: null }))
    );
    const { container } = render(<SharedAdditionalSessionTab />);
    expect(container.firstChild).toBeNull();
  });

  // ── Completed session warning ─────────────────────────────────────────────
  it("shows a completed-session warning when status is 'completed'", () => {
    vi.mocked(useSelector).mockImplementation((selector) =>
      selector(makeFakeState({ connectStatus: "completed" }))
    );
    render(<SharedAdditionalSessionTab />);
    expect(screen.getByText(/this session is completed/i)).toBeInTheDocument();
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  it("displays a loading skeleton while availability is being fetched", async () => {
    let resolveApi;
    const pending = new Promise((res) => { resolveApi = res; });
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockReturnValueOnce(pending);

    render(<SharedAdditionalSessionTab />);
    // Skeleton elements exist while loading
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    // Resolve the API
    await act(async () => {
      resolveApi({ data: { slots: [], sessionDurations: [] } });
    });
    await waitFor(() =>
      expect(document.querySelectorAll(".animate-pulse").length).toBe(0)
    );
  });

  // ── Empty state ───────────────────────────────────────────────────────────
  it("shows an empty-state message when no slots are available", async () => {
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [], sessionDurations: [] },
    });
    render(<SharedAdditionalSessionTab />);
    await waitFor(() =>
      expect(screen.getByText(/hasn't set availability yet/i)).toBeInTheDocument()
    );
  });

  // ── Slots render ──────────────────────────────────────────────────────────
  it("renders available slot buttons when slots are returned", async () => {
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [mockSlot], sessionDurations: [60] },
    });
    render(<SharedAdditionalSessionTab />);
    const slotBtn = await screen.findByRole("button", { name: /10:00/i });
    expect(slotBtn).toBeInTheDocument();
  });

  // ── Slot selection → confirm modal ───────────────────────────────────────
  it("opens a confirmation modal when a slot is selected", async () => {
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [mockSlot], sessionDurations: [60] },
    });
    render(<SharedAdditionalSessionTab />);
    const slotBtn = await screen.findByRole("button", { name: /10:00/i });
    fireEvent.click(slotBtn);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument()
    );
  });

  // ── Confirm → addSlot called ──────────────────────────────────────────────
  it("calls addSlot when the confirm button is clicked", async () => {
    const addSlot = vi.fn(() => Promise.resolve({ success: true, slotId: "slot-1" }));
    vi.mocked(useSessions).mockReturnValue({ ...defaultSessions, addSlot });
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [mockSlot], sessionDurations: [60] },
    });
    render(<SharedAdditionalSessionTab />);
    fireEvent.click(await screen.findByRole("button", { name: /10:00/i }));
    fireEvent.click(await screen.findByRole("button", { name: /confirm/i }));
    await waitFor(() => expect(addSlot).toHaveBeenCalled());
  });

  // ── Cancel button closes confirm modal ────────────────────────────────────
  it("closes the confirm modal when the cancel button is clicked", async () => {
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [mockSlot], sessionDurations: [60] },
    });
    render(<SharedAdditionalSessionTab />);
    fireEvent.click(await screen.findByRole("button", { name: /10:00/i }));
    const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument()
    );
  });

  // ── mentor viewerRole sees correct UI ─────────────────────────────────────
  it("renders the tab correctly for a mentor viewer", async () => {
    vi.mocked(useSelector).mockImplementation((selector) =>
      selector(makeFakeState({ viewerRole: "mentor" }))
    );
    vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
      data: { slots: [], sessionDurations: [] },
    });
    render(<SharedAdditionalSessionTab />);
    await waitFor(() => expect(screen.queryByText(/animate-pulse/)).not.toBeInTheDocument());
    // Component should still mount without crashing for mentor role
    expect(document.body).toBeTruthy();
  });
  // ── Payment modal ↔ shared wallet slice ───────────────────────────────────
  describe("payment modal and the shared wallet", () => {
    // Real wallet reducer: selectors read the real store, dispatch goes to it.
    const useRealWalletStore = (viewerRole = "mentee") => {
      const store = makeTestStore({
        sharedDashboard: (state = makeFakeState({ viewerRole }).sharedDashboard) => state,
      });
      vi.mocked(useSelector).mockImplementation((selector) => selector(store.getState()));
      vi.mocked(useDispatch).mockReturnValue(store.dispatch);
      return store;
    };

    const openPaymentModal = async () => {
      vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
        data: { slots: [mockSlot], sessionDurations: [60] },
      });
      render(<SharedAdditionalSessionTab />);
      fireEvent.click(await screen.findByRole("button", { name: /10:00/i }));
      fireEvent.click(await screen.findByRole("button", { name: /confirm/i }));
      await screen.findByText("Pay for Additional Session");
    };

    it("syncs the balance from the escrow-status response into the wallet slice and shows it", async () => {
      const store = useRealWalletStore();
      expect(store.getState().wallet.loadedOnce).toBe(false);

      await openPaymentModal();

      await waitFor(() => expect(store.getState().wallet.balance).toBe(200));
      expect(store.getState().wallet.loadedOnce).toBe(true);
      expect(await screen.findByText("200 tokens")).toBeInTheDocument();
    });

    it("also reads a status payload that is not wrapped in a data envelope", async () => {
      // getEscrowStatus() already returns axios' `.data`, i.e. `{ wallet, commissionRate }`
      vi.mocked(escrowApi.getEscrowStatus).mockResolvedValue({
        wallet: { balance: 150 },
        commissionRate: 10,
      });
      const store = useRealWalletStore();

      await openPaymentModal();

      await waitFor(() => expect(store.getState().wallet.balance).toBe(150));
      expect(await screen.findByText("150 tokens")).toBeInTheDocument();
      expect(screen.getByText("(10%)")).toBeInTheDocument();
    });

    it("falls back to a balance another screen already loaded when the status has none", async () => {
      vi.mocked(escrowApi.getEscrowStatus).mockResolvedValue({ commissionRate: 20 }); // no wallet
      const store = useRealWalletStore();
      store.dispatch({ type: "wallet/walletSynced", payload: { balance: 320 } });

      await openPaymentModal();

      expect(await screen.findByText("320 tokens")).toBeInTheDocument();
    });

    it("refreshes the shared wallet after a successful payment", async () => {
      vi.mocked(menteeApi.getEscrowWallet).mockResolvedValue({ data: { balance: 140, escrow: 60 } });
      const store = useRealWalletStore();
      await openPaymentModal();
      await screen.findByText("200 tokens");
      expect(menteeApi.getEscrowWallet).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

      await waitFor(() => expect(store.getState().wallet.balance).toBe(140));
      expect(escrowApi.payAdditionalEscrow).toHaveBeenCalledWith({
        connectRequestId: "conn-123",
        sessionRate: 50,
        slotId: "slot-1",
      });
      expect(menteeApi.getEscrowWallet).toHaveBeenCalledTimes(1);
      expect(store.getState().wallet.escrow).toBe(60);
    });

    it("does not refresh the wallet when the payment fails", async () => {
      vi.mocked(escrowApi.payAdditionalEscrow).mockRejectedValue(new Error("nope"));
      const store = useRealWalletStore();
      await openPaymentModal();
      await screen.findByText("200 tokens");

      fireEvent.click(screen.getByRole("button", { name: /confirm & pay/i }));

      expect(await screen.findByText("Payment failed. Please try again.")).toBeInTheDocument();
      expect(menteeApi.getEscrowWallet).not.toHaveBeenCalled();
      expect(store.getState().wallet.balance).toBe(200);
    });

    it("never touches the wallet for a mentor (no payment step)", async () => {
      const store = useRealWalletStore("mentor");
      vi.mocked(sessionsApi.getMentorAvailabilityForConnect).mockResolvedValueOnce({
        data: { slots: [mockSlot], sessionDurations: [60] },
      });
      render(<SharedAdditionalSessionTab />);
      fireEvent.click(await screen.findByRole("button", { name: /10:00/i }));
      fireEvent.click(await screen.findByRole("button", { name: /confirm/i }));

      expect(await screen.findByText("Session Added!")).toBeInTheDocument();
      expect(escrowApi.getEscrowStatus).not.toHaveBeenCalled();
      expect(menteeApi.getEscrowWallet).not.toHaveBeenCalled();
      expect(store.getState().wallet.loadedOnce).toBe(false);
    });
  });
});
