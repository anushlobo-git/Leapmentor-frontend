import { render, screen, fireEvent } from "@testing-library/react";
import ReferredByProfileModal from "./ReferredByProfileModal";

describe("ReferredByProfileModal Component", () => {
  const mockOnClose = vi.fn();

  const defaultMentor = {
    name: "Jane Smith",
    email: "jane@example.com",
    currentRole: "Lead Engineer",
    company: "Google",
    industry: "Tech",
    bio: "Passionate mentor.",
    hourlyRate: 50,
    avgRating: 4.6,
    yearsOfExperience: 8,
    profilePicture: "jane.jpg",
    skills: ["React", "CSS", "Jest"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null if mentor is not provided", () => {
    const { container } = render(
      <ReferredByProfileModal mentor={null} onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders mentor details correctly", () => {
    render(
      <ReferredByProfileModal mentor={defaultMentor} onClose={mockOnClose} />,
    );

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lead Engineer at Google")).toBeInTheDocument();
    expect(screen.getByText("Passionate mentor.")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();
    expect(screen.getByText("8 Years")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles fallback values for missing details", () => {
    const sparseMentor = {
      name: "",
      email: "",
      currentRole: "Freelancer",
      company: "",
      hourlyRate: 0, // Free
      avgRating: 0, // New
      skills: [],
    };

    render(
      <ReferredByProfileModal mentor={sparseMentor} onClose={mockOnClose} />,
    );

    expect(screen.getAllByText("—").length).toBeGreaterThan(0); // fallbacks
    expect(screen.queryByText("@")).not.toBeInTheDocument(); // email hidden
    expect(screen.getAllByText("Freelancer").length).toBeGreaterThan(0);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();

    // Initials fallback
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
