import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterMentor from "./RegisterMentor";

// Mock external building blocks to verify prop allocation and isolate execution paths
vi.mock("@features/auth/components/AuthLeftPanel", () => ({
  default: ({ imageSrc, imageAlt, badge, heading, subtext, stats }) => (
    <div data-testid="auth-left-panel">
      <span data-testid="panel-src">{imageSrc}</span>
      <span data-testid="panel-alt">{imageAlt}</span>
      <span data-testid="panel-badge">{badge}</span>
      <div data-testid="panel-heading">{heading}</div>
      <div data-testid="panel-subtext">{subtext}</div>
      <div data-testid="panel-stats">
        {stats.map((s) => `${s.num}:${s.label}`).join(",")}
      </div>
    </div>
  ),
}));

vi.mock("@features/auth/components/RegisterForm", () => ({
  default: ({ role }) => (
    <div data-testid="register-form" data-role={role}>
      Register Form Container
    </div>
  ),
}));

describe("RegisterMentor", () => {
  it("should render the layout shell with correctly structured auth panel and form parameters", () => {
    render(<RegisterMentor />);

    // Assert the form container renders with the correct dedicated role prop configuration
    const formElement = screen.getByTestId("register-form");
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveAttribute("data-role", "mentor");

    // Assert the layout components parse panel content metrics correctly
    expect(screen.getByTestId("auth-left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("panel-src")).toHaveTextContent(
      "/images/mentor-bg.jpg",
    );
    expect(screen.getByTestId("panel-alt")).toHaveTextContent(
      "Mentors collaborating",
    );
    expect(screen.getByTestId("panel-badge")).toHaveTextContent(
      "🌍 Trusted by 10,000+ mentors globally",
    );

    // Validate structural text segments within dynamic layout content elements
    expect(screen.getByTestId("panel-heading")).toHaveTextContent(
      "Empowering the nextgeneration of leaders.",
    );
    expect(screen.getByTestId("panel-subtext")).toHaveTextContent(
      "Join over 10,000+ mentors globally and start makingan impact today.",
    );

    // Validate accurate passing of statistical metric matrices
    expect(screen.getByTestId("panel-stats")).toHaveTextContent(
      "10K+:Mentors,50K+:Sessions,98%:Satisfaction",
    );
  });
});
