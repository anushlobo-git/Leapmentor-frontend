/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GoogleIcon from "./GoogleIcon";

describe("GoogleIcon", () => {
  it("should render with default props", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("should render with custom width and height", () => {
    const { container } = render(<GoogleIcon width="24" height="24" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("should render with custom className", () => {
    const { container } = render(<GoogleIcon className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should have correct viewBox", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should have aria-hidden attribute", () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("should render 4 path elements", () => {
    const { container } = render(<GoogleIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(4);
  });

  it("should have correct colors for paths", () => {
    const { container } = render(<GoogleIcon />);
    const paths = container.querySelectorAll("path");
    expect(paths[0]).toHaveAttribute("fill", "#4285F4");
    expect(paths[1]).toHaveAttribute("fill", "#34A853");
    expect(paths[2]).toHaveAttribute("fill", "#FBBC05");
    expect(paths[3]).toHaveAttribute("fill", "#EA4335");
  });
});
