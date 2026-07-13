import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SessionCard from "./SessionCard";

const mockOnSetLink = vi.fn();
const mockOnMarkComplete = vi.fn();
const mockOnSessionComplete = vi.fn();
const mockOnCancelSlot = vi.fn();
const mockOnRescheduleSlot = vi.fn();

vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  formatSlotDate: vi.fn(() => "Jul 15, 2026"),
  formatTime: vi.fn(() => "09:00"),
  getSessionStatus: vi.fn(() => ({
    label: "Scheduled",
    className: "status-class",
  })),
  getCardBorderClass: vi.fn(() => "border-class"),
  isMoreThan12HrsAway: vi.fn(() => true),
}));

vi.mock("./session-card/MeetingLinkSection", () => ({
  __esModule: true,
  default: ({ slot, viewerRole, onSetLink, saving }) => (
    <div data-testid="meeting-link">
      meeting-link {viewerRole} {saving ? "saving" : "idle"}
    </div>
  ),
}));

vi.mock("./session-card/CompletionSection", () => ({
  __esModule: true,
  default: ({ slot, viewerRole, otherName }) => (
    <div data-testid="completion-section">
      completion {viewerRole} {otherName}
    </div>
  ),
}));

vi.mock("./session-card/CancelledNotice", () => ({
  __esModule: true,
  default: ({ slot, viewerRole, otherName }) => (
    <div data-testid="cancelled-notice">cancelled-notice {otherName}</div>
  ),
}));

vi.mock("./session-card/SessionActions", () => ({
  __esModule: true,
  default: ({
    withinRescheduleWindow,
    saving,
    onRescheduleClick,
    onCancelClick,
  }) => (
    <div data-testid="session-actions">
      <button onClick={onRescheduleClick}>open-reschedule</button>
      <button onClick={onCancelClick}>open-cancel</button>
      <span>{withinRescheduleWindow ? "within" : "outside"}</span>
      <span>{saving ? "saving" : "not-saving"}</span>
    </div>
  ),
}));

vi.mock("./session-card/CancelModal", () => ({
  __esModule: true,
  default: ({ slotIndex, onConfirm, onClose }) => (
    <div data-testid="cancel-modal">
      <button onClick={() => onConfirm(slotIndex, "user-cancelled")}>
        confirm-cancel
      </button>
      <button onClick={onClose}>close-cancel</button>
    </div>
  ),
}));

vi.mock("./session-card/RescheduleModal", () => ({
  __esModule: true,
  default: ({ slotIndex, onConfirm, onClose }) => (
    <div data-testid="reschedule-modal">
      <button onClick={() => onConfirm(slotIndex, { date: "2026-07-20" })}>
        confirm-reschedule
      </button>
      <button onClick={onClose}>close-reschedule</button>
    </div>
  ),
}));

describe("SessionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active session details and opens action modals", async () => {
    mockOnCancelSlot.mockResolvedValue({ success: true });
    mockOnRescheduleSlot.mockResolvedValue({ success: true });

    render(
      <SessionCard
        slot={{
          status: "scheduled",
          isRescheduled: true,
          menteeMarked: false,
          mentorMarked: false,
        }}
        slotIndex={0}
        viewerRole="mentor"
        otherName="Alex"
        savingSlots={[]}
        onSetLink={mockOnSetLink}
        onMarkComplete={mockOnMarkComplete}
        onSessionComplete={mockOnSessionComplete}
        onCancelSlot={mockOnCancelSlot}
        onRescheduleSlot={mockOnRescheduleSlot}
        allSlots={[]}
        connectRequestId="req123"
      />,
    );

    expect(screen.getByText(/Session 1/i)).toBeInTheDocument();
    expect(screen.getByText("Jul 15, 2026")).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByTestId("meeting-link")).toBeInTheDocument();
    expect(screen.getByTestId("completion-section")).toBeInTheDocument();
    expect(screen.getByTestId("session-actions")).toBeInTheDocument();
    expect(screen.getByText(/Rescheduled/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/open-cancel/i));
    expect(screen.getByTestId("cancel-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/confirm-cancel/i));
    await waitFor(() =>
      expect(screen.queryByTestId("cancel-modal")).not.toBeInTheDocument(),
    );
    expect(mockOnCancelSlot).toHaveBeenCalledWith(0, "user-cancelled");

    fireEvent.click(screen.getByText(/open-reschedule/i));
    expect(screen.getByTestId("reschedule-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/confirm-reschedule/i));
    await waitFor(() =>
      expect(screen.queryByTestId("reschedule-modal")).not.toBeInTheDocument(),
    );
    expect(mockOnRescheduleSlot).toHaveBeenCalledWith(0, {
      date: "2026-07-20",
    });
  });

  it("renders cancelled session notice and hides meeting and actions", () => {
    render(
      <SessionCard
        slot={{
          status: "cancelled",
          isRescheduled: true,
          menteeMarked: false,
          mentorMarked: false,
        }}
        slotIndex={1}
        viewerRole="mentee"
        otherName="Sam"
        savingSlots={[]}
        onSetLink={mockOnSetLink}
        onMarkComplete={mockOnMarkComplete}
        onSessionComplete={mockOnSessionComplete}
        onCancelSlot={mockOnCancelSlot}
        onRescheduleSlot={mockOnRescheduleSlot}
        allSlots={[]}
        connectRequestId="req123"
      />,
    );

    expect(screen.getByTestId("cancelled-notice")).toBeInTheDocument();
    expect(screen.queryByTestId("meeting-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-actions")).not.toBeInTheDocument();
  });

  it("hides meeting link and actions when both parties have completed", () => {
    render(
      <SessionCard
        slot={{
          status: "completed",
          isRescheduled: false,
          menteeMarked: true,
          mentorMarked: true,
        }}
        slotIndex={2}
        viewerRole="mentor"
        otherName="Taylor"
        savingSlots={[]}
        onSetLink={mockOnSetLink}
        onMarkComplete={mockOnMarkComplete}
        onSessionComplete={mockOnSessionComplete}
        onCancelSlot={mockOnCancelSlot}
        onRescheduleSlot={mockOnRescheduleSlot}
        allSlots={[]}
        connectRequestId="req123"
      />,
    );

    expect(screen.getByTestId("completion-section")).toBeInTheDocument();
    expect(screen.queryByTestId("meeting-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-actions")).not.toBeInTheDocument();
  });
});
