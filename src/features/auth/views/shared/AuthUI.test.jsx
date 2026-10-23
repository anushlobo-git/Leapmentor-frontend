import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthMessageBanner, AuthDivider, AuthField, AuthBrand } from "./AuthUI";

describe("AuthUI components", () => {
  it("renders a success message banner with the correct class", () => {
    render(<AuthMessageBanner type="success" text="Success saved" />);

    const banner = screen.getByText(/Success saved/i);
    expect(banner).toHaveClass("bg-green-50");
    expect(banner).toHaveClass("text-green-700");
  });

  it("renders an error message banner when type is unknown and falls back to error styling", () => {
    render(<AuthMessageBanner type="unknown" text="Something went wrong" />);

    const banner = screen.getByText(/Something went wrong/i);
    expect(banner).toHaveClass("bg-red-50");
    expect(banner).toHaveClass("text-red-700");
  });

  it("does not render the banner when text is empty", () => {
    const { container } = render(<AuthMessageBanner type="info" text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the divider with default text and custom text", () => {
    const { rerender } = render(<AuthDivider />);
    expect(screen.getByText(/Or sign up with/i)).toBeInTheDocument();

    rerender(<AuthDivider label="Or continue with" />);
    expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
  });

  it("renders a labeled auth field with hint text", () => {
    render(
      <AuthField
        label="Email"
        placeholder="you@example.com"
        hint="This will be your login email"
      />,
    );

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This will be your login email/i),
    ).toBeInTheDocument();
  });

  it("renders the brand with a provided logo element", () => {
    render(<AuthBrand logo={<span data-testid="brand-logo">Logo</span>} />);
    expect(screen.getByTestId("brand-logo")).toBeInTheDocument();
    expect(screen.getByText(/LeapMentor/i)).toBeInTheDocument();
  });
});
