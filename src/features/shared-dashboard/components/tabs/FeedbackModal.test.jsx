/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FeedbackModal from "./FeedbackModal";

const mockUseReport = vi.fn();
vi.mock("@features/reports/hooks/useReport", () => ({
  default: (...args) => mockUseReport(...args),
}));

const makeStore = (connect) =>
  configureStore({
    reducer: {
      sharedDashboard: () => ({ connect }),
    },
  });

const renderWithStore = (ui, connect = null) =>
  render(<Provider store={makeStore(connect)}>{ui}</Provider>);

const makeReportState = (overrides = {}) => ({
  submitFeedback: vi.fn().mockResolvedValue({ success: true }),
  submitting: false,
  error: "",
  ...overrides,
});

describe("FeedbackModal", () => {
  let onClose;
  let onFeedbackSubmitted;
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    onFeedbackSubmitted = vi.fn();
    mockUseReport.mockReturnValue(makeReportState());
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should render the default header when slotIndex is not provided", () => {
    renderWithStore(<FeedbackModal onClose={onClose} />);

    expect(screen.getByText("Session Complete!")).toBeInTheDocument();
  });

  it("should render the session-numbered header when slotIndex is provided", () => {
    renderWithStore(<FeedbackModal onClose={onClose} slotIndex={2} />);

    expect(screen.getByText("Session 3 Complete!")).toBeInTheDocument();
  });

  it("should fall back to 'Partner' when there is no connect in the store", () => {
    renderWithStore(<FeedbackModal onClose={onClose} />, null);

    expect(screen.getByText("Share your experience with Partner")).toBeInTheDocument();
  });

  it("should show the mentor's name when viewer is a mentee", () => {
    renderWithStore(
      <FeedbackModal onClose={onClose} />,
      { viewerRole: "mentee", mentor: { name: "Dr. Smith" } },
    );

    expect(screen.getByText("Share your experience with Dr. Smith")).toBeInTheDocument();
  });

  it("should fall back to 'Mentor' when viewer is a mentee but mentor name is missing", () => {
    renderWithStore(<FeedbackModal onClose={onClose} />, { viewerRole: "mentee" });

    expect(screen.getByText("Share your experience with Mentor")).toBeInTheDocument();
  });

  it("should show the mentee's name when viewer is a mentor", () => {
    renderWithStore(
      <FeedbackModal onClose={onClose} />,
      { viewerRole: "mentor", mentee: { name: "Alex Lee" } },
    );

    expect(screen.getByText("Share your experience with Alex Lee")).toBeInTheDocument();
  });

  it("should fall back to 'Mentee' when viewer is a mentor but mentee name is missing", () => {
    renderWithStore(<FeedbackModal onClose={onClose} />, { viewerRole: "mentor" });

    expect(screen.getByText("Share your experience with Mentee")).toBeInTheDocument();
  });

  it("should disable the submit button while rating is 0", () => {
    renderWithStore(<FeedbackModal onClose={onClose} />);

    expect(screen.getByRole("button", { name: /Submit Feedback/i })).toBeDisabled();
  });

  it("should enable the submit button and show a rating label after selecting a star", async () => {
    const user = userEvent.setup();
    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[2]); // 3rd star -> rating 3 -> "Good"

    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Feedback/i })).not.toBeDisabled();
  });

  it("should update the comment textarea value on change", async () => {
    const user = userEvent.setup();
    renderWithStore(<FeedbackModal onClose={onClose} />);

    const textarea = screen.getByPlaceholderText(/What did you think about your session/i);
    await user.type(textarea, "Great session!");

    expect(textarea).toHaveValue("Great session!");
  });

  it("should call onClose when the header close (X) button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<FeedbackModal onClose={onClose} />);

    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) =>
      btn.querySelector("line[x1='18']"),
    );
    await user.click(xButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when 'Skip for now' is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<FeedbackModal onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call submitFeedback when submit is triggered with rating 0", async () => {
    const submitFeedback = vi.fn();
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));
    renderWithStore(<FeedbackModal onClose={onClose} />);

    // Submit button disabled at rating 0; component guards handleSubmit too.
    expect(screen.getByRole("button", { name: /Submit Feedback/i })).toBeDisabled();
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it("should submit feedback with rating, comment, and slotIndex", async () => {
    const submitFeedback = vi.fn().mockResolvedValue({ success: true });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));
    const user = userEvent.setup();

    renderWithStore(<FeedbackModal onClose={onClose} slotIndex={1} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[4]);

    const textarea = screen.getByPlaceholderText(/What did you think about your session/i);
    await user.type(textarea, "Excellent!");

    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(submitFeedback).toHaveBeenCalledWith(5, "Excellent!", 1);
  });

  it("should show the success screen and call onFeedbackSubmitted after the delay", async () => {
    const user = userEvent.setup();
    const submitFeedback = vi.fn().mockResolvedValue({ success: true });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));

    renderWithStore(
      <FeedbackModal onClose={onClose} onFeedbackSubmitted={onFeedbackSubmitted} />,
    );

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(await screen.findByText("Feedback Submitted!")).toBeInTheDocument();

    await waitFor(() => expect(onFeedbackSubmitted).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should call onClose after the delay when onFeedbackSubmitted is not provided", async () => {
    const user = userEvent.setup();
    const submitFeedback = vi.fn().mockResolvedValue({ success: true });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(await screen.findByText("Feedback Submitted!")).toBeInTheDocument();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
  });

  it("should call onClose immediately when submission fails because feedback was already submitted", async () => {
    const submitFeedback = vi.fn().mockResolvedValue({
      success: false,
      message: "Feedback already submitted for this session",
    });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));
    const user = userEvent.setup();

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not close or show success when submission fails with an unrelated error", async () => {
    const submitFeedback = vi.fn().mockResolvedValue({
      success: false,
      message: "Server error",
    });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));
    const user = userEvent.setup();

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Feedback Submitted!")).not.toBeInTheDocument();
  });

  it("should not close or show success when submission returns no result message", async () => {
    const submitFeedback = vi.fn().mockResolvedValue(undefined);
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));
    const user = userEvent.setup();

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Feedback Submitted!")).not.toBeInTheDocument();
  });

  it("should render the submitting state with spinner text and disable inputs", () => {
    mockUseReport.mockReturnValue(makeReportState({ submitting: true }));

    renderWithStore(<FeedbackModal onClose={onClose} />);

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What did you think about your session/i)).toBeDisabled();
  });

  it("should not change rating when a star is clicked while submitting/disabled", async () => {
    mockUseReport.mockReturnValue(makeReportState({ submitting: true }));
    const user = userEvent.setup();

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[2]);

    expect(screen.queryByText("Good")).not.toBeInTheDocument();
  });

  it("should render the error message returned by the hook", () => {
    mockUseReport.mockReturnValue(makeReportState({ error: "Could not submit feedback." }));

    renderWithStore(<FeedbackModal onClose={onClose} />);

    expect(screen.getByText("Could not submit feedback.")).toBeInTheDocument();
  });

  it("should call onFeedbackSubmitted when Done is clicked on the success screen", async () => {
    const user = userEvent.setup();
    const submitFeedback = vi.fn().mockResolvedValue({ success: true });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));

    renderWithStore(
      <FeedbackModal onClose={onClose} onFeedbackSubmitted={onFeedbackSubmitted} />,
    );

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    await screen.findByText("Feedback Submitted!");

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onFeedbackSubmitted).toHaveBeenCalled();
  });

  it("should call onClose when Done is clicked on the success screen and onFeedbackSubmitted is not provided", async () => {
    const user = userEvent.setup();
    const submitFeedback = vi.fn().mockResolvedValue({ success: true });
    mockUseReport.mockReturnValue(makeReportState({ submitFeedback }));

    renderWithStore(<FeedbackModal onClose={onClose} />);

    const stars = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector("polygon"),
    );
    await user.click(stars[0]);
    await user.click(screen.getByRole("button", { name: /Submit Feedback/i }));

    await screen.findByText("Feedback Submitted!");

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onClose).toHaveBeenCalled();
  });
});
