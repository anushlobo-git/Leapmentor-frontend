/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SuccessCard from "./SuccessCard";

describe("SuccessCard", () => {
  it("should render component", () => {
    render(<SuccessCard />);
    const card = screen.getByText("Success Rate");
    expect(card).toBeInTheDocument();
  });

  it("should display 98% value", () => {
    render(<SuccessCard />);
    expect(screen.getByText("98%")).toBeInTheDocument();
  });

  it("should display description text", () => {
    render(<SuccessCard />);
    expect(screen.getByText("Mentee satisfaction rise across all verified programs.")).toBeInTheDocument();
  });

  it("should have base container classes", () => {
    const { container } = render(<SuccessCard />);
    const card = container.firstChild;
    expect(card).toHaveClass("absolute");
    expect(card).toHaveClass("bottom-6");
    expect(card).toHaveClass("right-4");
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("rounded-2xl");
    expect(card).toHaveClass("shadow-xl");
    expect(card).toHaveClass("p-4");
    expect(card).toHaveClass("w-52");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-gray-100");
  });

  it("should render green check icon container", () => {
    const { container } = render(<SuccessCard />);
    const iconContainer = container.querySelector(".bg-green-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass("w-7");
    expect(iconContainer).toHaveClass("h-7");
    expect(iconContainer).toHaveClass("rounded-full");
  });

  it("should render SVG check icon", () => {
    const { container } = render(<SuccessCard />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("should have correct check icon path", () => {
    const { container } = render(<SuccessCard />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M20 6L9 17l-5-5");
    expect(path).toHaveAttribute("stroke", "#16A34A");
    expect(path).toHaveAttribute("stroke-width", "2.5");
  });

  it("should have Success Rate label styling", () => {
    render(<SuccessCard />);
    const label = screen.getByText("Success Rate");
    expect(label).toHaveClass("text-xs");
    expect(label).toHaveClass("text-gray-600");
    expect(label).toHaveClass("uppercase");
    expect(label).toHaveClass("tracking-wide");
    expect(label).toHaveClass("font-medium");
  });

  it("should have value styling", () => {
    render(<SuccessCard />);
    const value = screen.getByText("98%");
    expect(value).toHaveClass("text-2xl");
    expect(value).toHaveClass("font-extrabold");
    expect(value).toHaveClass("text-gray-900");
    expect(value).toHaveClass("leading-none");
  });

  it("should have description styling", () => {
    render(<SuccessCard />);
    const description = screen.getByText("Mentee satisfaction rise across all verified programs.");
    expect(description).toHaveClass("text-xs");
    expect(description).toHaveClass("text-gray-600");
    expect(description).toHaveClass("mt-1");
  });

  it("should have flex container for icon and text", () => {
    const { container } = render(<SuccessCard />);
    const flexContainer = container.querySelector(".flex");
    expect(flexContainer).toHaveClass("items-center");
    expect(flexContainer).toHaveClass("gap-2");
    expect(flexContainer).toHaveClass("mb-1");
  });
});
