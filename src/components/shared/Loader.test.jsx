/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "./Loader";

describe("Loader", () => {
  it("should render with md size by default", () => {
    render(<Loader />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("should render with sm size", () => {
    render(<Loader size="sm" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("should render with lg size", () => {
    render(<Loader size="lg" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("should render message when provided", () => {
    render(<Loader message="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should not render message when not provided", () => {
    render(<Loader />);
    const message = document.querySelector("p");
    expect(message).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Loader className="custom-class" />);
    const div = container.firstChild;
    expect(div).toHaveClass("custom-class");
  });

  it("should apply minHeight when provided", () => {
    const { container } = render(<Loader minHeight="200px" />);
    const div = container.firstChild;
    expect(div).toHaveStyle({ minHeight: "200px" });
  });

  it("should not apply minHeight when not provided", () => {
    const { container } = render(<Loader />);
    const div = container.firstChild;
    expect(div.style.minHeight).toBe("");
  });

  it("should have base container classes", () => {
    const { container } = render(<Loader />);
    const div = container.firstChild;
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("flex-col");
    expect(div).toHaveClass("items-center");
    expect(div).toHaveClass("justify-center");
    expect(div).toHaveClass("gap-3");
  });

  it("should render SVG spinner", () => {
    render(<Loader />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });

  it("should have correct SVG viewBox", () => {
    render(<Loader />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 40 40");
    expect(svg).toHaveAttribute("fill", "none");
  });

  it("should render circle element", () => {
    render(<Loader />);
    const circle = document.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "20");
    expect(circle).toHaveAttribute("cy", "20");
    expect(circle).toHaveAttribute("r", "16");
  });

  it("should render path element", () => {
    render(<Loader />);
    const path = document.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("d", "M20 4a16 16 0 0 1 16 16");
  });

  it("should have message styling", () => {
    render(<Loader message="Test message" />);
    const message = screen.getByText("Test message");
    expect(message).toHaveClass("text-sm");
    expect(message).toHaveClass("font-semibold");
    expect(message).toHaveClass("text-slate-500");
  });

  it("should handle numeric minHeight", () => {
    const { container } = render(<Loader minHeight={300} />);
    const div = container.firstChild;
    expect(div).toHaveStyle({ minHeight: "300px" });
  });
});
