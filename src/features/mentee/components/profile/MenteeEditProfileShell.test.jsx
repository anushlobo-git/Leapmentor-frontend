import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenteeEditProfileShell from "./MenteeEditProfileShell";
import useMenteeEditProfile from "@features/mentee/hooks/useMenteeEditProfile";
import { useNavigate } from "react-router-dom";

// Mock router navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock custom hook
vi.mock("@features/mentee/hooks/useMenteeEditProfile", () => ({
  default: vi.fn(),
}));

// Mock sub-components
vi.mock("@features/mentee/components/onboarding/PersonalInfoSection", () => ({
  default: () => <div data-testid="personal-section" />,
}));
vi.mock(
  "@features/mentee/components/onboarding/ProfessionalDetailsSection",
  () => ({
    default: () => <div data-testid="prof-section" />,
  }),
);
vi.mock(
  "@features/mentee/components/onboarding/InterestedFieldsSection",
  () => ({
    default: () => <div data-testid="fields-section" />,
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

describe("MenteeEditProfileShell", () => {
  const mockEditState = {
    form: { bio: "Dev" },
    loading: false,
    fetchLoading: false,
    msg: { text: null, type: null },
    handleChange: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useMenteeEditProfile.mockReturnValue(mockEditState);
  });

  it("renders loader spinner when fetching data", () => {
    useMenteeEditProfile.mockReturnValueOnce({
      ...mockEditState,
      fetchLoading: true,
    });

    const { container } = render(<MenteeEditProfileShell />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders main edit profile form and subcomponents", () => {
    render(<MenteeEditProfileShell />);

    expect(screen.getByText("Update Your Profile")).toBeInTheDocument();
    expect(screen.getByTestId("personal-section")).toBeInTheDocument();
    expect(screen.getByTestId("prof-section")).toBeInTheDocument();
    expect(screen.getByTestId("fields-section")).toBeInTheDocument();
    expect(screen.getByTestId("prefs-section")).toBeInTheDocument();
    expect(screen.getByTestId("social-section")).toBeInTheDocument();
  });

  it("navigates to mentee dashboard when clicking Back button", async () => {
    const user = userEvent.setup();
    render(<MenteeEditProfileShell />);

    const backBtn = screen.getByRole("button", { name: /Back to Dashboard/i });
    await user.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
  });

  it("submits form when saving changes", async () => {
    const user = userEvent.setup();
    render(<MenteeEditProfileShell />);

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    await user.click(saveBtn);

    expect(mockEditState.handleSubmit).toHaveBeenCalled();
  });

  it("shows saving spinner and disables save button when loading is true", () => {
    useMenteeEditProfile.mockReturnValueOnce({
      ...mockEditState,
      loading: true,
    });

    render(<MenteeEditProfileShell />);
    expect(screen.getByText("Saving changes...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Saving changes..." }),
    ).toBeDisabled();
  });

  it("shows success status message correctly", () => {
    useMenteeEditProfile.mockReturnValueOnce({
      ...mockEditState,
      msg: { text: "Profile successfully saved!", type: "success" },
    });

    render(<MenteeEditProfileShell />);
    expect(screen.getByText("Profile successfully saved!")).toBeInTheDocument();
  });

  it("shows error status message correctly", () => {
    useMenteeEditProfile.mockReturnValueOnce({
      ...mockEditState,
      msg: { text: "Network connection lost", type: "error" },
    });

    render(<MenteeEditProfileShell />);
    expect(screen.getByText("Network connection lost")).toBeInTheDocument();
  });
});
