import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import LoginMentor from "./LoginMentor";

// Mock external subcomponents using exact path aliases
vi.mock("@features/auth/components/LoginLeftPanel", () => ({
  default: () => <div data-testid="mock-left-panel">Left Panel Content</div>,
}));

vi.mock("@features/auth/components/LoginForm", () => ({
  default: ({ placeholder, registerPath }) => (
    <div data-testid="mock-login-form">
      <span>Placeholder: {placeholder}</span>
      <span>Path: {registerPath}</span>
    </div>
  ),
}));

describe("LoginMentor", () => {
  it("should render the decorative left panel and the login form with custom mentor parameters", () => {
    render(<LoginMentor />);

    // Assert the layout container structure wraps components correctly
    expect(screen.getByTestId("mock-left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("mock-login-form")).toBeInTheDocument();

    // Verify correct properties are passed downward to interceptor components
    expect(
      screen.getByText("Placeholder: mentor@example.com"),
    ).toBeInTheDocument();
    expect(screen.getByText("Path: /register")).toBeInTheDocument();
  });
});
