/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dot from "./Dot";

describe("Dot", () => {
  it("should render with isActive false", () => {
    render(<Dot isActive={false} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should render with isActive true", () => {
    render(<Dot isActive={true} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should have base classes", () => {
    render(<Dot isActive={false} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("transition-all");
    expect(button).toHaveClass("duration-300");
  });

  it("should have correct size when inactive", () => {
    render(<Dot isActive={false} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "8px" });
    expect(button).toHaveStyle({ height: "8px" });
  });

  it("should have correct size when active", () => {
    render(<Dot isActive={true} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "24px" });
    expect(button).toHaveStyle({ height: "8px" });
  });

  it("should have gray background when inactive", () => {
    render(<Dot isActive={false} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ background: "#d1d5db" });
  });

  it("should have gradient background when active", () => {
    render(<Dot isActive={true} onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    });
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Dot isActive={false} onClick={handleClick} />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when active", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Dot isActive={true} onClick={handleClick} />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
