/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SideArrow from "./SideArrow";

describe("SideArrow", () => {
  it("should render button", () => {
    render(<SideArrow onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should have base classes", () => {
    render(<SideArrow onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hidden");
    expect(button).toHaveClass("md:flex");
    expect(button).toHaveClass("w-10");
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("border-gray-200");
    expect(button).toHaveClass("bg-white");
    expect(button).toHaveClass("shadow-sm");
  });

  it("should have flex layout classes", () => {
    render(<SideArrow onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("justify-center");
  });

  it("should have hover classes", () => {
    render(<SideArrow onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-violet-50");
    expect(button).toHaveClass("hover:border-violet-200");
  });

  it("should have transition and z-index classes", () => {
    render(<SideArrow onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("transition-all");
    expect(button).toHaveClass("shrink-0");
    expect(button).toHaveClass("z-10");
  });

  it("should render SVG icon", () => {
    const { container } = render(<SideArrow onClick={() => {}} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should have correct SVG attributes", () => {
    const { container } = render(<SideArrow onClick={() => {}} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("stroke", "#7c3aed");
    expect(svg).toHaveAttribute("strokeWidth", "2.5");
    expect(svg).toHaveAttribute("strokeLinecap", "round");
  });

  it("should render polyline element", () => {
    const { container } = render(<SideArrow onClick={() => {}} />);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    expect(polyline).toHaveAttribute("points", "9 18 15 12 9 6");
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<SideArrow onClick={handleClick} />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
