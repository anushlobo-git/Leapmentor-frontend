import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginMentee from "./LoginMentee";

// ── 1. Mock Child Components & Track Prop Passing ─────────────────────────
vi.mock("@features/auth/components/LoginLeftPanel", () => ({
  default: () => <div data-testid="login-left-panel">Mocked Left Panel</div>,
}));

vi.mock("@features/auth/components/LoginForm", () => ({
  default: ({ placeholder, registerPath }) => (
    <div data-testid="login-form">
      <span>Form Placeholder: {placeholder}</span>
      <span>Redirect Destination: {registerPath}</span>
    </div>
  ),
}));

// ── 2. Test Suite ─────────────────────────────────────────────────────────
describe("LoginMentee", () => {
  it("should render the structural layout containers correctly", () => {
    render(<LoginMentee />);

    // Validate that the semantic main element is present
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toBeInTheDocument();

    // Verify left visual side-panel mounting
    expect(screen.getByTestId("login-left-panel")).toBeInTheDocument();
  });

  it("should forward correct default props down onto the internal Login Form", () => {
    render(<LoginMentee />);

    // Find the login form and inspect text fragments generated from forwarded props
    const loginFormContainer = screen.getByTestId("login-form");
    expect(loginFormContainer).toBeInTheDocument();

    expect(
      screen.getByText("Form Placeholder: you@example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Redirect Destination: /register"),
    ).toBeInTheDocument();
  });
});
  