/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ReportModal from "./ReportModal";

const mockUseReportComplaint = vi.fn();
vi.mock("@features/reports/hooks/useReportComplaint", () => ({
  default: (...args) => mockUseReportComplaint(...args),
}));

const mockValidateScreenshotFile = vi.fn();
vi.mock("@lib/validation/schemas", () => ({
  validateScreenshotFile: (...args) => mockValidateScreenshotFile(...args),
}));

const makeStore = (connect, viewerRole = "mentee") =>
  configureStore({
    reducer: {
      sharedDashboard: () => ({
        connect,
        activeTab: "report",
      }),
    },
    // A separate slice-shaped state to satisfy both selectConnectId and
    // selectViewerRole which both read from state.sharedDashboard.connect.
  });

const renderWithStore = (ui, connect = { _id: "connect-9" }) =>
  render(<Provider store={makeStore(connect)}>{ui}</Provider>);

const makeComplaintState = (overrides = {}) => ({
  submitReport: vi.fn().mockResolvedValue({ success: true }),
  submitting: false,
  error: null,
  setError: vi.fn(),
  ...overrides,
});

describe("ReportModal", () => {
  let onClose;
  let onSuccess;

  beforeAll(() => {
    globalThis.URL.createObjectURL = vi.fn(() => "blob:preview-url");
  });

  afterAll(() => {
    delete globalThis.URL.createObjectURL;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    onSuccess = vi.fn();
    mockUseReportComplaint.mockReturnValue(makeComplaintState());
    mockValidateScreenshotFile.mockReturnValue({ valid: true });
  });

  it("should render the modal header and reporting target name", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentee", mentor: { name: "Dr. House" } },
    );

    expect(screen.getByText("Report an Issue")).toBeInTheDocument();
    expect(screen.getByText("Reporting Dr. House")).toBeInTheDocument();
  });

  it("should fall back to 'Partner' when there is no connect in the store", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      null,
    );

    expect(screen.getByText("Reporting Partner")).toBeInTheDocument();
  });

  it("should fall back to 'Mentor' when viewer is mentee but mentor name is missing", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentee" },
    );

    expect(screen.getByText("Reporting Mentor")).toBeInTheDocument();
  });

  it("should show the mentee's name when viewer is a mentor", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentor", mentee: { name: "Sam Lee" } },
    );

    expect(screen.getByText("Reporting Sam Lee")).toBeInTheDocument();
  });

  it("should fall back to 'Mentee' when viewer is mentor but mentee name is missing", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentor" },
    );

    expect(screen.getByText("Reporting Mentee")).toBeInTheDocument();
  });

  it("should not include the Refund Issue option for a mentor viewer", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentor" },
    );

    expect(screen.queryByText("Refund Issue")).not.toBeInTheDocument();
  });

  it("should include the Refund Issue option for a mentee viewer", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentee" },
    );

    expect(screen.getByText(/Refund Issue/)).toBeInTheDocument();
  });

  it("should render all base complaint types", () => {
    renderWithStore(
      <ReportModal onClose={onClose} onSuccess={onSuccess} />,
      { _id: "c1", viewerRole: "mentor" },
    );

    expect(screen.getByText("Inappropriate Behavior")).toBeInTheDocument();
    expect(screen.getByText("Session Misconduct")).toBeInTheDocument();
    expect(screen.getByText("Fake or Misleading Profile")).toBeInTheDocument();
    expect(screen.getByText("Spam, Scam or Solicitation")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("should select a complaint type when clicked and show the check icon", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const option = screen.getByText("Session Misconduct").closest("button");
    await user.click(option);

    expect(option.className).toContain("bg-red-50");
  });

  it("should update the description textarea and character counter", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "Something happened");

    expect(textarea).toHaveValue("Something happened");
    expect(screen.getByText("18/1000")).toBeInTheDocument();
  });

  it("should call onClose when the header close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const closeButtons = screen.getAllByRole("button");
    const xButton = closeButtons.find((btn) => btn.querySelector("line[x1='18']"));
    await user.click(xButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the Escape key is pressed", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose for keys other than Escape", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.keyboard("{Enter}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should show a validation error and not submit when complaint type is missing", async () => {
    const submitReport = vi.fn();
    const setError = vi.fn();
    mockUseReportComplaint.mockReturnValue(
      makeComplaintState({ submitReport, setError }),
    );
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "A description long enough.");

    await user.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(setError).toHaveBeenCalledWith("Please select a complaint type.");
    expect(submitReport).not.toHaveBeenCalled();
  });

  it("should show a validation error and not submit when description is too short", async () => {
    const submitReport = vi.fn();
    const setError = vi.fn();
    mockUseReportComplaint.mockReturnValue(
      makeComplaintState({ submitReport, setError }),
    );
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByText("Session Misconduct").closest("button"));
    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "short");

    await user.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(setError).toHaveBeenCalledWith(
      "Description must be at least 10 characters.",
    );
    expect(submitReport).not.toHaveBeenCalled();
  });

  it("should submit the report with complaintType, description, and screenshot", async () => {
    const submitReport = vi.fn().mockResolvedValue({ success: true });
    mockUseReportComplaint.mockReturnValue(makeComplaintState({ submitReport }));
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByText("Session Misconduct").closest("button"));
    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "This is a detailed enough description.");

    await user.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(submitReport).toHaveBeenCalledWith({
      complaintType: "session_misconduct",
      description: "This is a detailed enough description.",
      screenshot: null,
    });
  });

  it("should call onSuccess when the report submits successfully", async () => {
    const submitReport = vi.fn().mockResolvedValue({ success: true });
    mockUseReportComplaint.mockReturnValue(makeComplaintState({ submitReport }));
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByText("Other").closest("button"));
    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "This is a detailed enough description.");

    await user.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should not call onSuccess when the report submission fails", async () => {
    const submitReport = vi.fn().mockResolvedValue({ success: false });
    mockUseReportComplaint.mockReturnValue(makeComplaintState({ submitReport }));
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    await user.click(screen.getByText("Other").closest("button"));
    const textarea = screen.getByPlaceholderText(/Please describe what happened/i);
    await user.type(textarea, "This is a detailed enough description.");

    await user.click(screen.getByRole("button", { name: "Submit Report" }));

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should render the submitting state and disable the submit/cancel buttons", () => {
    mockUseReportComplaint.mockReturnValue(makeComplaintState({ submitting: true }));
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should render the error message returned by the hook", () => {
    mockUseReportComplaint.mockReturnValue(
      makeComplaintState({ error: "Something went wrong." }),
    );
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("should show the upload prompt by default and no preview", () => {
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText("Click to upload screenshot")).toBeInTheDocument();
    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();
  });

  it("should show a preview and remove button after a valid screenshot is selected", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const file = new File(["dummy content"], "screenshot.png", {
      type: "image/png",
    });
    const input = document.getElementById("report-screenshot");

    await user.upload(input, file);

    expect(mockValidateScreenshotFile).toHaveBeenCalledWith(file);
    expect(screen.getByAltText("preview")).toHaveAttribute(
      "src",
      "blob:preview-url",
    );
    expect(
      screen.queryByText("Click to upload screenshot"),
    ).not.toBeInTheDocument();
  });

  it("should set an error and not show a preview when the screenshot is invalid", async () => {
    const setError = vi.fn();
    mockUseReportComplaint.mockReturnValue(makeComplaintState({ setError }));
    mockValidateScreenshotFile.mockReturnValue({
      valid: false,
      error: "Only JPG, PNG, or WEBP images are allowed.",
    });
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const file = new File(["dummy content"], "notes.png", {
      type: "image/png",
    });
    const input = document.getElementById("report-screenshot");

    await user.upload(input, file);

    expect(setError).toHaveBeenCalledWith(
      "Only JPG, PNG, or WEBP images are allowed.",
    );
    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();
  });

  it("should do nothing when the file input change fires without a selected file", () => {
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const input = document.getElementById("report-screenshot");
    // Fire a change event with an empty file list.
    Object.defineProperty(input, "files", { value: [], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    expect(mockValidateScreenshotFile).not.toHaveBeenCalled();
    expect(screen.getByText("Click to upload screenshot")).toBeInTheDocument();
  });

  it("should remove the screenshot preview when the remove button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const file = new File(["dummy content"], "screenshot.png", {
      type: "image/png",
    });
    const input = document.getElementById("report-screenshot");
    await user.upload(input, file);

    expect(screen.getByAltText("preview")).toBeInTheDocument();

    const removeButton = screen
      .getByAltText("preview")
      .parentElement.querySelector("button");
    await user.click(removeButton);

    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();
    expect(screen.getByText("Click to upload screenshot")).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("should open the file picker when the upload button is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(<ReportModal onClose={onClose} onSuccess={onSuccess} />);

    const input = document.getElementById("report-screenshot");
    const clickSpy = vi.spyOn(input, "click");

    await user.click(screen.getByText("Click to upload screenshot"));

    expect(clickSpy).toHaveBeenCalled();
  });
});
