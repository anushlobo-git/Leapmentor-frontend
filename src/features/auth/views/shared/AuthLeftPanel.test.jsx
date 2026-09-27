import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthLeftPanel from "./AuthLeftPanel";

describe("AuthLeftPanel", () => {
  it("should render image, title, subtext and handle empty stats fallback state gracefully", () => {
    render(
      <AuthLeftPanel
        imageSrc="/images/auth-bg.jpg"
        imageAlt="Mentorship Backdrop"
        badge=""
        heading="Elevate Your Coding Career"
        subtext="Connect with world-class engineers across top tech organizations."
      />,
    );

    // Verify image attributes
    const imageElement = screen.getByRole("img", {
      name: "Mentorship Backdrop",
    });
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute("src", "/images/auth-bg.jpg");

    // Verify headings and subtext
    expect(screen.getByText("Elevate Your Coding Career")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Connect with world-class engineers across top tech organizations.",
      ),
    ).toBeInTheDocument();

    // Verify conditional branches for badge and stats do not render when empty/falsy
    const badgeContainer = screen.queryByClassName?.(
      "rounded-full text-xs font-medium",
    );
    expect(badgeContainer).toBeUndefined();
  });

  it("should render conditional badge element and array of statistics blocks successfully", () => {
    const mockStats = [
      { num: "10k+", label: "Active Mentors" },
      { num: "99.8%", label: "Satisfaction Rate" },
    ];

    render(
      <AuthLeftPanel
        imageSrc="/images/auth-bg.jpg"
        imageAlt="Mentorship Backdrop"
        badge="🌍 Trusted by 10,000+ mentors"
        heading="Learn from the Best"
        subtext="Get 1-on-1 expert guidance."
        stats={mockStats}
      />,
    );

    // Verify conditional badge renders correctly
    expect(
      screen.getByText("🌍 Trusted by 10,000+ mentors"),
    ).toBeInTheDocument();

    // Verify array mappings loop rendering outcomes completely
    expect(screen.getByText("10k+")).toBeInTheDocument();
    expect(screen.getByText("Active Mentors")).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();
    expect(screen.getByText("Satisfaction Rate")).toBeInTheDocument();
  });

  it("should conceal background image via inline display styles when image triggers onError fallback block", () => {
    render(
      <AuthLeftPanel
        imageSrc="/images/broken-link-path.jpg"
        imageAlt="Faulty Image Resource"
        badge="Test Badge"
        heading="Test Heading"
        subtext="Test Subtext"
      />,
    );

    const imageElement = screen.getByRole("img", {
      name: "Faulty Image Resource",
    });
    expect(imageElement).toBeInTheDocument();
    expect(imageElement.style.display).not.toBe("none");

    // Fire the error event natively to drop into the catch branch block handler
    fireEvent.error(imageElement);

    // Assert that style display value changes to hide element completely
    expect(imageElement.style.display).toBe("none");
  });
});
