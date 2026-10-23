/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FullScreenLoader from "./FullScreenLoader";

describe("FullScreenLoader", () => {
  it("should render with default message", () => {
    render(<FullScreenLoader />);
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  });

  it("should render with custom message", () => {
    render(<FullScreenLoader message="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("should have fixed positioning", () => {
    const { container } = render(<FullScreenLoader />);
    const div = container.firstChild;
    expect(div).toHaveClass("fixed");
    expect(div).toHaveClass("inset-0");
  });

  it("should have z-index", () => {
    const { container } = render(<FullScreenLoader />);
    const div = container.firstChild;
    expect(div).toHaveClass("z-50");
  });

  it("should have background styling", () => {
    const { container } = render(<FullScreenLoader />);
    const div = container.firstChild;
    expect(div).toHaveClass("bg-white/80");
    expect(div).toHaveClass("backdrop-blur-sm");
  });

  it("should have flex layout", () => {
    const { container } = render(<FullScreenLoader />);
    const div = container.firstChild;
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("flex-col");
    expect(div).toHaveClass("items-center");
    expect(div).toHaveClass("justify-center");
  });

  it("should render SVG spinner", () => {
    const { container } = render(<FullScreenLoader />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });

  it("should have correct SVG attributes", () => {
    const { container } = render(<FullScreenLoader />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
    expect(svg).toHaveAttribute("viewBox", "0 0 40 40");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("should render circle element", () => {
    const { container } = render(<FullScreenLoader />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "20");
    expect(circle).toHaveAttribute("cy", "20");
    expect(circle).toHaveAttribute("r", "16");
  });

  it("should render path element", () => {
    const { container } = render(<FullScreenLoader />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("d", "M20 4a16 16 0 0 1 16 16");
  });

  it("should have message styling", () => {
    render(<FullScreenLoader message="Test" />);
    const message = screen.getByText("Test");
    expect(message).toHaveClass("text-sm");
    expect(message).toHaveClass("font-semibold");
    expect(message).toHaveClass("text-slate-600");
  });
});
