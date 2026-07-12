/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("should render value and label", () => {
    render(<StatCard value="100" label="Total Users" gradientFrom="#8b5cf6" gradientTo="#ec4899" />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("should render numeric value", () => {
    render(<StatCard value={500} label="Sessions" gradientFrom="#3b82f6" gradientTo="#06b6d4" />);
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("should render Card component", () => {
    const { container } = render(<StatCard value="10" label="Test" gradientFrom="#000" gradientTo="#fff" />);
    const card = container.querySelector(".bg-white");
    expect(card).toBeInTheDocument();
  });

  it("should apply custom className to Card", () => {
    const { container } = render(<StatCard value="10" label="Test" gradientFrom="#000" gradientTo="#fff" />);
    const card = container.firstChild;
    expect(card).toHaveClass("text-center");
    expect(card).toHaveClass("py-5");
    expect(card).toHaveClass("px-4");
  });

  it("should apply gradient style to value", () => {
    const { container } = render(<StatCard value="100" label="Test" gradientFrom="#8b5cf6" gradientTo="#ec4899" />);
    const valueElement = container.querySelector(".text-3xl");
    expect(valueElement).toHaveStyle({
      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    });
  });

  it("should have correct value styling", () => {
    const { container } = render(<StatCard value="100" label="Test" gradientFrom="#000" gradientTo="#fff" />);
    const valueElement = container.querySelector(".text-3xl");
    expect(valueElement).toHaveClass("font-extrabold");
  });

  it("should have correct label styling", () => {
    render(<StatCard value="100" label="Test Label" gradientFrom="#000" gradientTo="#fff" />);
    const labelElement = screen.getByText("Test Label");
    expect(labelElement).toHaveClass("text-sm");
    expect(labelElement).toHaveClass("text-gray-500");
    expect(labelElement).toHaveClass("mt-1");
  });

  it("should handle string value", () => {
    render(<StatCard value="$1M" label="Revenue" gradientFrom="#000" gradientTo="#fff" />);
    expect(screen.getByText("$1M")).toBeInTheDocument();
  });

  it("should handle zero value", () => {
    render(<StatCard value={0} label="Zero" gradientFrom="#000" gradientTo="#fff" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
