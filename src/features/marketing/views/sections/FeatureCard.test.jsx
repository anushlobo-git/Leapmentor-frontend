import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FeatureCard from "./FeatureCard";

// ── 1. Mock External Component Dependency ──────────────────────────────────
vi.mock("@components/ui/Card", () => ({
  default: ({ children, className }) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
}));

// ── 2. Test Suite ─────────────────────────────────────────────────────────
describe("FeatureCard", () => {
  it("should render the icon node, title, and description text fragments accurately", () => {
    const defaultProps = {
      icon: <span data-testid="test-icon">🚀</span>,
      title: "Interactive Sessions",
      description:
        "Engage with industry veterans via real-time 1:1 collaborative workspaces.",
    };

    render(<FeatureCard {...defaultProps} />);

    // Verify the presence of injected icon node
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();

    // Verify the heading component with exact typography value matches
    expect(
      screen.getByRole("heading", { name: "Interactive Sessions", level: 3 }),
    ).toBeInTheDocument();

    // Verify supportive description paragraph details block
    expect(
      screen.getByText(
        "Engage with industry veterans via real-time 1:1 collaborative workspaces.",
      ),
    ).toBeInTheDocument();
  });

  it("should append the custom layout padding class variant down onto the underlying wrap Card structure", () => {
    const minimalProps = {
      icon: <span>⭐</span>,
      title: "Title",
      description: "Description",
    };

    render(<FeatureCard {...minimalProps} />);

    const layoutCardElement = screen.getByTestId("mock-card");
    expect(layoutCardElement).toHaveClass("p-8");
  });
});
