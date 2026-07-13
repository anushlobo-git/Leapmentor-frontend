import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MeetingLinkSection from "./MeetingLinkSection";
import { isValidMeetingLink } from "@features/goals/utils/sessionCardUtils";

// ── 1. Mock External Modules & Utilities ──────────────────────────────────
vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  isValidMeetingLink: vi.fn(() => true),
}));

vi.mock("@features/goals/utils/sessionCardPropTypes", () => ({
  slotShape: { isRequired: () => {} },
}));

describe("MeetingLinkSection", () => {
  const mockOnSetLink = vi.fn();
  const defaultProps = {
    slot: { meetingLink: "" },
    viewerRole: "mentee",
    onSetLink: mockOnSetLink,
    saving: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render States & Branch Matrix Path Routing ──────────────────────────
  it("should render placeholder text when no link exists and viewer is a non-mentor", () => {
    render(<MeetingLinkSection {...defaultProps} viewerRole="mentee" />);

    expect(screen.getByText("No meeting link added yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Add Meeting Link/i }),
    ).not.toBeInTheDocument();
  });

  it("should render call-to-action button when no link exists and viewer is a mentor", async () => {
    const user = userEvent.setup();
    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);

    const addBtn = screen.getByRole("button", { name: /Add Meeting Link/i });
    expect(addBtn).toBeInTheDocument();

    await user.click(addBtn);
    expect(
      screen.getByPlaceholderText("https://meet.google.com/..."),
    ).toBeInTheDocument();
  });

  it("should display meeting link as anchor tag without edit option for non-mentors", () => {
    const slotWithLink = {
      meetingLink: "https://meet.google.com/abc-defg-hij",
    };
    render(
      <MeetingLinkSection
        {...defaultProps}
        slot={slotWithLink}
        viewerRole="mentee"
      />,
    );

    const linkElement = screen.getByRole("link", {
      name: "https://meet.google.com/abc-defg-hij",
    });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      "href",
      "https://meet.google.com/abc-defg-hij",
    );
    expect(
      screen.queryByRole("button", { name: /Edit/i }),
    ).not.toBeInTheDocument();
  });

  it("should show edit trigger button next to anchor tag reference when viewer is a mentor", async () => {
    const user = userEvent.setup();
    const slotWithLink = { meetingLink: "https://zoom.us/j/12345" };
    render(
      <MeetingLinkSection
        {...defaultProps}
        slot={slotWithLink}
        viewerRole="mentor"
      />,
    );

    expect(
      screen.getByRole("link", { name: "https://zoom.us/j/12345" }),
    ).toBeInTheDocument();
    const editBtn = screen.getByRole("button", { name: /Edit/i });
    expect(editBtn).toBeInTheDocument();

    await user.click(editBtn);
    const textInput = screen.getByRole("textbox");
    expect(textInput).toHaveValue("https://zoom.us/j/12345");
  });

  // ── Validation Bounds & Error State Sub-Paths ────────────────────────────
  it("should block empty or space-filled entries via Enter key and yield specific field error text logs", async () => {
    const user = userEvent.setup();
    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);

    await user.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const textInput = screen.getByRole("textbox");
    // Hitting enter bypasses the disabled click rule state to trigger the code coverage branch
    await user.type(textInput, "   {Enter}");

    expect(screen.getByText("Link cannot be empty")).toBeInTheDocument();
    expect(mockOnSetLink).not.toHaveBeenCalled();
  });

  it("should display format standard rejection feedback when URL parser checks fail", async () => {
    const user = userEvent.setup();
    vi.mocked(isValidMeetingLink).mockReturnValueOnce(false);

    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);
    await user.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const textInput = screen.getByRole("textbox");
    await user.type(textInput, "http://insecure-http-address.com");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText(
        "Only HTTPS links from Google Meet, Zoom etc are allowed.",
      ),
    ).toBeInTheDocument();
    expect(mockOnSetLink).not.toHaveBeenCalled();

    await user.type(textInput, "a");
    expect(
      screen.queryByText(
        "Only HTTPS links from Google Meet, Zoom etc are allowed.",
      ),
    ).not.toBeInTheDocument();
  });

  // ── Form Interactions & Save Cycle Controls ─────────────────────────────
  it("should roll back edit mode and flush transient errors when cancel buttons are selected", async () => {
    const user = userEvent.setup();
    const slotWithLink = {
      meetingLink: "https://meet.google.com/initial-link",
    };
    render(
      <MeetingLinkSection
        {...defaultProps}
        slot={slotWithLink}
        viewerRole="mentor"
      />,
    );

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const textInput = screen.getByRole("textbox");
    await user.clear(textInput);
    await user.type(textInput, "invalid-link");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "https://meet.google.com/initial-link",
      }),
    ).toBeInTheDocument();
  });

  it("should lock submission keys and output loader labels during layout processing streams", () => {
    render(
      <MeetingLinkSection
        {...defaultProps}
        viewerRole="mentor"
        saving={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const saveBtn = screen.getByRole("button", { name: "Saving..." });
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();
  });

  it("should successfully exit edit mode if server synchronization actions resolve successfully", async () => {
    const user = userEvent.setup();
    mockOnSetLink.mockResolvedValueOnce({ success: true });

    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);
    await user.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const textInput = screen.getByRole("textbox");
    await user.type(textInput, "https://meet.google.com/valid-synced-link");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockOnSetLink).toHaveBeenCalledWith(
      "https://meet.google.com/valid-synced-link",
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("should remain in edit mode frame if server return metrics indicate failure outputs", async () => {
    const user = userEvent.setup();
    mockOnSetLink.mockResolvedValueOnce({ success: false });

    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);
    await user.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const textInput = screen.getByRole("textbox");
    await user.type(textInput, "https://meet.google.com/failed-sync-link");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockOnSetLink).toHaveBeenCalledWith(
      "https://meet.google.com/failed-sync-link",
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should intercept keypress updates and fire validation tracking when the Enter key is down", async () => {
    const user = userEvent.setup();
    mockOnSetLink.mockResolvedValueOnce({ success: true });

    render(<MeetingLinkSection {...defaultProps} viewerRole="mentor" />);
    await user.click(screen.getByRole("button", { name: /Add Meeting Link/i }));

    const textInput = screen.getByRole("textbox");
    await user.type(textInput, "https://meet.google.com/enter-key-link{Enter}");

    expect(mockOnSetLink).toHaveBeenCalledWith(
      "https://meet.google.com/enter-key-link",
    );
  });
});
