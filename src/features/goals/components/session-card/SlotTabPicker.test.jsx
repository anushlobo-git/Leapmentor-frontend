import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlotTabPicker from "./SlotTabPicker";
import { getDayTabClasses } from "@features/goals/utils/sessionCardUtils";

// Mock helper utility styles mapper module
vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  getDayTabClasses: vi.fn(() => "test-tab-class-style"),
}));

// Mock SlotPill presentational component to clean up boundaries and trace prop states
vi.mock("./SlotPill", () => ({
  default: ({ slot, selected, onSelect, booked }) => (
    <button
      data-testid={`slot-pill-${slot.startTime}`}
      data-selected={selected}
      data-booked={booked}
      onClick={() => onSelect(slot)}
    >
      {slot.startTime} - {slot.endTime}
    </button>
  ),
}));

describe("SlotTabPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle an empty availability list gracefully without crashes or count badges", () => {
    render(
      <SlotTabPicker
        availability={[]}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    expect(screen.getByText("Available Slots")).toBeInTheDocument();

    // Explicitly target a number-prefixed badge text string to avoid matching the main header string
    expect(screen.queryByText(/\d+ available/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should process filtering logic and render slots that aren't occupied by bookedSlots", () => {
    const mockAvailability = [
      {
        date: "2026-07-20",
        slots: [
          { startTime: "09:00", endTime: "10:00" },
          { startTime: "10:00", endTime: "11:00" },
        ],
      },
    ];
    const mockBooked = [
      { date: "2026-07-20", startTime: "09:00", endTime: "10:00" },
    ];

    render(
      <SlotTabPicker
        availability={mockAvailability}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={mockBooked}
      />,
    );

    // Total free count must read 1 since 09:00 slot is occupied
    expect(screen.getByText("1 available")).toBeInTheDocument();
    expect(screen.getByText("1 open")).toBeInTheDocument();

    // Verify unbooked slots display correctly while forwarding accurate context
    const openPill = screen.getByTestId("slot-pill-10:00");
    expect(openPill).toBeInTheDocument();
    expect(openPill).toHaveAttribute("data-booked", "false");
  });

  it("should shift the active group grid view when clicking on a different valid day tab button", async () => {
    const user = userEvent.setup();
    const mockAvailability = [
      {
        date: "2026-07-20",
        slots: [{ startTime: "09:00", endTime: "10:00" }],
      },
      {
        date: "2026-07-21",
        slots: [{ startTime: "14:00", endTime: "15:00" }],
      },
    ];

    render(
      <SlotTabPicker
        availability={mockAvailability}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    // Initial default render targets index 0
    expect(screen.getByTestId("slot-pill-09:00")).toBeInTheDocument();
    expect(screen.queryByTestId("slot-pill-14:00")).not.toBeInTheDocument();

    // Look up day tab button elements and trigger selection click transition
    const tabButtons = screen.getAllByRole("button");
    // Find tab representing July 21st (the second button in the list)
    await user.click(tabButtons[1]);

    // Active screen updates to highlight target elements group
    expect(screen.getByTestId("slot-pill-14:00")).toBeInTheDocument();
    expect(screen.queryByTestId("slot-pill-09:00")).not.toBeInTheDocument();
    expect(getDayTabClasses).toHaveBeenCalled();
  });

  it("should disable day tabs completely if they contain zero free open slots available", () => {
    const mockAvailability = [
      {
        date: "2026-07-20",
        slots: [{ startTime: "09:00", endTime: "10:00" }],
      },
    ];
    // Entire slot mapping array matches booked records array perfectly
    const mockBooked = [
      { date: "2026-07-20", startTime: "09:00", endTime: "10:00" },
    ];

    render(
      <SlotTabPicker
        availability={mockAvailability}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={mockBooked}
      />,
    );

    const fullTabButton = screen.getAllByRole("button")[0];
    expect(fullTabButton).toBeDisabled();
  });

  it("should match slot parameters and mark selected attribute true if matching selectedSlot criteria", () => {
    const mockAvailability = [
      {
        date: "2026-07-20",
        slots: [
          { startTime: "09:00", endTime: "10:00" },
          { startTime: "11:00", endTime: "12:00" },
        ],
      },
    ];
    const targetSelection = {
      date: "2026-07-20",
      startTime: "11:00",
    };

    render(
      <SlotTabPicker
        availability={mockAvailability}
        selectedSlot={targetSelection}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    expect(screen.getByTestId("slot-pill-09:00")).toHaveAttribute(
      "data-selected",
      "false",
    );
    expect(screen.getByTestId("slot-pill-11:00")).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("should pass the matching slot data payload through onSelect callbacks when clicking a pill", async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    const testSlot = { startTime: "16:00", endTime: "17:00" };
    const mockAvailability = [
      {
        date: "2026-07-20",
        slots: [testSlot],
      },
    ];

    render(
      <SlotTabPicker
        availability={mockAvailability}
        selectedSlot={null}
        onSelect={mockOnSelect}
        bookedSlots={[]}
      />,
    );

    const slotPillButton = screen.getByTestId("slot-pill-16:00");
    await user.click(slotPillButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(testSlot);
  });
});
