import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterMentee from "./RegisterMentee";
import AuthLeftPanel from "@features/auth/components/AuthLeftPanel";
import RegisterForm from "@features/auth/components/RegisterForm";

// Mock child components to perfectly isolate testing the prop passing and structure composition of RegisterMentee
vi.mock("@features/auth/components/AuthLeftPanel", () => ({
  default: vi.fn(({ imageSrc, imageAlt, badge, heading, subtext, stats }) => (
    <div data-testid="mock-auth-left-panel">
      <span data-testid="panel-image-src">{imageSrc}</span>
      <span data-testid="panel-image-alt">{imageAlt}</span>
      <span data-testid="panel-badge">{badge}</span>
      <div data-testid="panel-heading">{heading}</div>
      <div data-testid="panel-subtext">{subtext}</div>
      <div data-testid="panel-stats">{JSON.stringify(stats)}</div>
    </div>
  )),
}));

vi.mock("@features/auth/components/RegisterForm", () => ({
  default: vi.fn(({ role }) => (
    <div data-testid="mock-register-form" data-role={role} />
  )),
}));

describe("RegisterMentee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component structure with layout styling wrapper classes", () => {
    const { container } = render(<RegisterMentee />);

    const rootContainer = container.firstChild;
    expect(rootContainer).toHaveClass("flex", "min-h-screen", "bg-slate-50");

    expect(screen.getByTestId("mock-auth-left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("mock-register-form")).toBeInTheDocument();
  });

  it("should supply correct imagery assets, tags, text contents, and stats configurations to AuthLeftPanel", () => {
    render(<RegisterMentee />);

    expect(screen.getByTestId("panel-image-src")).toHaveTextContent(
      "/images/mentee-bg.jpg",
    );
    expect(screen.getByTestId("panel-image-alt")).toHaveTextContent(
      "Mentees learning",
    );
    expect(screen.getByTestId("panel-badge")).toHaveTextContent(
      "🚀 Start your growth journey today",
    );
    expect(screen.getByTestId("panel-heading")).toHaveTextContent(
      "Find the mentor whounlocks your potential.",
    );
    expect(screen.getByTestId("panel-subtext")).toHaveTextContent(
      "Connect with world-class mentors and accelerateyour career like never before.",
    );

    // Validate static statistics content array matches exactly
    const statsContainer = screen.getByTestId("panel-stats");
    const parsedStats = JSON.parse(statsContainer.textContent);
    expect(parsedStats).toEqual([
      { num: "50K+", label: "Mentees" },
      { num: "200+", label: "Skills" },
      { num: "4.9★", label: "Rating" },
    ]);

    expect(AuthLeftPanel).toHaveBeenCalledTimes(1);
  });

  it("should initialize RegisterForm explicitly passing the mentee role attribute", () => {
    render(<RegisterMentee />);

    const formElement = screen.getByTestId("mock-register-form");
    expect(formElement).toHaveAttribute("data-role", "mentee");

    expect(RegisterForm).toHaveBeenCalledTimes(1);
  });
});
