import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeMentorCard from "./HomeMentorCard";
import {
  getInitials,
  getAvatarColor,
} from "@features/mentee/hooks/useHomeData";

// ── 1. Mock External Hooks & Utility Modules ──────────────────────────────
vi.mock("@features/mentee/hooks/useHomeData", () => ({
  // Implement a dynamic fallback generator inside the mock to handle multiple names correctly
  getInitials: vi.fn((name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "M",
  ),
  getAvatarColor: vi.fn(() => "bg-blue-500-mock"),
}));

describe("HomeMentorCard", () => {
  const mockOnViewProfile = vi.fn();

  const defaultProps = {
    mentor: {
      _id: "mentor-789",
      profilePicture: "https://example.com/avatar.jpg",
      currentRole: "Staff Engineer",
      company: "Leap Corp",
      skills: ["React", "Node", "Architecture"],
      avgRating: 4.85,
      user: {
        _id: "user-123",
        name: "John Doe",
      },
    },
    onViewProfile: mockOnViewProfile,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Baseline Display & Event Handling Matrix ────────────────────────────
  it("should render full profile data correctly and trigger click selection handler", async () => {
    const user = userEvent.setup();
    render(<HomeMentorCard {...defaultProps} />);

    // Validate textual content fields
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("@ Leap Corp")).toBeInTheDocument();

    // Validate avatar image details
    const profileImg = screen.getByRole("img", { name: "John Doe" });
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute("src", "https://example.com/avatar.jpg");

    // Validate skills list truncation logic (slice 0 to 2) and upper-casing
    expect(screen.getByText("REACT")).toBeInTheDocument();
    expect(screen.getByText("NODE")).toBeInTheDocument();
    expect(screen.queryByText("ARCHITECTURE")).not.toBeInTheDocument();

    // Accounts for JSX expression layout breaking up text components into adjacent text nodes
    expect(screen.getByText(/⭐\s*4\.8/)).toBeInTheDocument();

    // Verify trigger click callback carries original model entity
    const actionCardBtn = screen.getByRole("button");
    await user.click(actionCardBtn);
    expect(mockOnViewProfile).toHaveBeenCalledWith(defaultProps.mentor);
  });

  // ── Alternative Render Paths & Fallback Fall-through Branches ────────────
  it("should generate a text placeholder avatar bubble if profile picture path is omitted", () => {
    const propsNoImage = {
      ...defaultProps,
      mentor: {
        ...defaultProps.mentor,
        profilePicture: null,
      },
    };

    render(<HomeMentorCard {...propsNoImage} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    const initialsAvatar = screen.getByText("JD");
    expect(initialsAvatar).toBeInTheDocument();
    expect(initialsAvatar).toHaveClass("bg-blue-500-mock");
    expect(getAvatarColor).toHaveBeenCalledWith("John Doe");
    expect(getInitials).toHaveBeenCalledWith("John Doe");
  });

  it("should switch automatically onto initials fallback view container frame if image node fires an onError event", () => {
    render(<HomeMentorCard {...defaultProps} />);

    const profileImg = screen.getByRole("img", { name: "John Doe" });
    expect(profileImg).toBeInTheDocument();

    // Simulate broken image resource transmission error link collapse
    fireEvent.error(profileImg);

    // Image must disappear, fallback node text string target appears
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should handle completely missing user names, companies, ratings, and skills vectors safely without structural crashes", () => {
    const boundaryProps = {
      mentor: {
        _id: "mentor-edge",
        profilePicture: undefined,
        currentRole: "Freelancer",
        company: null,
        skills: undefined,
        avgRating: 0,
        user: null,
      },
      onViewProfile: mockOnViewProfile,
    };

    render(<HomeMentorCard {...boundaryProps} />);

    // Name fallback text validation path
    expect(screen.getByText("Mentor")).toBeInTheDocument();
    expect(screen.getByText("Freelancer")).toBeInTheDocument();

    // Omitted conditional sections verification checks
    expect(screen.queryByText(/@/i)).not.toBeInTheDocument();
    expect(screen.queryByText("⭐")).not.toBeInTheDocument();

    // Fallback initials assertion checks match the default "Mentor" string rule calculation
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(getInitials).toHaveBeenCalledWith("Mentor");
  });
});
