/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("should render children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("should have base classes", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("rounded-2xl");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-gray-100");
    expect(card).toHaveClass("shadow-sm");
  });

  it("should have hover classes", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("hover:shadow-md");
    expect(card).toHaveClass("hover:-translate-y-1");
  });

  it("should have transition classes", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("transition-all");
    expect(card).toHaveClass("duration-300");
    expect(card).toHaveClass("group");
  });

  it("should accept custom className", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("custom-class");
  });

  it("should render multiple children", () => {
    render(
      <Card>
        <div>First child</div>
        <div>Second child</div>
      </Card>
    );
    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
  });

  it("should render nested components", () => {
    render(
      <Card>
        <div>
          <span>Nested</span>
        </div>
      </Card>
    );
    expect(screen.getByText("Nested")).toBeInTheDocument();
  });
});
