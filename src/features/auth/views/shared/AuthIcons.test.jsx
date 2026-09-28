import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  LinkedInIcon,
  AppleIcon,
  GoogleIcon,
  LeapMentorLogo,
} from "./AuthIcons";

// Mock external constants module to prevent runtime asset resolution crashes
vi.mock("@constants/images", () => ({
  IMAGES: {
    LOGO: "https://test-cdn.leapmentor.com/assets/logo.svg",
  },
}));

describe("AuthIcons Components", () => {
  it("should render LinkedInIcon with standard dimensions and brand filling color rules", () => {
    const { container } = render(<LinkedInIcon />);
    const svgElement = container.querySelector("svg");

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("width", "18");
    expect(svgElement).toHaveAttribute("height", "18");
    expect(svgElement).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svgElement).toHaveAttribute("fill", "#0A66C2");
  });

  it("should render AppleIcon with proper view box constraints and theme current color rules", () => {
    const { container } = render(<AppleIcon />);
    const svgElement = container.querySelector("svg");

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("width", "18");
    expect(svgElement).toHaveAttribute("height", "18");
    expect(svgElement).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svgElement).toHaveAttribute("fill", "currentColor");
  });

  it("should render GoogleIcon containing four multi-colored branding path nodes", () => {
    const { container } = render(<GoogleIcon />);
    const svgElement = container.querySelector("svg");

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("width", "18");
    expect(svgElement).toHaveAttribute("height", "18");

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(4);

    // Assert key Google brand layout colors are present across SVG vector layers
    const colors = Array.from(paths).map((p) => p.getAttribute("fill"));
    expect(colors).toContain("#4285F4");
    expect(colors).toContain("#34A853");
    expect(colors).toContain("#FBBC05");
    expect(colors).toContain("#EA4335");
  });

  it("should render LeapMentorLogo image node with correct accessible fallback text and mocked source layout path", () => {
    render(<LeapMentorLogo />);

    const logoImg = screen.getByRole("img", { name: /LeapMentor logo/i });

    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute(
      "src",
      "https://test-cdn.leapmentor.com/assets/logo.svg",
    );
    expect(logoImg).toHaveClass("h-8 w-8");
    expect(logoImg).toHaveAttribute("width", "32");
    expect(logoImg).toHaveAttribute("height", "32");
  });
});
