/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ChevronIcon from "./ChevronIcon";

describe("ChevronIcon", () => {
  it("should render with isOpen false by default", () => {
    const { container } = render(<ChevronIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveClass("rotate-180");
  });

  it("should render with isOpen false explicitly", () => {
    const { container } = render(<ChevronIcon isOpen={false} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveClass("rotate-180");
  });

  it("should render with isOpen true", () => {
    const { container } = render(<ChevronIcon isOpen={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("rotate-180");
  });

  it("should have base classes", () => {
    const { container } = render(<ChevronIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-4");
    expect(svg).toHaveClass("h-4");
    expect(svg).toHaveClass("transition-transform");
    expect(svg).toHaveClass("duration-200");
  });

  it("should have correct SVG attributes", () => {
    const { container } = render(<ChevronIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should render path element", () => {
    const { container } = render(<ChevronIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("strokeLinecap", "round");
    expect(path).toHaveAttribute("strokeLinejoin", "round");
    expect(path).toHaveAttribute("strokeWidth", "2");
  });

  it("should have correct path d attribute", () => {
    const { container } = render(<ChevronIcon />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M19 9l-7 7-7-7");
  });
});
