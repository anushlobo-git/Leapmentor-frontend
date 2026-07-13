/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBanner from "./ErrorBanner";

describe("ErrorBanner", () => {
  it("should render with message", () => {
    render(<ErrorBanner message="Error occurred" />);
    expect(screen.getByText("Error occurred")).toBeInTheDocument();
  });

  it("should not render when message is empty", () => {
    const { container } = render(<ErrorBanner message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when message is null", () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when message is undefined", () => {
    const { container } = render(<ErrorBanner message={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render with md size by default", () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass("text-sm");
  });

  it("should render with sm size", () => {
    const { container } = render(<ErrorBanner message="Error" size="sm" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass("text-xs");
  });

  it("should render with custom className", () => {
    const { container } = render(<ErrorBanner message="Error" className="custom-class" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass("custom-class");
  });

  it("should have base classes", () => {
    const { container } = render(<ErrorBanner message="Error" />);
    const banner = container.firstChild;
    expect(banner).toHaveClass("flex");
    expect(banner).toHaveClass("items-center");
    expect(banner).toHaveClass("gap-2");
    expect(banner).toHaveClass("bg-red-50");
    expect(banner).toHaveClass("border");
    expect(banner).toHaveClass("border-red-200");
    expect(banner).toHaveClass("text-red-600");
    expect(banner).toHaveClass("rounded-xl");
    expect(banner).toHaveClass("px-4");
    expect(banner).toHaveClass("py-3");
  });

  it("should render warning icon", () => {
    render(<ErrorBanner message="Error" />);
    const banner = screen.getByText("Error").parentElement;
    expect(banner.textContent).toContain("⚠");
  });
});
