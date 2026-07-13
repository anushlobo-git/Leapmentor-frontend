import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./Register";

// ── Mock External Components ───────────────────────────────────────────────
vi.mock("@features/auth/components/AuthLeftPanel", () => ({
  default: vi.fn(({ badge, heading, subtext, stats }) => (
    <div data-testid="auth-left-panel">
      <span>Badge: {badge}</span>
      <div data-testid="panel-heading">{heading}</div>
      <div data-testid="panel-subtext">{subtext}</div>
      <div data-testid="panel-stats">
        {stats.map((s) => `${s.num}-${s.label}`).join(", ")}
      </div>
    </div>
  )),
}));

vi.mock("@features/auth/components/RegisterForm", () => ({
  default: vi.fn(({ role }) => (
    <div data-testid="register-form">Form Role: {role}</div>
  )),
}));

vi.mock("@features/auth/components/AuthIcons", () => ({
  LeapMentorLogo: vi.fn(() => (
    <span data-testid="mock-logo">LeapMentorLogo</span>
  )),
}));

vi.mock("@features/auth/components/AuthUI", () => ({
  AuthBrand: vi.fn(({ logo }) => <div data-testid="auth-brand">{logo}</div>),
}));

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default view with mentee role configurations", () => {
    render(<Register />);

    // Verify brand logo components are initialized correctly
    expect(screen.getByTestId("auth-brand")).toBeInTheDocument();
    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();

    // Verify Mentee layout configurations propagate correctly to Left Panel
    expect(screen.getByTestId("auth-left-panel")).toBeInTheDocument();
    expect(
      screen.getByText("Badge: 🚀 Start your growth journey today"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("panel-heading")).toHaveTextContent(
      "Find the mentor whounlocks your potential.",
    );
    expect(screen.getByTestId("panel-subtext")).toHaveTextContent(
      "Connect with world-class mentors and accelerateyour career like never before.",
    );
    expect(screen.getByTestId("panel-stats")).toHaveTextContent(
      "50K+-Mentees, 200+-Skills, 4.9★-Rating",
    );

    // Verify the appropriate form role structure gets rendered
    expect(screen.getByTestId("register-form")).toHaveTextContent(
      "Form Role: mentee",
    );

    // Verify style state markers on default selection buttons
    const menteeToggleButton = screen.getByRole("button", {
      name: "Find a Mentor",
    });
    expect(menteeToggleButton).toHaveClass("bg-white text-blue-900 shadow-sm");
  });

  it("should toggle application view context to mentor configurations when selected", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const mentorToggleButton = screen.getByRole("button", {
      name: "Become a Mentor",
    });
    await user.click(mentorToggleButton);

    // Verify the style updates to mark Mentor tab active
    expect(mentorToggleButton).toHaveClass("bg-white text-blue-900 shadow-sm");

    // Verify Left Panel mutates layout to match Mentor configurations
    expect(
      screen.getByText("Badge: 🌍 Trusted by 10,000+ mentors globally"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("panel-heading")).toHaveTextContent(
      "Empowering the nextgeneration of leaders.",
    );
    expect(screen.getByTestId("panel-subtext")).toHaveTextContent(
      "Join over 10,000+ mentors globally and start makingan impact today.",
    );
    expect(screen.getByTestId("panel-stats")).toHaveTextContent(
      "10K+-Mentors, 50K+-Sessions, 98%-Satisfaction",
    );

    // Verify the structural form re-initializes under the mentor role context
    expect(screen.getByTestId("register-form")).toHaveTextContent(
      "Form Role: mentor",
    );
  });

  it("should allow shifting view contexts back to mentee selections seamlessly after toggling mentor state", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const mentorToggleButton = screen.getByRole("button", {
      name: "Become a Mentor",
    });
    const menteeToggleButton = screen.getByRole("button", {
      name: "Find a Mentor",
    });

    // Step into Mentor view state
    await user.click(mentorToggleButton);
    expect(screen.getByTestId("register-form")).toHaveTextContent(
      "Form Role: mentor",
    );

    // Click back onto Mentee selection view state
    await user.click(menteeToggleButton);
    expect(screen.getByTestId("register-form")).toHaveTextContent(
      "Form Role: mentee",
    );
    expect(menteeToggleButton).toHaveClass("bg-white text-blue-900 shadow-sm");
  });
});
