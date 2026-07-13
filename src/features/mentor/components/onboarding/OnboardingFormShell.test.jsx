import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { forwardRef } from "react";
import OnboardingFormShell from "./OnboardingFormShell";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  submitMentorOnboarding,
  clearMentorOnboardingMessages,
} from "@features/mentor/store/mentorOnboardingSlice";

// ── 1. Mock External Hooks & Routing Dependencies ────────────────────────
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("@features/mentor/store/mentorOnboardingSlice", () => ({
  submitMentorOnboarding: vi.fn((payload) => ({ type: "submit", payload })),
  clearMentorOnboardingMessages: vi.fn(() => ({ type: "clear" })),
}));

vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => (
    <div data-testid="fullscreen-loader">{message}</div>
  ),
}));

vi.mock("@components/ui/OnboardingProgressBar", () => ({
  default: () => <div data-testid="progress-bar">Progress Bar</div>,
}));

vi.mock("@config/onboardingFields", () => ({
  MENTOR_ONBOARDING_FIELDS: [],
}));

vi.mock("@constants/images", () => ({
  IMAGES: { LOGO_PNG: "mock-logo.png" },
}));

// ── 2. Mock Section Component Layout Form Sub-sections ───────────────────
vi.mock("@features/mentor/components/onboarding/PersonalInfoSection", () => ({
  default: ({ form, onChange, errors }) => (
    <div data-testid="personal-info">
      <input name="bio" value={form.bio || ""} onChange={onChange} />
    </div>
  ),
}));

vi.mock(
  "@features/mentor/components/onboarding/ProfessionalInfoSection",
  () => ({
    default: ({ form, onChange, errors }) => (
      <div data-testid="professional-info">
        <input
          name="currentRole"
          value={form.currentRole || ""}
          onChange={onChange}
        />
        <input
          name="yearsOfExperience"
          value={form.yearsOfExperience || ""}
          onChange={onChange}
        />
        <input
          name="industry"
          value={form.industry || ""}
          onChange={onChange}
        />
        <input name="company" value={form.company || ""} onChange={onChange} />
        <input
          name="hourlyRate"
          value={form.hourlyRate || ""}
          onChange={onChange}
        />
        {errors.currentRole && (
          <span data-testid="err-currentRole">Role Required</span>
        )}
        {errors.yearsOfExperience && (
          <span data-testid="err-experience">Experience Required</span>
        )}
        {errors.industry && (
          <span data-testid="err-industry">Industry Required</span>
        )}
      </div>
    ),
  }),
);

vi.mock("@features/mentor/components/onboarding/SkillsSection", () => ({
  default: forwardRef(({ form, onChange, errors }, ref) => (
    <div data-testid="skills-section" ref={ref}>
      <input
        name="skillsTrigger"
        data-field="skills"
        onChange={(e) => {
          onChange({
            target: {
              name: "skills",
              value: e.target.value ? e.target.value.split(",") : [],
            },
          });
        }}
      />
      {errors.skills && <span data-testid="err-skills">Skills Required</span>}
    </div>
  )),
}));

vi.mock("@features/mentor/components/onboarding/PreferencesSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="preferences-section">
      <input
        name="languages"
        value={form.languages || ""}
        onChange={onChange}
      />
    </div>
  ),
}));

vi.mock("@features/mentor/components/onboarding/SocialLinksSection", () => ({
  default: ({ form, onChange }) => (
    <div data-testid="social-links">
      <input
        name="linkedInUrl"
        value={form.linkedInUrl || ""}
        onChange={onChange}
      />
      <input
        name="portfolioUrl"
        value={form.portfolioUrl || ""}
        onChange={onChange}
      />
    </div>
  ),
}));

describe("OnboardingFormShell", () => {
  const mockNavigate = vi.fn();
  const mockDispatch = vi.fn();
  const scrollSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    Element.prototype.scrollIntoView = scrollSpy;

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useSelector).mockReturnValue({
      loading: false,
      error: null,
      successMsg: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── SessionStorage Initializer Guardrails Coverage ─────────────────────
  it("should initialize form state with default properties when sessionStorage is totally clean", () => {
    render(<OnboardingFormShell />);
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  it("should pre-populate fields seamlessly if stringified data is matched in sessionStorage", () => {
    const savedState = {
      currentRole: "Principal Lead",
      yearsOfExperience: "12",
      industry: "Fintech",
      skills: ["Scala", "Spark"],
    };
    sessionStorage.setItem("mentorOnboardingForm", JSON.stringify(savedState));

    const { container } = render(<OnboardingFormShell />);
    expect(container.querySelector('input[name="currentRole"]')).toHaveValue(
      "Principal Lead",
    );
  });

  it("should graceful fall back to defaults if JSON parsing of sessionStorage state throws error exceptions", () => {
    sessionStorage.setItem("mentorOnboardingForm", "{ broken corrupted json");
    render(<OnboardingFormShell />);
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  // ── Input Validations & HandleChange Branches ────────────────────────────
  it("should reject hourlyRate inputs and return early if values exceed 100 dynamically", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    const rateInput = container.querySelector('input[name="hourlyRate"]');
    await user.type(rateInput, "105");

    // Because '105' violates the live threshold constraint as soon as '10' becomes '105', state drops the last mutation
    expect(rateInput).toHaveValue("10");
  });

  it("should clear individual live fields errors from list records when updated entries are typed", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    // Trigger validation error via submit first
    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(screen.getByTestId("err-currentRole")).toBeInTheDocument();

    // Type to clear error path verification execution branch
    const roleInput = container.querySelector('input[name="currentRole"]');
    await user.type(roleInput, "Architect");
    expect(screen.queryByTestId("err-currentRole")).not.toBeInTheDocument();
  });

  // ── Error Scrolling Prioritizations ─────────────────────────────────────
  it("should trigger element scroll position visibility tracking across priority cascades on validation fail", async () => {
    const user = userEvent.setup();
    render(<OnboardingFormShell />);

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));

    expect(screen.getByTestId("err-currentRole")).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("should attempt fallback target selector checks by component ref rules if specific layout sections fail validation", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    // Populate standard fields to leave only the skills section failing
    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "Engineer",
    );
    await user.type(
      container.querySelector('input[name="yearsOfExperience"]'),
      "5",
    );
    await user.type(
      container.querySelector('input[name="industry"]'),
      "Software",
    );

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));

    expect(screen.getByTestId("err-skills")).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalled();
  });

  // ── Summary Data Validation Matrix Checks ─────────────────────────────
  it("should prevent submission and log error labels if alpha fields consist solely of integer digits", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "12345",
    );
    await user.type(
      container.querySelector('input[name="yearsOfExperience"]'),
      "4",
    );
    await user.type(container.querySelector('input[name="industry"]'), "Tech");

    const skillsInput = container.querySelector('input[name="skillsTrigger"]');
    await user.type(skillsInput, "Rust");

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(
      screen.getByText("Current Role cannot be a number."),
    ).toBeInTheDocument();

    // Reset and test numeric company constraints scenario
    await user.clear(container.querySelector('input[name="currentRole"]'));
    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "Manager",
    );
    await user.type(container.querySelector('input[name="company"]'), "888");

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(
      screen.getByText("Company name cannot be a number."),
    ).toBeInTheDocument();
  });

  it("should restrict rate configuration metrics strictly within the range of 1 to 100 upon submit checks", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "Staff Dev",
    );
    await user.type(
      container.querySelector('input[name="yearsOfExperience"]'),
      "9",
    );
    await user.type(container.querySelector('input[name="industry"]'), "AI");

    const skillsInput = container.querySelector('input[name="skillsTrigger"]');
    await user.type(skillsInput, "Python");

    // Set out-of-bounds hourlyRate directly bypassing real-time character typing limits via value replacement mock setup
    fireEvent.change(container.querySelector('input[name="hourlyRate"]'), {
      target: { value: "0" },
    });
    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(
      screen.getByText("Session rate must be between ₹1 and ₹100."),
    ).toBeInTheDocument();
  });

  it("should fail validation requests when incorrect social link URI expressions are input", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "Consultant",
    );
    await user.type(
      container.querySelector('input[name="yearsOfExperience"]'),
      "6",
    );
    await user.type(container.querySelector('input[name="industry"]'), "Web3");

    const skillsInput = container.querySelector('input[name="skillsTrigger"]');
    await user.type(skillsInput, "Solidity");

    await user.type(
      container.querySelector('input[name="linkedInUrl"]'),
      "corrupted-linkedin-link",
    );

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(
      screen.getByText(/Please enter a valid LinkedIn URL/),
    ).toBeInTheDocument();

    await user.clear(container.querySelector('input[name="linkedInUrl"]'));
    await user.type(
      container.querySelector('input[name="linkedInUrl"]'),
      "https://linkedin.com/in/test",
    );
    await user.type(
      container.querySelector('input[name="portfolioUrl"]'),
      "bad-portfolio-url",
    );

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));
    expect(
      screen.getByText(/Please enter a valid Portfolio URL/),
    ).toBeInTheDocument();
  });

  it("should execute submit actions safely and split string-based language values into cleaned collection arrays", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFormShell />);

    await user.type(
      container.querySelector('input[name="currentRole"]'),
      "Technical Architect",
    );
    await user.type(
      container.querySelector('input[name="yearsOfExperience"]'),
      "15",
    );
    await user.type(
      container.querySelector('input[name="industry"]'),
      "Cloud Solutions",
    );
    await user.type(
      container.querySelector('input[name="skillsTrigger"]'),
      "AWS,Kubernetes",
    );
    await user.type(
      container.querySelector('input[name="languages"]'),
      "English, Hindi, , Japanese ",
    );

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      submitMentorOnboarding(
        expect.objectContaining({
          languages: ["English", "Hindi", "Japanese"],
        }),
      ),
    );
  });

  it("should pass languages array straight through if the value is already structured as an array property", async () => {
    const prebuiltArrayState = {
      currentRole: "Lead Developer",
      yearsOfExperience: "8",
      industry: "DevOps",
      skills: ["Docker"],
      languages: ["German", "Spanish"],
    };
    sessionStorage.setItem(
      "mentorOnboardingForm",
      JSON.stringify(prebuiltArrayState),
    );

    const user = userEvent.setup();
    render(<OnboardingFormShell />);

    await user.click(screen.getByRole("button", { name: "Submit Profile →" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      submitMentorOnboarding(
        expect.objectContaining({
          languages: ["German", "Spanish"],
        }),
      ),
    );
  });

  // ── Effect Synchronizations & Lifecycle Coverage ─────────────────────────
  it("should translate Redux store error messages to locally displayed warning banners", () => {
    vi.mocked(useSelector).mockReturnValue({
      loading: false,
      error: "S3 Profile asset signature upload error.",
      successMsg: null,
    });

    render(<OnboardingFormShell />);
    expect(
      screen.getByText("S3 Profile asset signature upload error."),
    ).toBeInTheDocument();
  });

  it("should process structural route transitions when success updates clear session variables", () => {
    vi.useFakeTimers();
    vi.mocked(useSelector).mockReturnValue({
      loading: false,
      error: null,
      successMsg: "Profile synchronized completely.",
    });

    render(<OnboardingFormShell />);
    expect(screen.getByTestId("fullscreen-loader")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/verify-documents");
    vi.useRealTimers();
  });

  it("should execute message wiping clean-up functions on components unmount", () => {
    const { unmount } = render(<OnboardingFormShell />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(clearMentorOnboardingMessages());
  });
});
