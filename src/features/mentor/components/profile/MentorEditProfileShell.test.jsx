/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorEditProfileShell from "./MentorEditProfileShell";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the hook
const mockUseMentorEditProfile = vi.fn();
vi.mock("@features/mentor/hooks/useMentorEditProfile", () => ({
  default: () => mockUseMentorEditProfile(),
}));

// Mock the section components
vi.mock("@features/mentor/components/onboarding/PersonalInfoSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="personal-info-section">
      <input
        data-testid="personal-input"
        value={form.bio || ""}
        onChange={onChange}
        name="bio"
      />
    </div>
  ),
}));

vi.mock(
  "@features/mentor/components/onboarding/ProfessionalInfoSection",
  () => ({
    default: ({ form, onChange }) => (
      <div data-testid="professional-info-section">
        <input
          data-testid="professional-input"
          value={form.currentRole || ""}
          onChange={onChange}
          name="currentRole"
        />
      </div>
    ),
  }),
);

vi.mock("@features/mentor/components/onboarding/SkillsSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="skills-section">
      <input
        data-testid="skills-input"
        value={form.skills?.join(",") || ""}
        onChange={onChange}
        name="skills"
      />
    </div>
  ),
}));

vi.mock("@features/mentor/components/onboarding/PreferencesSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="preferences-section">
      <input
        data-testid="preferences-input"
        value={form.communicationPreferences?.join(",") || ""}
        onChange={onChange}
        name="communicationPreferences"
      />
    </div>
  ),
}));

vi.mock("@features/mentor/components/onboarding/SocialLinksSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="social-links-section">
      <input
        data-testid="social-input"
        value={form.linkedInUrl || ""}
        onChange={onChange}
        name="linkedInUrl"
      />
    </div>
  ),
}));

// Mock images
vi.mock("@constants/images", () => ({
  IMAGES: {
    LOGO: "https://example.com/logo.png",
  },
}));

describe("MentorEditProfileShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  describe("loading state", () => {
    it("should show loading spinner when fetchLoading is true", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: true,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should not show loading spinner when fetchLoading is false", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("header", () => {
    it("should render header with logo and title", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.getByAltText("LeapMentor logo")).toBeInTheDocument();
      expect(screen.getByText("Edit Profile")).toBeInTheDocument();
      expect(screen.getByText(/Back to Dashboard/)).toBeInTheDocument();
    });

    it("should navigate to dashboard when back button is clicked", async () => {
      const user = userEvent.setup();
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const backButton = screen.getByText(/Back to Dashboard/);
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
    });
  });

  describe("main content", () => {
    it("should render page title and description", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.getByText("Update Your Profile")).toBeInTheDocument();
      expect(
        screen.getByText("Make changes to your profile and save when done."),
      ).toBeInTheDocument();
    });

    it("should render all section components", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {
          bio: "Test bio",
          currentRole: "Engineer",
          skills: ["React"],
          communicationPreferences: ["Chat"],
          linkedInUrl: "https://linkedin.com",
        },
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.getByTestId("personal-info-section")).toBeInTheDocument();
      expect(
        screen.getByTestId("professional-info-section"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("skills-section")).toBeInTheDocument();
      expect(screen.getByTestId("preferences-section")).toBeInTheDocument();
      expect(screen.getByTestId("social-links-section")).toBeInTheDocument();
    });

    it("should render save button", () => {
      const mockHandleSubmit = vi.fn();
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: mockHandleSubmit,
      });

      render(<MentorEditProfileShell />);

      const saveButton = screen.getByRole("button", {
        name: /Save Changes/,
      });
      expect(saveButton).toBeInTheDocument();
    });

    it("should show loading state on button when loading is true", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: true,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const saveButton = screen.getByRole("button", {
        name: /Saving changes\.\.\./i,
      });
      expect(saveButton).toBeDisabled();
      expect(screen.getByText("Saving changes...")).toBeInTheDocument();
    });

    it("should not show loading state on button when loading is false", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const saveButton = screen.getByRole("button", { name: /Save Changes/ });
      expect(saveButton).not.toBeDisabled();
      expect(screen.getByText("Save Changes →")).toBeInTheDocument();
    });

    it("should call handleSubmit when form is submitted", async () => {
      const user = userEvent.setup();
      const mockHandleSubmit = vi.fn((e) => e.preventDefault());
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: mockHandleSubmit,
      });

      render(<MentorEditProfileShell />);

      await user.click(screen.getByRole("button", { name: /Save Changes/ }));

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should render footer text", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(
        screen.getByText(
          "You can always edit your profile from the dashboard.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("message display", () => {
    it("should show success message when msg.type is success", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "success", text: "Profile updated successfully!" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.getByText("✓")).toBeInTheDocument();
      expect(
        screen.getByText("Profile updated successfully!"),
      ).toBeInTheDocument();
      const messageBox = screen
        .getByText("Profile updated successfully!")
        .closest("div");
      expect(messageBox).toHaveClass("bg-[#f0fdf4]");
      expect(messageBox).toHaveClass("border-[#bbf7d0]");
      expect(messageBox).toHaveClass("text-[#16a34a]");
    });

    it("should show error message when msg.type is error", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "error", text: "Failed to update profile" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.getByText("⚠")).toBeInTheDocument();
      expect(screen.getByText("Failed to update profile")).toBeInTheDocument();
      const messageBox = screen
        .getByText("Failed to update profile")
        .closest("div");
      expect(messageBox).toHaveClass("bg-[#fff1f2]");
      expect(messageBox).toHaveClass("border-[#fecdd3]");
      expect(messageBox).toHaveClass("text-[#e11d48]");
    });

    it("should not show message when msg.text is empty", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      expect(screen.queryByText("✓")).not.toBeInTheDocument();
      expect(screen.queryByText("⚠")).not.toBeInTheDocument();
    });
  });

  describe("form interaction", () => {
    it("should pass form data and handleChange to sections", () => {
      const mockHandleChange = vi.fn();
      mockUseMentorEditProfile.mockReturnValue({
        form: {
          bio: "Test bio",
          currentRole: "Engineer",
          skills: ["React"],
          communicationPreferences: ["Chat"],
          linkedInUrl: "https://linkedin.com",
        },
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: mockHandleChange,
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const personalInput = screen.getByTestId("personal-input");
      expect(personalInput).toHaveValue("Test bio");

      const professionalInput = screen.getByTestId("professional-input");
      expect(professionalInput).toHaveValue("Engineer");
    });

    it("should call handleChange when input changes", async () => {
      const user = userEvent.setup();
      const mockHandleChange = vi.fn();
      mockUseMentorEditProfile.mockReturnValue({
        form: { bio: "" },
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: mockHandleChange,
        handleSubmit: vi.fn(),
      });

      render(<MentorEditProfileShell />);

      const personalInput = screen.getByTestId("personal-input");
      await user.type(personalInput, "New bio");

      expect(mockHandleChange).toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("should apply correct background color", () => {
      mockUseMentorEditProfile.mockReturnValue({
        form: {},
        loading: false,
        fetchLoading: false,
        msg: { type: "", text: "" },
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      const { container } = render(<MentorEditProfileShell />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("bg-[#f0f4ff]");
    });
  });
});
