/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormField, { FIELD_BASE_STYLE } from "./FormField";

describe("FormField", () => {
  it("should render as input by default", () => {
    render(<FormField />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should render as textarea when specified", () => {
    render(<FormField as="textarea" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
  });


  it("should apply custom style", () => {
    const { container } = render(<FormField style={{ width: "100%" }} />);
    const input = container.querySelector("input");
    expect(input).toHaveStyle({ width: "100%" });
  });

  it("should merge custom style with base style", () => {
    const { container } = render(<FormField style={{ width: "100%" }} />);
    const input = container.querySelector("input");
    expect(input).toHaveStyle({ width: "100%" });
    expect(input).toHaveStyle({ padding: "11px 14px" });
  });

  it("should change border color on focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<FormField focusColor="#ff0000" />);
    const input = container.querySelector("input");

    await user.click(input);

    expect(input).toHaveStyle({ borderColor: "#ff0000" });
  });

  it("should use default focus color", async () => {
    const user = userEvent.setup();
    const { container } = render(<FormField />);
    const input = container.querySelector("input");

    await user.click(input);

    expect(input).toHaveStyle({ borderColor: "#4f46e5" });
  });

  it("should reset border color on blur", async () => {
    const user = userEvent.setup();
    const { container } = render(<FormField />);
    const input = container.querySelector("input");

    await user.click(input);
    expect(input).toHaveStyle({ borderColor: "#4f46e5" });

    await user.tab();
    expect(input).toHaveStyle({ borderColor: "#e2e8f0" });
  });

  it("should pass through other props", () => {
    render(<FormField placeholder="Enter text" name="test" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toHaveAttribute("name", "test");
  });

  it("should export FIELD_BASE_STYLE constant", () => {
    expect(FIELD_BASE_STYLE).toEqual({
      padding: "11px 14px",
      borderRadius: 10,
      border: "1.5px solid #e2e8f0",
      fontSize: 14,
      outline: "none",
      color: "#0f172a",
      fontFamily: "inherit",
    });
  });

  it("should handle value prop", () => {
    render(<FormField value="test value" />);
    const input = screen.getByDisplayValue("test value");
    expect(input).toBeInTheDocument();
  });

  it("should handle disabled state", () => {
    render(<FormField disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should handle onChange prop", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<FormField onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalled();
  });
});
