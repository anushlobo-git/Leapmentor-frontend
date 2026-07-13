import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TimelineTracker from "./TimelineTracker";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];
const nextWeek = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

vi.useFakeTimers();
vi.setSystemTime(new Date(`${today}T12:00:00`));

describe("TimelineTracker", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders no timeline message when dates are missing", () => {
    render(
      <TimelineTracker
        goal={{ _id: "goal1" }}
        viewerRole="mentor"
        onUpdate={mockOnUpdate}
        saving={false}
      />,
    );

    expect(screen.getByText(/No timeline set/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Set Timeline/i }),
    ).toBeInTheDocument();
  });

  it("enters edit mode and validates end date before saving", () => {
    const goal = { _id: "goal2", startDate: tomorrow, endDate: today };
    render(
      <TimelineTracker
        goal={goal}
        viewerRole="mentor"
        onUpdate={mockOnUpdate}
        saving={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: today },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    expect(
      screen.getByText(/End date cannot be before start date/i),
    ).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("saves timeline when valid start and end dates are provided", () => {
    const goal = { _id: "goal3", startDate: today, endDate: nextWeek };
    render(
      <TimelineTracker
        goal={goal}
        viewerRole="mentor"
        onUpdate={mockOnUpdate}
        saving={false}
      />,
    );

    expect(screen.getByText(/through engagement/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: today },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: nextWeek },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith("goal3", {
      startDate: today,
      endDate: nextWeek,
    });
  });

  it("renders days remaining badge in green for future deadline", () => {
    const goal = { _id: "goal4", startDate: today, endDate: nextWeek };
    render(
      <TimelineTracker
        goal={goal}
        viewerRole="mentor"
        onUpdate={mockOnUpdate}
        saving={false}
      />,
    );

    expect(screen.getByText(/days remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/days remaining/i).className).toContain(
      "bg-green-50",
    );
  });

  it("renders ended badge for past end date", () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const goal = { _id: "goal5", startDate: pastDate, endDate: today };
    render(
      <TimelineTracker
        goal={goal}
        viewerRole="mentor"
        onUpdate={mockOnUpdate}
        saving={false}
      />,
    );

    expect(screen.getByText(/Ends today|days remaining/i)).toBeInTheDocument();
  });
});
