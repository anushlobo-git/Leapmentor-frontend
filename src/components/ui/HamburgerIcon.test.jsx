/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import HamburgerIcon from "./HamburgerIcon";

describe("HamburgerIcon", () => {
  it("should render with isOpen false", () => {
    const { container } = render(<HamburgerIcon isOpen={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render with isOpen true", () => {
    const { container } = render(<HamburgerIcon isOpen={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have base SVG attributes", () => {
    const { container } = render(<HamburgerIcon isOpen={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("should have transition class", () => {
    const { container } = render(<HamburgerIcon isOpen={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("transition-transform");
    expect(svg).toHaveClass("duration-200");
  });

  it("should render hamburger lines when isOpen is false", () => {
    const { container } = render(<HamburgerIcon isOpen={false} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M4 6h16M4 12h16M4 18h16");
  });

  it("should render X when isOpen is true", () => {
    const { container } = render(<HamburgerIcon isOpen={true} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M6 18L18 6M6 6l12 12");
  });

  it("should have correct path attributes", () => {
    const { container } = render(<HamburgerIcon isOpen={false} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke-linecap", "round");
    expect(path).toHaveAttribute("stroke-linejoin", "round");
    expect(path).toHaveAttribute("stroke-width", "2");
  });
});
