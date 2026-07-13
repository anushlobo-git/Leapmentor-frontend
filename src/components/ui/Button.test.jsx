/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("w-32");
  });

  it("should render with primary variant", () => {
    render(<Button onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-900");
    expect(button).toHaveClass("text-white");
  });

  it("should render with outline variant", () => {
    render(<Button variant="outline" onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("border-blue-900");
    expect(button).toHaveClass("text-blue-900");
  });

  it("should render with fullWidth", () => {
    render(<Button fullWidth onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
  });

  it("should render with withIcon", () => {
    render(<Button withIcon onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("flex");
    expect(button).toHaveClass("items-center");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("should not be disabled by default", () => {
    render(<Button onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render with custom type", () => {
    render(<Button type="submit" onClick={() => {}}>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should render children correctly", () => {
    render(<Button onClick={() => {}}>Test Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Test Button");
  });

  it("should have base classes", () => {
    render(<Button onClick={() => {}}>Click</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-5");
    expect(button).toHaveClass("py-[9px]");
    expect(button).toHaveClass("text-sm");
    expect(button).toHaveClass("font-semibold");
    expect(button).toHaveClass("rounded-lg");
  });
});
