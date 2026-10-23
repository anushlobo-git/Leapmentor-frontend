import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AvailabilityBody from "./AvailabilityBody";

vi.mock("./SlotTabPicker", () => ({
  __esModule: true,
  default: ({ availability, selectedSlot, onSelect, bookedSlots }) => (
    <div data-testid="slot-tab-picker">
      <div>availability:{availability.length}</div>
      <div>selected:{selectedSlot?.date || "none"}</div>
      <div>booked:{bookedSlots.length}</div>
    </div>
  ),
}));

describe("AvailabilityBody", () => {
  it("renders loading skeleton when availLoading is true", () => {
    const { container } = render(
      <AvailabilityBody
        availLoading
        availError=""
        availability={[]}
        duration={30}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders availError message when provided", () => {
    render(
      <AvailabilityBody
        availLoading={false}
        availError="Network error"
        availability={[]}
        duration={45}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    expect(screen.queryByTestId("slot-tab-picker")).not.toBeInTheDocument();
  });

  it("renders empty state when no availability exists", () => {
    render(
      <AvailabilityBody
        availLoading={false}
        availError=""
        availability={[]}
        duration={60}
        selectedSlot={null}
        onSelect={vi.fn()}
        bookedSlots={[]}
      />,
    );

    expect(screen.getByText(/No slots available/i)).toBeInTheDocument();
    expect(screen.getByText(/60-min sessions/i)).toBeInTheDocument();
  });

  it("renders SlotTabPicker when availability is present", () => {
    const avail = [{ date: "2026-07-20", startTime: "09:00" }];
    render(
      <AvailabilityBody
        availLoading={false}
        availError=""
        availability={avail}
        duration={30}
        selectedSlot={avail[0]}
        onSelect={vi.fn()}
        bookedSlots={[{ date: "2026-07-20", startTime: "09:00" }]}
      />,
    );

    expect(screen.getByTestId("slot-tab-picker")).toBeInTheDocument();
    expect(screen.getByText(/availability:1/i)).toBeInTheDocument();
    expect(screen.getByText(/selected:2026-07-20/i)).toBeInTheDocument();
  });
});
