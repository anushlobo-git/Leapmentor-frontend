/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("should render with default title and message", () => {
    render(<EmptyState icon={<div>Icon</div>} />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
    expect(screen.getByText("There's nothing here yet.")).toBeInTheDocument();
  });

  it("should render custom title and message", () => {
    render(
      <EmptyState 
        icon={<div>Icon</div>} 
        title="Custom Title" 
        message="Custom message" 
      />
    );
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom message")).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    render(<EmptyState icon={<div data-testid="custom-icon">Custom Icon</div>} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render default icon when icon is not provided", () => {
    render(<EmptyState icon={null} />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render action when provided", () => {
    render(
      <EmptyState 
        icon={<div>Icon</div>} 
        action={<button data-testid="action-btn">Action</button>} 
      />
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("should not render action when not provided", () => {
    render(<EmptyState icon={<div>Icon</div>} />);
    const actionDiv = document.querySelector(".mt-4");
    expect(actionDiv).not.toBeInTheDocument();
  });

  it("should have base container classes", () => {
    const { container } = render(<EmptyState icon={<div>Icon</div>} />);
    const div = container.firstChild;
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("flex-col");
    expect(div).toHaveClass("items-center");
    expect(div).toHaveClass("justify-center");
    expect(div).toHaveClass("p-8");
    expect(div).toHaveClass("text-center");
    expect(div).toHaveClass("bg-white");
    expect(div).toHaveClass("rounded-2xl");
    expect(div).toHaveClass("border");
    expect(div).toHaveClass("border-dashed");
    expect(div).toHaveClass("border-slate-200");
  });

  it("should have icon container classes", () => {
    const { container } = render(<EmptyState icon={<div>Icon</div>} />);
    const iconContainer = container.querySelector(".w-12");
    expect(iconContainer).toHaveClass("flex");
    expect(iconContainer).toHaveClass("items-center");
    expect(iconContainer).toHaveClass("justify-center");
    expect(iconContainer).toHaveClass("w-12");
    expect(iconContainer).toHaveClass("h-12");
    expect(iconContainer).toHaveClass("mb-4");
    expect(iconContainer).toHaveClass("rounded-full");
    expect(iconContainer).toHaveClass("bg-slate-50");
    expect(iconContainer).toHaveClass("text-slate-400");
  });

  it("should have title styling", () => {
    render(<EmptyState icon={<div>Icon</div>} title="Test Title" />);
    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("text-sm");
    expect(title).toHaveClass("font-semibold");
    expect(title).toHaveClass("text-slate-900");
  });

  it("should have message styling", () => {
    render(<EmptyState icon={<div>Icon</div>} message="Test message" />);
    const message = screen.getByText("Test message");
    expect(message).toHaveClass("mt-1");
    expect(message).toHaveClass("text-xs");
    expect(message).toHaveClass("text-slate-500");
    expect(message).toHaveClass("max-w-xs");
  });
});
