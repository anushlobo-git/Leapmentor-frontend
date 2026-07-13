import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlotPill from "./SlotPill";
import {
  formatTime,
  getSlotPillClasses,
} from "@features/goals/utils/sessionCardUtils";

// Mock external utilities module to strictly control formatting and class mapping variations
vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  formatTime: vi.fn((time) => `formatted-${time}`),
  getSlotPillClasses: vi.fn((selected, booked) => {
    if (selected) return "mock-class-selected";
    if (booked) return "mock-class-booked";
    return "mock-class-default";
  }),
}));

describe("SlotPill", () => {
  const mockSlot = { startTime: "09:00", endTime: "10:00" };
  const mockGroup = { day: "Monday", date: "2026-07-13" };
  let mockOnSelect;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSelect = vi.fn();
  });

  it("should render formatted time strings under default unselected and unbooked state configurations", () => {
    render(
      <SlotPill
        slot={mockSlot}
        group={mockGroup}
        selected={false}
        booked={false}
        onSelect={mockOnSelect}
      />,
    );

    // Assert formatted times are rendered cleanly inside the layout
    expect(
      screen.getByRole("button", {
        name: /formatted-09:00 – formatted-10:00/i,
      }),
    ).toBeInTheDocument();

    // Assert checkmark badge layout layer is not rendered
    expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();

    // Assert utilities are triggered with exact argument pairs
    expect(formatTime).toHaveBeenCalledWith("09:00");
    expect(formatTime).toHaveBeenCalledWith("10:00");
    expect(getSlotPillClasses).toHaveBeenCalledWith(false, false);

    const nativeButton = screen.getByRole("button");
    expect(nativeButton).not.toBeDisabled();
    expect(nativeButton).toHaveClass("mock-class-default");
  });

  it("should display a checkmark badge and apply selected class weights when selected prop is true", () => {
    const { container } = render(
      <SlotPill
        slot={mockSlot}
        group={mockGroup}
        selected={true}
        booked={false}
        onSelect={mockOnSelect}
      />,
    );

    const nativeButton = screen.getByRole("button");
    expect(nativeButton).toHaveClass("mock-class-selected");

    // Check for the presence of the absolute structural verification check mark container span
    const indicatorBadge = container.querySelector(".absolute");
    expect(indicatorBadge).toBeInTheDocument();
    expect(indicatorBadge.querySelector("svg")).toBeInTheDocument();
  });

  it("should apply disabled attribute rules and structural classes when booked prop is true", () => {
    render(
      <SlotPill
        slot={mockSlot}
        group={mockGroup}
        selected={false}
        booked={true}
        onSelect={mockOnSelect}
      />,
    );

    const nativeButton = screen.getByRole("button");
    expect(nativeButton).toBeDisabled();
    expect(nativeButton).toHaveClass("mock-class-booked");
    expect(getSlotPillClasses).toHaveBeenCalledWith(false, true);
  });

  it("should trigger onSelect callbacks matching parent group schemas when an available slot pill is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SlotPill
        slot={mockSlot}
        group={mockGroup}
        selected={false}
        booked={false}
        onSelect={mockOnSelect}
      />,
    );

    const pillButton = screen.getByRole("button");
    await user.click(pillButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith({
      day: "Monday",
      date: "2026-07-13",
      startTime: "09:00",
      endTime: "10:00",
    });
  });

  it("should block click handler invocations completely if the slot pill parameter is flagged as booked", () => {
    render(
      <SlotPill
        slot={mockSlot}
        group={mockGroup}
        selected={false}
        booked={true}
        onSelect={mockOnSelect}
      />,
    );

    const pillButton = screen.getByRole("button");

    // Trigger standard click handler directly bypassing testing-library interaction filters for branch verification
    pillButton.click();

    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
