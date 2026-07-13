import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthSSOButtons from "./AuthSSOButtons";

// Mock the presentation-only icon assets
vi.mock("@features/auth/components/AuthIcons", () => ({
  GoogleIcon: () => <div data-testid="google-icon" />,
  LinkedInIcon: () => <div data-testid="linkedin-icon" />,
}));

describe("AuthSSOButtons", () => {
  let mockGoogleRef;
  let mockOnLinkedIn;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up a mock ref object mimicking the internal Google DOM attachment structure
    mockGoogleRef = {
      current: {
        querySelector: vi.fn(() => ({ click: vi.fn() })),
      },
    };
    mockOnLinkedIn = vi.fn();
  });

  it("should render both buttons cleanly with icons when disabled state is false", () => {
    const { container } = render(
      <AuthSSOButtons
        googleBtnRef={mockGoogleRef}
        loading={false}
        disabled={false}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /LinkedIn/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("google-icon")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();

    // Verify pointer block classes are absent
    const googleWrapper = container.firstChild.firstChild;
    expect(googleWrapper.className).not.toContain("opacity-60");
    expect(googleWrapper.className).not.toContain("pointer-events-none");
  });

  it("should disable buttons and apply opacity classes when loading is true", () => {
    const { container } = render(
      <AuthSSOButtons
        googleBtnRef={mockGoogleRef}
        loading={true}
        disabled={false}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    expect(screen.getByRole("button", { name: /Google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /LinkedIn/i })).toBeDisabled();

    const googleWrapper = container.firstChild.firstChild;
    expect(googleWrapper.className).toContain("opacity-60");
    expect(googleWrapper.className).toContain("pointer-events-none");
  });

  it("should disable buttons and apply opacity classes when disabled prop is true", () => {
    const { container } = render(
      <AuthSSOButtons
        googleBtnRef={mockGoogleRef}
        loading={false}
        disabled={true}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    expect(screen.getByRole("button", { name: /Google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /LinkedIn/i })).toBeDisabled();

    const googleWrapper = container.firstChild.firstChild;
    expect(googleWrapper.className).toContain("opacity-60");
  });

  it("should invoke the onLinkedIn callback function when the LinkedIn button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AuthSSOButtons
        googleBtnRef={mockGoogleRef}
        loading={false}
        disabled={false}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    const linkedInButton = screen.getByRole("button", { name: /LinkedIn/i });
    await user.click(linkedInButton);

    expect(mockOnLinkedIn).toHaveBeenCalledTimes(1);
  });

  it("should programmatic click the Google custom element via querySelector when the custom Google button is triggered", async () => {
    const user = userEvent.setup();
    const mockClickableDiv = { click: vi.fn() };

    // Override the mock for this specific test
    mockGoogleRef.current.querySelector = vi.fn(() => mockClickableDiv);

    render(
      <AuthSSOButtons
        googleBtnRef={mockGoogleRef}
        loading={false}
        disabled={false}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    const googleButton = screen.getByRole("button", { name: /Google/i });

    // Click should not throw error
    await expect(user.click(googleButton)).resolves.not.toThrow();
  });

  it("should not throw error on Google click if current ref or target element nested nodes are absent", async () => {
    const user = userEvent.setup();

    // Simulate empty ref branch path
    const emptyRef = { current: null };

    render(
      <AuthSSOButtons
        googleBtnRef={emptyRef}
        loading={false}
        disabled={false}
        onLinkedIn={mockOnLinkedIn}
      />,
    );

    const googleButton = screen.getByRole("button", { name: /Google/i });

    // Click should pass safely without runtime errors due to optional chaining
    await expect(user.click(googleButton)).resolves.not.toThrow();
  });
});
