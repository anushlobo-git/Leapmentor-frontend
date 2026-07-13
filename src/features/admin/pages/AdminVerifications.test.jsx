import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import AdminVerifications from "./AdminVerifications";
import {
  getMentorVerifications,
  verifyMentorProfile,
} from "@features/admin/api/admin.api";

// Mock external API paths
vi.mock("@features/admin/api/admin.api", () => ({
  getMentorVerifications: vi.fn(),
  verifyMentorProfile: vi.fn(),
}));

// Mock icons simply to keep output clean and fast
vi.mock("@features/admin/components/verifications/VerificationIcons", () => ({
  IconShield: () => <span data-testid="icon-shield" />,
  IconCheck: () => <span data-testid="icon-check" />,
  IconX: () => <span data-testid="icon-x" />,
  IconDoc: () => <span data-testid="icon-doc" />,
  IconEye: () => <span data-testid="icon-eye" />,
  IconSearch: () => <span data-testid="icon-search" />,
  IconFilter: () => <span data-testid="icon-filter" />,
}));

// Mock DetailDrawer and its named exports to control interactivity inside tests
vi.mock(
  "@features/admin/components/verifications/VerificationDetailDrawer",
  () => {
    return {
      default: ({ mentor, onClose, onVerify, verifying }) => (
        <div data-testid="detail-drawer">
          <p>Selected Mentor: {mentor.user?.name}</p>
          <button onClick={onClose}>Close Drawer</button>
          <button
            onClick={() => onVerify(mentor.mentorProfile?._id)}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "Verify Button"}
          </button>
        </div>
      ),
      StatusBadge: ({ status }) => (
        <span data-testid="status-badge">{status}</span>
      ),
    };
  },
);

describe("AdminVerifications", () => {
  const mockMentorsList = [
    {
      user: { _id: "u1", name: "Sarah Connor", email: "sarah@skynet.com" },
      mentorProfile: {
        _id: "p1",
        verificationStatus: "pending",
        phoneNumber: "+123456789",
        profilePicture: "sarah_avatar.png",
        resumeDocument: { url: "resume_url" },
        workExperienceDocuments: [{ id: "doc1" }],
      },
    },
    {
      user: { _id: "u2", name: "John Doe", email: "john@skynet.com" },
      mentorProfile: {
        _id: "p2",
        verificationStatus: "verified",
        phoneNumber: "",
        profilePicture: "",
        resumeDocument: null,
        workExperienceDocuments: [],
      },
    },
    {
      user: { _id: "u3", name: "", email: "" }, // Test empty/missing string fallbacks
      mentorProfile: null, // Test completely missing profile object branch
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render loading indicator initially and then display populated data rows (Happy Path)", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: mockMentorsList },
    });

    render(<AdminVerifications />);
    expect(screen.getByText("Loading mentors…")).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("john@skynet.com")).toBeInTheDocument();
    expect(screen.getByText("Total Mentors")).toBeInTheDocument();
  });

  it("should evaluate response structure variations cleanly when nested property is absent", async () => {
    // Branch targets: res.data instead of res.data.mentors
    getMentorVerifications.mockResolvedValueOnce({ data: mockMentorsList });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
  });

  it("should display error message along with retry action button on API call failure", async () => {
    getMentorVerifications.mockRejectedValueOnce(
      new Error("Network Failure Error"),
    );

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Network Failure Error")).toBeInTheDocument();

    // Verify retry functionality works and invokes API again
    getMentorVerifications.mockResolvedValueOnce({ data: { mentors: [] } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    });

    expect(screen.getByText("No mentors found.")).toBeInTheDocument();
  });

  it("should display zero states fallback screen cleanly when filtered output contains no items", async () => {
    getMentorVerifications.mockResolvedValueOnce({ data: { mentors: [] } });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("No mentors found.")).toBeInTheDocument();
  });

  it("should switch to custom text placeholders when images trigger rendering errors", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: [mockMentorsList[0]] },
    });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();

    // Trigger error callback context branch directly
    act(() => {
      fireEvent.error(img);
    });

    expect(img).not.toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument(); // Displays first character uppercase fallback label
  });

  it("should apply missing string placeholders safely across undefined text properties", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: mockMentorsList },
    });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    // Validates that the completely unpopulated third mentor yields the structural "—" characters
    const fallbackTextElements = screen.getAllByText("—");
    expect(fallbackTextElements.length).toBeGreaterThan(0);

    // Validates fallback letter "?" for empty username values
    expect(screen.getByText("?")).toBeInTheDocument();

    // Validates document zero count branch rendering the decorative "none" tag string label for multiple matching items
    expect(screen.getAllByText("none").length).toBe(2);
  });

  it("should filter items correctly when interactive search queries change", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: mockMentorsList },
    });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    const searchInput = screen.getByPlaceholderText("Search by name or email…");

    // Filter by matching name structure
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Sarah" } });
    });

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    // Focus and blur visual layout style updates
    fireEvent.focus(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(37, 99, 235)");
    fireEvent.blur(searchInput);
    expect(searchInput.style.borderColor).toBe("rgb(226, 232, 240)");
  });

  it("should apply filter criteria correctly when clicking tab controls", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: mockMentorsList },
    });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    const verifiedTabButton = screen.getAllByRole("button", {
      name: /^verified$/i,
    })[0];
    const pendingTabButton = screen.getAllByRole("button", {
      name: /^pending$/i,
    })[0];

    // Filter by Verified only
    act(() => {
      fireEvent.click(verifiedTabButton);
    });
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Connor")).not.toBeInTheDocument();

    // Filter by Pending review only
    act(() => {
      fireEvent.click(pendingTabButton);
    });
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("should open detail drawer when row button is clicked and handle clean unmounting via close callbacks", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: [mockMentorsList[0]] },
    });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    const rowButton = screen.getByRole("button", {
      name: "View details for Sarah Connor",
    });
    fireEvent.click(rowButton);

    expect(screen.getByTestId("detail-drawer")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close Drawer" });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("detail-drawer")).not.toBeInTheDocument();
  });

  it("should display success toasts and update structural values upon successful profile validations", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: [mockMentorsList[0]] },
    });
    verifyMentorProfile.mockResolvedValueOnce({});

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    // Trigger details modal mount sequence
    fireEvent.click(
      screen.getByRole("button", { name: "View details for Sarah Connor" }),
    );

    const verifyActionButton = screen.getByRole("button", {
      name: "Verify Button",
    });

    await act(async () => {
      fireEvent.click(verifyActionButton);
    });

    expect(verifyMentorProfile).toHaveBeenCalledWith("p1");
    expect(
      screen.getByText("✓ Mentor verified successfully!"),
    ).toBeInTheDocument();

    // Fast-forward past the toast timeout lifespan limit (3500ms)
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(
      screen.queryByText("✓ Mentor verified successfully!"),
    ).not.toBeInTheDocument();
  });

  it("should display an error alert toast message upon verification rejection outcomes", async () => {
    getMentorVerifications.mockResolvedValueOnce({
      data: { mentors: [mockMentorsList[0]] },
    });
    verifyMentorProfile.mock詐欺Keyed ||
      verifyMentorProfile.mockRejectedValueOnce(
        new Error("Verification Failed Exception"),
      );

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "View details for Sarah Connor" }),
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Verify Button" }));
    });

    expect(
      screen.getByText("Verification Failed Exception"),
    ).toBeInTheDocument();
  });

  it("should invoke explicit refresh API updates immediately when header action controls are clicked", async () => {
    getMentorVerifications.mockResolvedValueOnce({ data: { mentors: [] } });

    render(<AdminVerifications />);
    await act(async () => {
      await Promise.resolve();
    });

    vi.clearAllMocks();
    getMentorVerifications.mockResolvedValueOnce({ data: { mentors: [] } });

    const refreshButton = screen.getByRole("button", { name: "Refresh" });

    await act(async () => {
      fireEvent.click(refreshButton);
    });

    expect(getMentorVerifications).toHaveBeenCalledTimes(1);
  });
});
