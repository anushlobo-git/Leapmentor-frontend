/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LetterBall from "./LetterBall";

describe("LetterBall", () => {
  it("should render with letter and color", () => {
    render(<LetterBall letter="A" color="bg-blue-500" />);
    const div = screen.getByText("A");
    expect(div).toBeInTheDocument();
  });

  it("should render with number letter", () => {
    render(<LetterBall letter={1} color="bg-red-500" />);
    const div = screen.getByText("1");
    expect(div).toBeInTheDocument();
  });

  it("should have base classes", () => {
    const { container } = render(<LetterBall letter="A" color="bg-blue-500" />);
    const div = container.firstChild;
    expect(div).toHaveClass("rounded-full");
    expect(div).toHaveClass("border-2");
    expect(div).toHaveClass("border-white");
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("items-center");
    expect(div).toHaveClass("justify-center");
    expect(div).toHaveClass("text-white");
    expect(div).toHaveClass("font-bold");
    expect(div).toHaveClass("shrink-0");
  });

  it("should have small size classes", () => {
    const { container } = render(<LetterBall letter="A" color="bg-blue-500" size="sm" />);
    const div = container.firstChild;
    expect(div).toHaveClass("w-7");
    expect(div).toHaveClass("h-7");
    expect(div).toHaveClass("text-xs");
  });

  it("should have medium size classes (default)", () => {
    const { container } = render(<LetterBall letter="A" color="bg-blue-500" />);
    const div = container.firstChild;
    expect(div).toHaveClass("w-9");
    expect(div).toHaveClass("h-9");
    expect(div).toHaveClass("text-xs");
  });

  it("should have large size classes", () => {
    const { container } = render(<LetterBall letter="A" color="bg-blue-500" size="lg" />);
    const div = container.firstChild;
    expect(div).toHaveClass("w-10");
    expect(div).toHaveClass("h-10");
    expect(div).toHaveClass("text-sm");
  });

  it("should apply custom color class", () => {
    const { container } = render(<LetterBall letter="A" color="bg-purple-600" />);
    const div = container.firstChild;
    expect(div).toHaveClass("bg-purple-600");
  });

  it("should render letter as text", () => {
    render(<LetterBall letter="J" color="bg-blue-500" />);
    const div = screen.getByText("J");
    expect(div.tagName).toBe("DIV");
  });
});
