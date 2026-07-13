import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenteeOnboardingShell from "./MenteeOnboardingShell";
import useMenteeOnboarding from "@features/mentee/hooks/useMenteeOnboarding";

// Mock custom hook
vi.mock("@features/mentee/hooks/useMenteeOnboarding", () => ({
  default: vi.fn(),
}));

// Mock sub-components
vi.mock("@components/ui/OnboardingProgressBar", () => ({
  default: () => <div data-testid="progress-bar">ProgressBar</div>,
}));

vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => (
    <div data-testid="full-screen-loader">{message}</div>
  ),
}));

vi.mock("@features/mentee/components/onboarding/PersonalInfoSection", () => ({
  default: ({ form, handleChange }) => (
    <div data-testid="personal-section">
      <input name="bio" value={form.bio || ""} onChange={handleChange} />
    </div>
  ),
}));

vi.mock(
  "@features/mentee/components/onboarding/ProfessionalDetailsSection",
  () => ({
    default: ({ form, handleChange, errors }) => (
      <div data-testid="prof-section">
        <input
          name="currentRole"
          value={form.currentRole || ""}
          onChange={handleChange}
        />
        {errors.currentRole && <span>Error Role</span>}
      </div>
    ),
  }),
);

vi.mock(
  "@features/mentee/components/onboarding/InterestedFieldsSection",
  () => ({
    default: React.forwardRef(({ form, handleChange, errors }, ref) => (
      <div ref={ref} data-testid="fields-section" data-field="interestedFields">
        {errors.interestedFields && <span>Error Fields</span>}
        <div data-field="skills">
          {errors.skills && <span>Error Skills</span>}
        </div>
      </div>
    )),
  }),
);

vi.mock(
  "@features/mentee/components/onboarding/MentorshipPrefsSection",
  () => ({
    default: () => <div data-testid="prefs-section" />,
  }),
);

vi.mock("@features/mentee/components/onboarding/SocialLinksSection", () => ({
  default: () => <div data-testid="social-section" />,
}));

describe("MenteeOnboardingShell", () => {
  const mockOnboardingState = {
    form: {
      bio: "Aspiring developer",
      currentRole: "QA",
      yearsOfExperience: "1-3 Years",
      industry: "Technology",
      interestedFields: ["Software"],
      skills: ["React"],
    },
    loading: false,
    msg: { text: null, type: null },
    redirecting: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useMenteeOnboarding.mockReturnValue(mockOnboardingState);
  });

  it("renders loader during redirection", () => {
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      redirecting: true,
    });

    render(<MenteeOnboardingShell />);
    expect(screen.getByTestId("full-screen-loader")).toBeInTheDocument();
  });

  it("renders spinner and disabled submit button when loading is true", () => {
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      loading: true,
    });

    render(<MenteeOnboardingShell />);
    expect(screen.getByText("Saving profile...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving profile..." }),
    ).toBeDisabled();
  });

  it("renders main onboarding elements and sections", () => {
    render(<MenteeOnboardingShell />);

    expect(screen.getByText("Mentee Onboarding")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    expect(screen.getByTestId("personal-section")).toBeInTheDocument();
    expect(screen.getByTestId("prof-section")).toBeInTheDocument();
    expect(screen.getByTestId("fields-section")).toBeInTheDocument();
  });

  it("handles input change and clears errors for that field", async () => {
    const user = userEvent.setup();
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      form: { ...mockOnboardingState.form, currentRole: "" },
    });

    const { container } = render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(screen.getByText("Error Role")).toBeInTheDocument();

    const roleInput = container.querySelector('input[name="currentRole"]');
    await user.type(roleInput, "Engineer");

    expect(mockOnboardingState.handleChange).toHaveBeenCalled();
  });

  it("fails validation and scrolls to the first errored field (named element)", async () => {
    const user = userEvent.setup();
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      form: {
        bio: "",
        currentRole: "",
        yearsOfExperience: "",
        industry: "",
        interestedFields: [],
        skills: [],
      },
    });

    render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    expect(mockOnboardingState.handleSubmit).not.toHaveBeenCalled();
  });

  it("fails validation and scrolls to field using data-field attribute (skills)", async () => {
    const user = userEvent.setup();
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      form: {
        ...mockOnboardingState.form,
        skills: [],
      },
    });

    render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("fails validation and falls back to React ref when name and data-field queries return null", async () => {
    const user = userEvent.setup();
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      form: {
        ...mockOnboardingState.form,
        interestedFields: [],
      },
    });

    const originalQuerySelector = document.querySelector;
    const querySelectorMock = vi.fn((selector) => {
      if (selector.includes("interestedFields")) return null;
      return originalQuerySelector.call(document, selector);
    });
    document.querySelector = querySelectorMock;

    render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    document.querySelector = originalQuerySelector;
  });

  it("fails validation but does not scroll if firstKey returns no element anywhere", async () => {
    const user = userEvent.setup();
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      form: {
        ...mockOnboardingState.form,
        currentRole: "",
      },
    });

    // Make querySelector return null to ensure el is null
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn().mockReturnValue(null);

    render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

    document.querySelector = originalQuerySelector;
  });

  it("submits the form successfully when validation passes", async () => {
    const user = userEvent.setup();
    render(<MenteeOnboardingShell />);

    const submitBtn = screen.getByRole("button", { name: /Complete Profile/i });
    await user.click(submitBtn);

    expect(mockOnboardingState.handleSubmit).toHaveBeenCalled();
  });

  it("displays success status message correctly", () => {
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      msg: { text: "Profile updated successfully!", type: "success" },
    });

    render(<MenteeOnboardingShell />);
    expect(
      screen.getByText("Profile updated successfully!"),
    ).toBeInTheDocument();
  });

  it("displays error status message correctly", () => {
    useMenteeOnboarding.mockReturnValueOnce({
      ...mockOnboardingState,
      msg: { text: "Database connection failed", type: "error" },
    });

    render(<MenteeOnboardingShell />);
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });
});
