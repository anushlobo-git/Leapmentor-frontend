/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LinkedInIcon from "./LinkedInIcon";

describe("LinkedInIcon", () => {
  it("should render with default props", () => {
    const { container } = render(<LinkedInIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("should render with custom width and height", () => {
    const { container } = render(<LinkedInIcon width="24" height="24" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("should render with custom className", () => {
    const { container } = render(<LinkedInIcon className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have default fill color", () => {
    const { container } = render(<LinkedInIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "#0A66C2");
  });

  it("should render with custom fill color", () => {
    const { container } = render(<LinkedInIcon fill="#0077b5" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "#0077b5");
  });

  it("should have correct viewBox", () => {
    const { container } = render(<LinkedInIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should have aria-hidden attribute", () => {
    const { container } = render(<LinkedInIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render path element", () => {
    const { container } = render(<LinkedInIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("should have correct path d attribute", () => {
    const { container } = render(<LinkedInIcon />);
    const path = container.querySelector("path");
    expect(path.getAttribute("d")).toContain("20.45 20.45h-3.554");
  });
});
