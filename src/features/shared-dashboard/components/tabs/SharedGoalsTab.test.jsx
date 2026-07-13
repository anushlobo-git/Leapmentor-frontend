import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SharedGoalsTab from "./SharedGoalsTab";
import { useDispatch, useSelector } from "react-redux";
import { getConnectDetail } from "@features/shared-dashboard/api/shared-dashboard.api";
import useGoals from "@features/goals/hooks/useGoals";
import useSessions from "@features/sessions/hooks/useSessions";
import useReport from "@features/reports/hooks/useReport";
import {
  selectConnect,
  selectConnectId,
  selectViewerRole,
} from "@features/shared-dashboard/store/sharedDashboardSlice";

// ── 1. External Modules & Sub-component Mock Layer ──────────────────────────
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("@features/shared-dashboard/store/sharedDashboardSlice", () => ({
  selectConnect: vi.fn(),
  selectConnectId: vi.fn(),
  selectViewerRole: vi.fn(),
  setConnect: vi.fn((payload) => ({ type: "dashboard/setConnect", payload })),
}));

vi.mock("@features/shared-dashboard/api/shared-dashboard.api", () => ({
  getConnectDetail: vi.fn(),
}));

vi.mock("@features/goals/hooks/useGoals", () => ({
  default: vi.fn(),
}));

vi.mock("@features/sessions/hooks/useSessions", () => ({
  default: vi.fn(),
}));

vi.mock("@features/reports/hooks/useReport", () => ({
  default: vi.fn(),
}));

// Mock child elements to cleanly verify prop forwarding contracts
vi.mock("@features/goals/components/GoalForm", () => ({
  default: ({ initial, onSave, onCancel }) => (
    <div data-testid="mock-goal-form">
      <button onClick={() => onSave({ title: "Form Title Action" })}>
        Save Form
      </button>
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}));

vi.mock("@features/goals/components/TimelineTracker", () => ({
  default: () => <div data-testid="mock-timeline-tracker" />,
}));

vi.mock("@features/goals/components/MilestoneList", () => ({
  default: ({ onAdd, onToggle, onDelete }) => (
    <div data-testid="mock-milestone-list">
      <button onClick={onAdd}>Add Milestone</button>
      <button onClick={onToggle}>Toggle Milestone</button>
      <button onClick={onDelete}>Delete Milestone</button>
    </div>
  ),
}));

vi.mock("@features/goals/components/SessionCard", () => ({
  default: ({
    slot,
    onSetLink,
    onMarkComplete,
    onSessionComplete,
    onCancelSlot,
    onRescheduleSlot,
  }) => (
    <div data-testid="mock-session-card">
      <span>{slot.title}</span>
      <button onClick={() => onSetLink("link-id", "url")}>Set Link</button>
      <button onClick={() => onMarkComplete("slot-id")}>Mark Complete</button>
      <button onClick={onSessionComplete}>Trigger Session Complete</button>
      <button onClick={() => onCancelSlot("slot-id")}>Cancel Slot</button>
      <button onClick={() => onRescheduleSlot("slot-id")}>
        Reschedule Slot
      </button>
    </div>
  ),
}));

vi.mock("@features/shared-dashboard/components/tabs/FeedbackModal", () => ({
  default: ({ onClose, onFeedbackSubmitted }) => (
    <div data-testid="mock-feedback-modal">
      <button onClick={onClose}>Close Feedback</button>
      <button onClick={onFeedbackSubmitted}>Submit Feedback Callback</button>
    </div>
  ),
}));

describe("SharedGoalsTab Layout Suite", () => {
  let mockDispatch;
  let defaultGoalsHook;
  let defaultSessionsHook;
  let defaultReportHook;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn().mockResolvedValue({ type: "mock/action" });
    useDispatch.mockReturnValue(mockDispatch);

    // Explicitly check function object reference identity matching for store selection queries
    useSelector.mockImplementation((selectorFn) => {
      if (selectorFn === selectConnectId) return "mock-connect-id-123";
      if (selectorFn === selectViewerRole) return "mentee";
      if (selectorFn === selectConnect) {
        return {
          mentor: { name: "Alex Mentor" },
          mentee: { name: "Chris Mentee" },
        };
      }
      return null;
    });

    // Generate isolated fallback reference layers for internal custom hook layers
    defaultGoalsHook = {
      goal: null,
      milestones: [],
      loading: false,
      error: null,
      saving: false,
      createGoal: vi.fn().mockResolvedValue({ success: true }),
      updateGoal: vi.fn().mockResolvedValue({ success: true }),
      addMilestone: vi.fn(),
      toggleMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
    };

    defaultSessionsHook = {
      slots: [],
      loading: false,
      savingSlots: false,
      error: null,
      completedSlots: 0,
      totalSlots: 0,
      progress: 0,
      setMeetingLink: vi.fn(),
      markSlotComplete: vi.fn(),
      cancelSlot: vi.fn(),
      rescheduleSlot: vi.fn(),
    };

    defaultReportHook = {
      myFeedback: null,
      loading: false,
      refetch: vi.fn(),
    };

    useGoals.mockReturnValue(defaultGoalsHook);
    useSessions.mockReturnValue(defaultSessionsHook);
    useReport.mockReturnValue(defaultReportHook);
  });

  // ── 2. Loading State Paths ─────────────────────────────────────────────────
  it("should output loading placeholder skeleton trees when any custom hook signals fetching state", () => {
    defaultGoalsHook.loading = true;
    useGoals.mockReturnValue(defaultGoalsHook);

    const { container } = render(<SharedGoalsTab />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
    expect(screen.queryByText("Goals & Milestones")).not.toBeInTheDocument();
  });

  // ── 3. Error Boundary Render Controls ──────────────────────────────────────
  it("should format layout warning tags cleanly when core exceptions occur", () => {
    defaultGoalsHook.error = "Goal tracking processing failure exception rule";
    useGoals.mockReturnValue(defaultGoalsHook);

    render(<SharedGoalsTab />);
    expect(
      screen.getByText("Goal tracking processing failure exception rule"),
    ).toBeInTheDocument();
  });

  // ── 4. Goal Cards Status Styling & Pluralization Edge Cases ────────────────
  it("should render GoalCard details and manage fallback styling configurations for active vs completed goals", () => {
    defaultGoalsHook.goal = {
      title: "Target Master Goal",
      description: "Context details",
      status: "completed",
    };
    defaultSessionsHook.slots = [
      { _id: "s1", status: "active", title: "Mentorship Session" },
    ];
    defaultSessionsHook.completedSlots = 1;
    defaultSessionsHook.totalSlots = 1;
    defaultSessionsHook.progress = 100;

    useGoals.mockReturnValue(defaultGoalsHook);
    useSessions.mockReturnValue(defaultSessionsHook);

    render(<SharedGoalsTab />);

    expect(screen.getByText("Target Master Goal")).toBeInTheDocument();
    expect(screen.getByText("Context details")).toBeInTheDocument();

    // Validate Singular text form formatting contract matches total slots rule
    expect(
      screen.getByText("1 of 1 session completed by both parties"),
    ).toBeInTheDocument();

    const badgeElement = screen.getByText("completed");
    expect(badgeElement).toHaveClass("bg-green-50", "text-green-600");
  });

  it("should apply target red layout styles when primary goals are flagged as abandoned status configurations", () => {
    defaultGoalsHook.goal = {
      title: "Abandoned Target Goal",
      status: "abandoned",
    };
    useGoals.mockReturnValue(defaultGoalsHook);

    render(<SharedGoalsTab />);

    const badgeElement = screen.getByText("abandoned");
    expect(badgeElement).toHaveClass("bg-red-50", "text-red-500");
  });

  // ── 5. Unset Initial Goals Flows ───────────────────────────────────────────
  it("should trigger inline form views when hitting fallback creation controls", () => {
    render(<SharedGoalsTab />);

    expect(screen.getByText("No goal set yet")).toBeInTheDocument();

    const fallbackCreateBtn = screen.getByRole("button", { name: /Set Goal/i });
    fireEvent.click(fallbackCreateBtn);

    expect(screen.getByTestId("mock-goal-form")).toBeInTheDocument();
  });

  // ── 6. Form Updates & Callback Handling Operations ─────────────────────────
  it("should route structural parameters to creation hooks when saving new goal structures", async () => {
    render(<SharedGoalsTab />);
    fireEvent.click(screen.getByRole("button", { name: /Set Goal/i }));

    const saveBtn = screen.getByRole("button", { name: "Save Form" });
    fireEvent.click(saveBtn);

    expect(defaultGoalsHook.createGoal).toHaveBeenCalledWith({
      title: "Form Title Action",
    });
    await waitFor(() => {
      expect(screen.queryByTestId("mock-goal-form")).not.toBeInTheDocument();
    });
  });

  it("should route execution parameters to update hooks when manipulating existing goal models", async () => {
    defaultGoalsHook.goal = {
      _id: "goal-uid-99",
      title: "Initial Title",
      status: "active",
    };
    useGoals.mockReturnValue(defaultGoalsHook);

    render(<SharedGoalsTab />);
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    fireEvent.click(screen.getByRole("button", { name: "Save Form" }));

    expect(defaultGoalsHook.updateGoal).toHaveBeenCalledWith("goal-uid-99", {
      title: "Form Title Action",
    });
    await waitFor(() => {
      expect(screen.queryByTestId("mock-goal-form")).not.toBeInTheDocument();
    });
  });

  it("should collapse form containers without adjustments when cancelling manual inputs", () => {
    render(<SharedGoalsTab />);
    fireEvent.click(screen.getByRole("button", { name: /Set Goal/i }));

    fireEvent.click(screen.getByRole("button", { name: "Cancel Form" }));
    expect(screen.queryByTestId("mock-goal-form")).not.toBeInTheDocument();
  });

  // ── 7. Overall Progress Controls & Auto-Fading Warnings ────────────────────
  it("should prompt feedback presentation widgets if target session counts hit complete parameters", () => {
    defaultSessionsHook.slots = [{ _id: "s1", status: "completed" }];
    defaultSessionsHook.completedSlots = 0;
    defaultSessionsHook.totalSlots = 2;
    defaultSessionsHook.progress = 100;
    useSessions.mockReturnValue(defaultSessionsHook);

    render(<SharedGoalsTab />);

    // Plural check validation
    expect(
      screen.getByText("0 of 2 sessions completed by both parties"),
    ).toBeInTheDocument();

    const leaveFeedbackBtn = screen.getByRole("button", {
      name: "Leave Feedback",
    });
    fireEvent.click(leaveFeedbackBtn);

    expect(screen.getByTestId("mock-feedback-modal")).toBeInTheDocument();
  });

  it("should throw a temporary auto-clearing notice if feedback submission entries were locked already", () => {
    vi.useFakeTimers();
    defaultSessionsHook.slots = [{ _id: "s1", status: "completed" }];
    defaultSessionsHook.progress = 100;
    defaultReportHook.myFeedback = { rating: 5, note: "Perfect core run" };

    useSessions.mockReturnValue(defaultSessionsHook);
    useReport.mockReturnValue(defaultReportHook);

    render(<SharedGoalsTab />);

    const feedbackSubmittedBtn = screen.getByRole("button", {
      name: "Feedback Submitted",
    });
    fireEvent.click(feedbackSubmittedBtn);

    expect(
      screen.getByText("You've already submitted feedback for this session"),
    ).toBeInTheDocument();

    // Wrap in core act block safely using the testing library instance
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("You've already submitted feedback for this session"),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  // ── 8. Milestone Propagation Validations ───────────────────────────────────
  it("should wrap milestone interaction listeners accurately down onto list implementations", () => {
    defaultGoalsHook.goal = {
      title: "Core Goal Layout Structure",
      status: "active",
    };
    useGoals.mockReturnValue(defaultGoalsHook);

    render(<SharedGoalsTab />);

    fireEvent.click(screen.getByRole("button", { name: "Add Milestone" }));
    expect(defaultGoalsHook.addMilestone).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Toggle Milestone" }));
    expect(defaultGoalsHook.toggleMilestone).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete Milestone" }));
    expect(defaultGoalsHook.deleteMilestone).toHaveBeenCalled();
  });

  // ── 9. Inner Session Cards Propagation Mappers ─────────────────────────────
  it("should register array listings and tie operation controls tightly over child session items", () => {
    defaultSessionsHook.slots = [
      { _id: "slot-idx-1", title: "Target Session Row Spec", status: "active" },
    ];
    useSessions.mockReturnValue(defaultSessionsHook);

    render(<SharedGoalsTab />);

    expect(screen.getByText("Target Session Row Spec")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Set Link" }));
    expect(defaultSessionsHook.setMeetingLink).toHaveBeenCalledWith(
      "link-id",
      "url",
    );

    fireEvent.click(screen.getByRole("button", { name: "Mark Complete" }));
    expect(defaultSessionsHook.markSlotComplete).toHaveBeenCalledWith(
      "slot-id",
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel Slot" }));
    expect(defaultSessionsHook.cancelSlot).toHaveBeenCalledWith("slot-id");

    fireEvent.click(screen.getByRole("button", { name: "Reschedule Slot" }));
    expect(defaultSessionsHook.rescheduleSlot).toHaveBeenCalledWith("slot-id");

    fireEvent.click(
      screen.getByRole("button", { name: "Trigger Session Complete" }),
    );
    expect(screen.getByTestId("mock-feedback-modal")).toBeInTheDocument();
  });

  // ── 10. Feedback Flow Operations ───────────────────────────────────────────
  it("should sync changes cleanly and clear overlays upon modal close trigger paths", () => {
    defaultSessionsHook.slots = [{ _id: "s1" }];
    useSessions.mockReturnValue(defaultSessionsHook);

    render(<SharedGoalsTab />);
    fireEvent.click(
      screen.getByRole("button", { name: "Trigger Session Complete" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Close Feedback" }));
    expect(screen.queryByTestId("mock-feedback-modal")).not.toBeInTheDocument();
  });

  it("should fetch reports summary logs again when a modal confirms complete execution", () => {
    defaultSessionsHook.slots = [{ _id: "s1" }];
    useSessions.mockReturnValue(defaultSessionsHook);

    render(<SharedGoalsTab />);
    fireEvent.click(
      screen.getByRole("button", { name: "Trigger Session Complete" }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Submit Feedback Callback" }),
    );

    expect(defaultReportHook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("mock-feedback-modal")).not.toBeInTheDocument();
  });

  // ── 11. Async Lifecycle Background Chains Coverage ─────────────────────────
  it("should test onAllComplete lifecycle callback operations without breaking execution lines", async () => {
    let capturedCallback;
    useSessions.mockImplementationOnce((id, onCompleteCb) => {
      capturedCallback = onCompleteCb;
      return defaultSessionsHook;
    });

    render(<SharedGoalsTab />);
    expect(capturedCallback).toBeDefined();

    // Trigger completion handler logic loop paths
    getConnectDetail.mockResolvedValueOnce({
      data: { connect: { id: "refreshed-payload" } },
    });

    await capturedCallback();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "dashboard/setConnect",
      payload: { id: "refreshed-payload" },
    });
  });

  it("should process error handling routes quietly when background updates trigger exceptions", async () => {
    let capturedCallback;
    useSessions.mockImplementationOnce((id, onCompleteCb) => {
      capturedCallback = onCompleteCb;
      return defaultSessionsHook;
    });

    render(<SharedGoalsTab />);
    getConnectDetail.mockSelectedValue = undefined;
    getConnectDetail.mockRejectedValueOnce(new Error("silent-fail-branch"));

    // Ensure promise rejection does not raise unhandled crash paths
    await expect(capturedCallback()).resolves.not.toThrow();
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.any(Object));
  });
});
