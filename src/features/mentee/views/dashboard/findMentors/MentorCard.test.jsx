import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorCard from "./MentorCard";

describe("MentorCard", () => {
  const baseMentor = {
    _id: "m1",
    user: { name: "Alice Smith" },
    currentRole: "Staff Engineer",
    company: "Google",
    industry: "Tech",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    hourlyRate: 50,
    avgRating: 4.8,
    profilePicture: "https://example.com/alice.jpg",
    verificationStatus: "verified",
    yearsOfExperience: 5,
  };

  const mockOnViewProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders mentor information correctly", () => {
    render(
      <MentorCard mentor={baseMentor} onViewProfile={mockOnViewProfile} />,
    );

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer · Google")).toBeInTheDocument();
    expect(screen.getByText("5 yrs experience")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();

    // Max 3 skills should be shown, plus "+1 more"
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.queryByText("GraphQL")).not.toBeInTheDocument();
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("handles profile picture image load errors and displays initials", () => {
    render(
      <MentorCard mentor={baseMentor} onViewProfile={mockOnViewProfile} />,
    );

    const img = screen.getByRole("img", { name: "Alice Smith" });
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    // After image error, fallback to initials "AS" should render
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("handles empty name and missing details gracefully", () => {
    const sparseMentor = {
      _id: "m2",
      user: null,
      currentRole: "",
      company: "",
      industry: "",
      skills: [],
      hourlyRate: 0,
      avgRating: 0,
      profilePicture: "",
      verificationStatus: "pending",
      yearsOfExperience: 1,
    };

    render(
      <MentorCard mentor={sparseMentor} onViewProfile={mockOnViewProfile} />,
    );

    // Name fallback and Role fallback both display "—"
    expect(screen.getAllByText("—")).toHaveLength(2);
    expect(screen.getByText("1 yr experience")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("triggers onViewProfile handler on button click", async () => {
    const user = userEvent.setup();
    render(
      <MentorCard mentor={baseMentor} onViewProfile={mockOnViewProfile} />,
    );

    const button = screen.getByRole("button", { name: /View Profile/i });
    await user.click(button);

    expect(mockOnViewProfile).toHaveBeenCalledWith(baseMentor);
  });
});
