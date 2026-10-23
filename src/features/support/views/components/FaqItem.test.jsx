import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqItem from "./FaqItem";

describe("FaqItem", () => {
  const mockOnToggle = vi.fn();
  const mockItem = {
    q: "How do I secure slot allocations?",
    a: "Navigate onto the connects portal configuration workspace matrix grid layer.",
  };

  const defaultProps = {
    item: mockItem,
    isOpen: false,
    onToggle: mockOnToggle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render States & Structural Layout Matrix ───────────────────────────
  it("should render the question content cleanly and hide the answer container when collapsed", () => {
    const { container } = render(<FaqItem {...defaultProps} />);

    // Verify question text presentation element
    expect(
      screen.getByText("How do I secure slot allocations?"),
    ).toBeInTheDocument();

    // Verify answer element description text is completely absent
    expect(
      screen.queryByText(
        "Navigate onto the connects portal configuration workspace matrix grid layer.",
      ),
    ).not.toBeInTheDocument();

    // Verify structural default border styles and chevron icon setup rotation
    const outerWrapDiv = container.firstChild;
    expect(outerWrapDiv).toHaveStyle({ border: "1.5px solid #e2e8f0" });

    const chevronIcon = screen.getByText("▾");
    expect(chevronIcon).toHaveStyle({ transform: "rotate(0deg)" });
  });

  it("should display the answer segment and rotate the tracking chevron indicator when expanded", () => {
    const { container } = render(<FaqItem {...defaultProps} isOpen={true} />);

    // Verify question and answer are simultaneously visible inside the view tree
    expect(
      screen.getByText("How do I secure slot allocations?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Navigate onto the connects portal configuration workspace matrix grid layer.",
      ),
    ).toBeInTheDocument();

    // Verify style transformations for active expanded presentation state
    const outerWrapDiv = container.firstChild;
    expect(outerWrapDiv).toHaveStyle({ border: "1.5px solid #c7d2fe" });

    const chevronIcon = screen.getByText("▾");
    expect(chevronIcon).toHaveStyle({ transform: "rotate(180deg)" });
  });

  // ── Interaction Actions Execution Matrix ───────────────────────────────
  it("should fire the toggle callback function exactly once when selection keys are triggered", async () => {
    const user = userEvent.setup();
    render(<FaqItem {...defaultProps} />);

    const interactiveToggleBtn = screen.getByRole("button", {
      name: /How do I secure slot allocations\?/i,
    });

    await user.click(interactiveToggleBtn);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
