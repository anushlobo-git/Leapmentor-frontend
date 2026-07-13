import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedHomeTab from "./SharedHomeTab";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  selectConnect,
  setActiveTab,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import { formatFullSlot, formatDateString } from "@lib/formatters/dateTime";

// ── 1. Mock External Modules & Sub-Components ─────────────────────────────
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("@features/shared-dashboard/store/sharedDashboardSlice", () => ({
  selectConnect: vi.fn(),
  setActiveTab: vi.fn((tab) => ({
    type: "sharedDashboard/setActiveTab",
    payload: tab,
  })),
}));

vi.mock("@lib/formatters/dateTime", () => ({
  formatFullSlot: vi.fn((slot) => `FormattedSlot-${slot.date || "confirmed"}`),
  formatDateString: vi.fn((date) => `FormattedDate-${date}`),
}));

vi.mock("@features/shared-dashboard/components/tabs/ReportModal", () => ({
  default: ({ onClose, onSuccess }) => (
    <div data-testid="report-modal">
      <button onClick={onClose}>Close Report</button>
      <button onClick={onSuccess}>Submit Success</button>
    </div>
  ),
}));

vi.mock(
  "@features/shared-dashboard/components/tabs/ReportSuccessModal",
  () => ({
    default: ({ onBack }) => (
      <div data-testid="report-success-modal">
        <span>Report Sent Successfully</span>
        <button onClick={onBack}>Back From Success</button>
      </div>
    ),
  }),
);

describe("SharedHomeTab", () => {
  const mockDispatch = vi.fn();
  const mockSetSearchParams = vi.fn();

  const mockMentorProfile = {
    profilePicture: "https://example.com/mentor.jpg",
    currentRole: "Principal Architect",
    company: "Cloud Security Corp",
    skills: ["AWS", "Kubernetes", "Golang", "Terraform"],
  };

  const mockMenteeProfile = {
    profilePicture: "",
    currentRole: "Junior Developer",
    company: "StartUp Inc",
    skills: ["React", "TypeScript"],
  };

  const mockConnectData = {
    mentor: { name: "Alice Vance" },
    mentee: { name: "Bob Xavier" },
    mentorProfile: mockMentorProfile,
    menteeProfile: mockMenteeProfile,
    confirmedSlot: { date: "2026-08-12", startTime: "10:00", endTime: "11:00" },
    totalAmount: 45,
    paidAt: "2026-07-10T09:00:00.000Z",
    status: "active",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);
    vi.mocked(useSelector).mockImplementation((selector) => {
      if (selector === selectConnect) return mockConnectData;
      return null;
    });
  });

  // ── Baseline Guardrails & Structural Layout Matrix ───────────────────────
  it("should return null safely if connect store lookup maps out empty or falsy metrics", () => {
    vi.mocked(useSelector).mockReturnValueOnce(null);
    const { container } = render(<SharedHomeTab />);
    expect(container.firstChild).toBeNull();
  });

  it("should display core structural participant identity components and format strings flawlessly", () => {
    render(<SharedHomeTab />);

    expect(screen.getByText("Overview")).toBeInTheDocument();

    // Mentor Card checks
    expect(screen.getByText("Alice Vance")).toBeInTheDocument();
    expect(
      screen.getByText("Principal Architect @ Cloud Security Corp"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Alice Vance")).toHaveAttribute(
      "src",
      "https://example.com/mentor.jpg",
    );
    // Verify skill truncation slicing layout rules (slice 0 to 3 max items)
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Golang")).toBeInTheDocument();
    expect(screen.queryByText("Terraform")).not.toBeInTheDocument();

    // Mentee Card checks (Triggers fallback initials rendering cleanly)
    expect(screen.getByText("Bob Xavier")).toBeInTheDocument();
    expect(screen.getByText("BX")).toBeInTheDocument();
    expect(
      screen.getByText("Junior Developer @ StartUp Inc"),
    ).toBeInTheDocument();
  });

  // ── Conditional Formatting & Variation Branches ─────────────────────────
  it("should evaluate alternative person text structures when company fields or role descriptions map out empty", () => {
    const limitedProfileConnect = {
      ...mockConnectData,
      mentorProfile: { ...mockMentorProfile, company: "" },
      menteeProfile: { ...mockMenteeProfile, currentRole: "" },
    };
    vi.mocked(useSelector).mockReturnValueOnce(limitedProfileConnect);

    render(<SharedHomeTab />);

    expect(screen.getByText("Principal Architect")).toBeInTheDocument();
    expect(screen.getByText("StartUp Inc")).toBeInTheDocument();
  });

  it("should render gradient variants dynamically across codePoint index changes to cover background branches", () => {
    const customizedNamesConnect = {
      ...mockConnectData,
      mentor: { name: "Zack King" },
      mentee: { name: "Eick Knight" },
      mentorProfile: { ...mockMentorProfile, profilePicture: "" }, // Clear picture so Zack falls back to initials
      menteeProfile: { ...mockMenteeProfile, profilePicture: "" },
    };
    vi.mocked(useSelector).mockReturnValueOnce(customizedNamesConnect);

    render(<SharedHomeTab />);

    // Multi-word names produce two-letter initials through the internal split/map reducer layout mechanism
    expect(screen.getByText("ZK")).toBeInTheDocument();
    expect(screen.getByText("EK")).toBeInTheDocument();
  });

  it("should substitute image elements automatically with text bubbles if onError event hooks fire", () => {
    render(<SharedHomeTab />);

    const mentorImg = screen.getByAltText("Alice Vance");
    fireEvent.error(mentorImg);

    expect(screen.queryByAltText("Alice Vance")).not.toBeInTheDocument();
    expect(screen.getByText("AV")).toBeInTheDocument();
  });

  // ── Session Allocation Details Branch Conditions ────────────────────────
  it("should default tracking loops onto single confirmed fallback slots if structural slots lists are empty", () => {
    render(<SharedHomeTab slots={[]} />);

    expect(screen.getByText("Confirmed Session")).toBeInTheDocument();
    expect(screen.getByText("FormattedSlot-2026-08-12")).toBeInTheDocument();
  });

  it("should render complex mapping sequences when explicit items arrays are populated with completions indicators", () => {
    const activeSlotsList = [
      {
        date: "2026-09-01",
        startTime: "14:00",
        endTime: "15:00",
        status: "pending",
      },
      {
        date: "2026-09-02",
        startTime: "16:00",
        endTime: "17:00",
        status: "completed",
      },
    ];

    render(<SharedHomeTab slots={activeSlotsList} />);

    expect(screen.getByText("Session 1")).toBeInTheDocument();
    expect(screen.getByText("FormattedSlot-2026-09-01")).toBeInTheDocument();

    expect(screen.getByText("Session 2 ✓")).toBeInTheDocument();
    expect(screen.getByText("FormattedSlot-2026-09-02")).toBeInTheDocument();
  });

  it("should hide token indicators and booking timeline paths gracefully when original numeric indices resolve null or undefined", () => {
    const strippedMetricsConnect = {
      ...mockConnectData,
      totalAmount: null,
      paidAt: undefined,
    };
    vi.mocked(useSelector).mockReturnValueOnce(strippedMetricsConnect);

    render(<SharedHomeTab />);

    expect(screen.queryByText(/Tokens in Escrow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Session Booked On/i)).not.toBeInTheDocument();
  });

  // ── Interaction Actions & Quick Tabs Switching Navigation Matrix ─────────
  it("should transition target navigation tabs and sync search parameters cleanly during click actions", async () => {
    const user = userEvent.setup();
    render(<SharedHomeTab />);

    const openChatBtn = screen.getByRole("button", { name: "Open Chat" });
    await user.click(openChatBtn);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("chat"));
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      { tab: "chat" },
      { replace: true },
    );

    const setGoalsBtn = screen.getByRole("button", { name: "Set Goals" });
    await user.click(setGoalsBtn);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("goals"));
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      { tab: "goals" },
      { replace: true },
    );
  });

  it("should completely eliminate notes modification triggers if the current runtime state index translates to completed", () => {
    const completedSessionConnect = { ...mockConnectData, status: "completed" };
    vi.mocked(useSelector).mockReturnValueOnce(completedSessionConnect);

    render(<SharedHomeTab />);

    expect(
      screen.queryByRole("button", { name: "Notes" }),
    ).not.toBeInTheDocument();
  });

  it("should include notes action controls if the session is running under live conditions", async () => {
    const user = userEvent.setup();
    render(<SharedHomeTab />);

    const notesBtn = screen.getByRole("button", { name: "Notes" });
    expect(notesBtn).toBeInTheDocument();

    await user.click(notesBtn);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveTab("notes"));
  });

  // ── Reporting Modal Dialog Window Lifecycle Sequence Flows ───────────────
  it("should execute full multi-stage visibility loops for ticket filing components cleanly", async () => {
    const user = userEvent.setup();
    render(<SharedHomeTab />);

    const triggerReportBtn = screen.getByRole("button", {
      name: "Report an issue",
    });
    await user.click(triggerReportBtn);
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close Report" });
    await user.click(closeBtn);
    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();

    await user.click(triggerReportBtn);
    const successBtn = screen.getByRole("button", { name: "Submit Success" });
    await user.click(successBtn);

    expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("report-success-modal")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: "Back From Success" });
    await user.click(backBtn);
    expect(
      screen.queryByTestId("report-success-modal"),
    ).not.toBeInTheDocument();
  });
});
