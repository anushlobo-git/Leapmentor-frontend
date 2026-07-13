import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedReportTab from "./SharedReportTab";
import useReport from "@features/reports/hooks/useReport";

// Mock the custom hook layer
vi.mock("@features/reports/hooks/useReport", () => ({
  default: vi.fn(),
}));

// Mock dynamic tab sub-modals to verify callback wiring cleanly
vi.mock("@features/shared-dashboard/components/tabs/ReportModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="mock-report-modal">
      <button onClick={onClose}>Close Report</button>
      <button onClick={onSuccess}>Confirm Report Success</button>
    </div>
  ),
}));

vi.mock(
  "@features/shared-dashboard/components/tabs/ReportSuccessModal",
  () => ({
    default: ({ onBack }) => (
      <div data-testid="mock-report-success-modal">
        <button onClick={onBack}>Dismiss Success Modal</button>
      </div>
    ),
  }),
);

describe("SharedReportTab", () => {
  const defaultConnectMentee = {
    _id: "connect-111",
    viewerRole: "mentee",
    mentor: { name: "Dr. Sarah Mentor" },
    mentee: { name: "Alex Mentee" },
  };

  const baseHookValues = {
    myFeedback: null,
    theirFeedback: null,
    sessionStatus: "completed",
    loading: false,
    submitting: false,
    error: null,
    submitFeedback: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useReport.mockReturnValue(baseHookValues);
  });

  it("should render loading state spinner when hook indicates loading is true", () => {
    useReport.mockReturnValue({
      ...baseHookValues,
      loading: true,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should display NotCompletedState when the session status is not completed", () => {
    useReport.mockReturnValue({
      ...baseHookValues,
      sessionStatus: "pending",
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );
    expect(screen.getByText("Session not completed yet")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Overall Rating/i)).not.toBeInTheDocument();
  });

  it("should resolve correct target name labels based on current user viewer roles and handle missing name fallbacks", () => {
    // Branch 1: Role is mentee -> resolve to mentor name
    const { rerender } = render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );
    expect(
      screen.getByText("Rate your session with Dr. Sarah Mentor"),
    ).toBeInTheDocument();

    // Branch 2: Role is mentor -> resolve to mentee name
    const connectMentor = { ...defaultConnectMentee, viewerRole: "mentor" };
    useReport.mockReturnValue(baseHookValues);
    rerender(<SharedReportTab connect={connectMentor} reportRefreshKey={1} />);
    expect(
      screen.getByText("Rate your session with Alex Mentee"),
    ).toBeInTheDocument();

    // Branch 3: Falsy fallback strings resolution if names objects are completely missing
    const namelessConnect = {
      _id: "connect-222",
      viewerRole: "mentee",
      mentor: null,
      mentee: null,
    };
    rerender(
      <SharedReportTab connect={namelessConnect} reportRefreshKey={1} />,
    );
    expect(
      screen.getByText("Rate your session with Mentor"),
    ).toBeInTheDocument();

    const namelessMentorConnect = {
      _id: "connect-222",
      viewerRole: "mentor",
      mentor: null,
      mentee: null,
    };
    rerender(
      <SharedReportTab connect={namelessMentorConnect} reportRefreshKey={1} />,
    );
    expect(
      screen.getByText("Rate your session with Mentee"),
    ).toBeInTheDocument();
  });

  it("should ignore submission events if rating value has not been chosen yet", () => {
    const mockSubmitFeedback = vi.fn();
    useReport.mockReturnValue({
      ...baseHookValues,
      submitFeedback: mockSubmitFeedback,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Submit Feedback/i,
    });
    expect(submitButton).toBeDisabled();

    // Bypass disabled element gate to check safety early-return coverage explicitly
    fireEvent.click(submitButton);
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  it("should update form text inputs, select star ratings, and display live contextual rating labels", async () => {
    const user = userEvent.setup();
    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    // Click the 4th star button element
    const starButtons = screen.getAllByRole("button");
    // Initial buttons: index 0 is Report button, index 1-5 are stars
    await user.click(starButtons[4]); // Click 4th star (value 4)

    expect(screen.getByText("Great")).toBeInTheDocument();

    const commentArea = screen.getByPlaceholderText(
      /Share what you thought about your session/i,
    );
    await user.type(commentArea, "Amazing structural code insights.");
    expect(commentArea).toHaveValue("Amazing structural code insights.");
  });

  it("should handle smooth feedback submission workflow and transition layout onto success notifications banners", async () => {
    const user = userEvent.setup();
    const mockSubmitFeedback = vi.fn().mockResolvedValue({ success: true });

    useReport.mockReturnValue({
      ...baseHookValues,
      submitFeedback: mockSubmitFeedback,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    // Select star and type text comment parameters
    const starButtons = screen.getAllByRole("button");
    await user.click(starButtons[5]); // Click 5th star (value 5 -> Excellent)

    const commentArea = screen.getByPlaceholderText(
      /Share what you thought about your session/i,
    );
    await user.type(commentArea, "Splendid session guidance.");

    const submitButton = screen.getByRole("button", {
      name: /Submit Feedback/i,
    });
    await user.click(submitButton);

    expect(mockSubmitFeedback).toHaveBeenCalledWith(
      5,
      "Splendid session guidance.",
    );
    expect(
      await screen.findByText("Feedback submitted successfully!"),
    ).toBeInTheDocument();
  });

  it("should ignore state transitions if submitFeedback action resolves unsuccessfully", async () => {
    const user = userEvent.setup();
    const mockSubmitFeedback = vi.fn().mockResolvedValue({ success: false });

    useReport.mockReturnValue({
      ...baseHookValues,
      submitFeedback: mockSubmitFeedback,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    const starButtons = screen.getAllByRole("button");
    await user.click(starButtons[3]); // Click 3rd star

    const submitButton = screen.getByRole("button", {
      name: /Submit Feedback/i,
    });
    await user.click(submitButton);

    expect(
      screen.queryByText("Feedback submitted successfully!"),
    ).not.toBeInTheDocument();
  });

  it("should block interactive updates when submitting flag evaluates to true", () => {
    useReport.mockReturnValue({
      ...baseHookValues,
      submitting: true,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Share what you thought about your session/i),
    ).toBeDisabled();
  });

  it("should display server error messages under form layout boundaries if present", () => {
    useReport.mockReturnValue({
      ...baseHookValues,
      error: "Timeout exception communication failure rule.",
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );
    expect(
      screen.getByText("Timeout exception communication failure rule."),
    ).toBeInTheDocument();
  });

  it("should ignore star input selections if rating control is configuration locked to disabled", async () => {
    const user = userEvent.setup();
    useReport.mockReturnValue({
      ...baseHookValues,
      submitting: true, // This sets disabled true inside StarRatingInput context
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    const starButtons = screen.getAllByRole("button");
    // Verify star buttons carry structural HTML disabled tags
    expect(starButtons[1]).toBeDisabled();
  });

  it("should display submitted cards when feedback history arrays exist, covering custom feedback card fields", () => {
    const mockMyFeedback = {
      rating: 4,
      comment: "Solid architecture ideas.",
      createdAt: "2026-07-13T12:00:00.000Z",
    };
    const mockTheirFeedback = {
      rating: 5,
      comment: "", // Falsy comment conditional check coverage
      createdAt: "2026-07-13T15:30:00.000Z",
    };

    useReport.mockReturnValue({
      ...baseHookValues,
      myFeedback: mockMyFeedback,
      theirFeedback: mockTheirFeedback,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    expect(screen.getByText("Your Feedback")).toBeInTheDocument();
    expect(screen.getByText(`"Solid architecture ideas."`)).toBeInTheDocument();
    expect(
      screen.getByText("Feedback from Dr. Sarah Mentor"),
    ).toBeInTheDocument();

    // Verify total star count displays exist for read-only layers
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("should display waiting placeholder notice panel if their feedback data returns empty or null", () => {
    useReport.mockReturnValue({
      ...baseHookValues,
      myFeedback: {
        rating: 5,
        comment: "Done",
        createdAt: "2026-07-13T12:00:00.000Z",
      },
      theirFeedback: null,
    });

    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );
    expect(
      screen.getByText("Waiting for Dr. Sarah Mentor to submit their feedback"),
    ).toBeInTheDocument();
  });

  it("should guide workflows through report modal view lifecycles and trigger accurate sub-state modifications", async () => {
    const user = userEvent.setup();
    render(
      <SharedReportTab connect={defaultConnectMentee} reportRefreshKey={1} />,
    );

    const reportTabTriggerBtn = screen.getByRole("button", { name: /Report/i });
    expect(screen.queryByTestId("mock-report-modal")).not.toBeInTheDocument();

    // Trigger report layout expansion
    await user.click(reportTabTriggerBtn);
    expect(screen.getByTestId("mock-report-modal")).toBeInTheDocument();

    // Close callback flow evaluation
    const closeBtn = screen.getByRole("button", { name: "Close Report" });
    await user.click(closeBtn);
    expect(screen.queryByTestId("mock-report-modal")).not.toBeInTheDocument();

    // Re-open and verify successful confirmation loop adjustments
    await user.click(reportTabTriggerBtn);
    const successTriggerBtn = screen.getByRole("button", {
      name: "Confirm Report Success",
    });
    await user.click(successTriggerBtn);

    // Should swap layout to report success modal screen
    expect(screen.queryByTestId("mock-report-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-report-success-modal")).toBeInTheDocument();

    // Dismiss the success notification modal view completely
    const dismissBtn = screen.getByRole("button", {
      name: "Dismiss Success Modal",
    });
    await user.click(dismissBtn);
    expect(
      screen.queryByTestId("mock-report-success-modal"),
    ).not.toBeInTheDocument();
  });
});
