import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DotIndicator from "@components/ui/DotIndicator";

describe("DotIndicator", () => {
  it("renders the correct number of dots and highlights the active one", () => {
    render(<DotIndicator total={5} active={2} onDotClick={() => {}} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);

    // Active dot should have larger width style set by Dot component
    const active = buttons[2];
    expect(active).toHaveStyle({ width: "24px" });
  });

  it("calls onDotClick with the correct index when a dot is clicked", async () => {
    const user = userEvent.setup();
    const onDotClick = vi.fn();

    render(<DotIndicator total={4} active={0} onDotClick={onDotClick} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[3]);

    expect(onDotClick).toHaveBeenCalledTimes(1);
    expect(onDotClick).toHaveBeenCalledWith(3);
  });

  it("renders nothing when total is 0", () => {
    render(<DotIndicator total={0} active={0} onDotClick={() => {}} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("does not mark any dot active when active index is out of range", () => {
    render(<DotIndicator total={3} active={10} onDotClick={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.some((b) => b.style.width === "24px")).toBe(false);
  });
});
