import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailDrawer, { StatusBadge } from "./VerificationDetailDrawer";

// Mock the icons module explicitly
vi.mock("@features/admin/components/verifications/VerificationIcons", () => ({
  IconCheck: ({ size }) => (
    <span data-testid="icon-check" data-size={size}>
      IconCheck
    </span>
  ),
  IconDoc: () => <span data-testid="icon-doc">IconDoc</span>,
  IconPhone: () => <span data-testid="icon-phone">IconPhone</span>,
  IconUser: () => <span data-testid="icon-user">IconUser</span>,
  IconBriefcase: () => <span data-testid="icon-briefcase">IconBriefcase</span>,
  IconClose: () => <span data-testid="icon-close">IconClose</span>,
  IconExternalLink: () => (
    <span data-testid="icon-external-link">IconExternalLink</span>
  ),
}));

describe("StatusBadge", () => {
  it("should render verified status correctly", () => {
    render(<StatusBadge status="verified" />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });

  it("should render pending status correctly when status is not verified", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
  });
});

describe("DetailDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null and render nothing when mentor is missing", () => {
    const { container } = render(
      <DetailDrawer
        mentor={null}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render all mentor fields with default fallback tokens when arrays and elements are missing", () => {
    const minimalisticMentor = {
      user: { name: "", email: "ghost@leapmentor.com" },
      mentorProfile: {
        verificationStatus: "pending",
        currentRole: "",
        company: "",
        industry: "",
        yearsOfExperience: undefined,
        phoneNumber: "",
        languages: null,
        bio: "",
        skills: [],
      },
    };

    render(
      <DetailDrawer
        mentor={minimalisticMentor}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );

    // Initial letters profile fallback check
    expect(screen.getByText("M")).toBeInTheDocument();

    // Default fallback validations
    expect(screen.getAllByText("Not specified")).toHaveLength(3); // role, company, industry
    expect(screen.getByText("0 Years")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument(); // phone
    expect(screen.getByText("English")).toBeInTheDocument(); // languages fallback
    expect(screen.getByText("Registration complete")).toBeInTheDocument();
  });

  it("should render standard values, skills, bio, and call onClose when backdrop or close buttons are clicked", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    const mockMentor = {
      user: { name: "Jane Developer", email: "jane@leapmentor.com" },
      mentorProfile: {
        _id: "mentor-123",
        verificationStatus: "pending",
        currentRole: "Staff Engineer",
        company: "Leap Corp",
        industry: "Tech",
        yearsOfExperience: 8,
        phoneNumber: "+919999999999",
        languages: ["English", "Hindi"],
        bio: "Passionate mentor profile bio statement.",
        skills: ["React", "Vitest"],
        resumeDocument: {
          url: "https://leap.com/resume.pdf",
          uploadedAt: "2026-03-31T12:00:00.000Z",
        },
        workExperienceDocuments: [
          { url: "https://leap.com/job1.png" },
          { url: "" },
        ],
      },
    };

    render(
      <DetailDrawer
        mentor={mockMentor}
        onClose={mockOnClose}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );

    // Basic layout verification
    expect(screen.getByText("Jane Developer")).toBeInTheDocument();
    expect(screen.getByText("jane@leapmentor.com")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Leap Corp")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(screen.getByText("8 Years")).toBeInTheDocument();
    expect(screen.getByText("+919999999999")).toBeInTheDocument();
    expect(screen.getByText("English, Hindi")).toBeInTheDocument();
    expect(
      screen.getByText("Passionate mentor profile bio statement."),
    ).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vitest")).toBeInTheDocument();

    // Verify backdrop button triggers close interaction
    const backdrop = screen.getByRole("button", {
      name: "Close mentor details",
    });
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Verify header close icon triggers close interaction
    const closeIconBtn = screen.getByRole("button", { name: /iconclose/i });
    await user.click(closeIconBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("should display already verified badge when verificationStatus equals verified", () => {
    const verifiedMentor = {
      user: { name: "Verified Professional", email: "verified@leapmentor.com" },
      mentorProfile: {
        verificationStatus: "verified",
        resumeDocument: { url: "", uploadedAt: "" },
      },
    };

    render(
      <DetailDrawer
        mentor={verifiedMentor}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );

    expect(screen.getByText("Already Verified")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Mark as Verified/i }),
    ).not.toBeInTheDocument();
  });

  it("should toggle verifying text and disable click events during verifications execution", async () => {
    const mockMentor = {
      user: { name: "Candidate Tech", email: "candidate@leapmentor.com" },
      mentorProfile: {
        _id: "verify-target-id",
        verificationStatus: "pending",
      },
    };
    const mockOnVerify = vi.fn();

    const { rerender } = render(
      <DetailDrawer
        mentor={mockMentor}
        onClose={vi.fn()}
        onVerify={mockOnVerify}
        verifying={false}
      />,
    );

    const verifyBtn = screen.getByRole("button", { name: /Mark as Verified/i });
    await userEvent.click(verifyBtn);
    expect(mockOnVerify).toHaveBeenCalledWith("verify-target-id");

    // Re-render component under live loading state to assert updates
    rerender(
      <DetailDrawer
        mentor={mockMentor}
        onClose={vi.fn()}
        onVerify={mockOnVerify}
        verifying={true}
      />,
    );

    const ongoingVerifyBtn = screen.getByRole("button", {
      name: /Verifying…/i,
    });
    expect(ongoingVerifyBtn).toBeDisabled();
  });

  it("should fall back to avatar placeholder name letter when profile image triggers onError", () => {
    const mockMentor = {
      user: { name: "Zack Automation", email: "zack@leapmentor.com" },
      mentorProfile: {
        profilePicture: "https://leap.com/avatar.jpg",
        verificationStatus: "pending",
      },
    };

    render(
      <DetailDrawer
        mentor={mockMentor}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );

    const profileImage = screen.getByRole("img", { name: "Zack Automation" });
    expect(profileImage).toBeInTheDocument();

    // Trigger error event loop branch coverage directly
    fireEvent.error(profileImage);

    // Profile picture should unmount, triggering initials text display
    expect(profileImage).not.toBeInTheDocument();
    expect(screen.getByText("Z")).toBeInTheDocument();
  });

  it("should hide document images cleanly when image links trigger an image error inside DocCard", () => {
    const mockMentor = {
      user: { name: "Document tester", email: "doc@leapmentor.com" },
      mentorProfile: {
        verificationStatus: "pending",
        workExperienceDocuments: [{ url: "https://leap.com/broken-link.png" }],
      },
    };

    render(
      <DetailDrawer
        mentor={mockMentor}
        onClose={vi.fn()}
        onVerify={vi.fn()}
        verifying={false}
      />,
    );

    const docCardImage = screen.getByRole("img", {
      name: "Work Experience Doc 1",
    });
    expect(docCardImage).toBeInTheDocument();

    // Trigger error handler block inside DocCard layout
    fireEvent.error(docCardImage);
    expect(docCardImage).toHaveStyle({ display: "none" });
  });
});
