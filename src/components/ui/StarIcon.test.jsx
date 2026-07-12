/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import StarIcon from "./StarIcon";

describe("StarIcon", () => {
  it("should render with filled true by default", () => {
    const { container } = render(<StarIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("fill", "#FBBF24");
  });

  it("should render with filled true explicitly", () => {
    const { container } = render(<StarIcon filled={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "#FBBF24");
  });

  it("should render with filled false", () => {
    const { container } = render(<StarIcon filled={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "#D1D5DB");
  });

  it("should have correct SVG attributes", () => {
    const { container } = render(<StarIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("should have data-testid attribute", () => {
    const { container } = render(<StarIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-testid", "star-icon");
  });

  it("should render path element", () => {
    const { container } = render(<StarIcon />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("should have correct path d attribute", () => {
    const { container } = render(<StarIcon />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
  });
});
