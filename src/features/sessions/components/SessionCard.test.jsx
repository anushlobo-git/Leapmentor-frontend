/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SessionCard from "./SessionCard";
import {
  formatSlotDate,
  formatSlotTime,
} from "@features/sessions/utils/sessionFormat";

vi.mock("@features/sessions/utils/sessionFormat", () => ({
  formatSlotDate: vi.fn(),
  formatSlotTime: vi.fn(),
}));

const accentPalette = ["#111111", "#222222", "#333333"];

const baseRequest = (overrides = {}) => ({
  _id: "req-1",
  status: "accepted",
  confirmedSlot: { date: "2026-01-05", startTime: "10:00", endTime: "11:00" },
  mentor: { name: "Dr. Smith" },
  mentee: { name: "Jane Doe" },
  ...overrides,
});

describe("SessionCard", () => {
  let navigate;

  beforeEach(() => {
    vi.clearAllMocks();
    navigate = vi.fn();
    formatSlotDate.mockReturnValue("Jan 5, 2026");
    formatSlotTime.mockReturnValue("10:00 AM - 11:00 AM");
  });

  it("should render the date badge from the confirmed slot", () => {
    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("JAN")).toBeTruthy();
  });

  it("should fall back to the first selected slot when there is no confirmed slot", () => {
    render(
      <SessionCard
        request={baseRequest({
          confirmedSlot: undefined,
          selectedSlots: [{ date: "2026-03-12" }],
        })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("MAR")).toBeTruthy();
  });

  it("should show placeholder dashes when there is no slot date at all", () => {
    render(
      <SessionCard
        request={baseRequest({ confirmedSlot: undefined, selectedSlots: [] })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("should render the formatted time and date together", () => {
    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getByText("10:00 AM - 11:00 AM · Jan 5, 2026")).toBeTruthy();
  });

  it('should show "Time TBD" when there is no formatted time', () => {
    formatSlotTime.mockReturnValue("");
    formatSlotDate.mockReturnValue("");

    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getByText("Time TBD")).toBeTruthy();
  });

  it("should omit the date separator when there is no formatted date", () => {
    formatSlotTime.mockReturnValue("10:00 AM - 11:00 AM");
    formatSlotDate.mockReturnValue("");

    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );

    expect(screen.getByText("10:00 AM - 11:00 AM")).toBeTruthy();
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it("should use the mentor name when personKey is mentor", () => {
    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByText("Dr. Smith")).toBeTruthy();
  });

  it("should use the mentee name when personKey is mentee", () => {
    render(
      <SessionCard
        request={baseRequest()}
        index={0}
        navigate={navigate}
        personKey="mentee"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByText("Jane Doe")).toBeTruthy();
  });

  it('should fall back to "Mentor" when mentor data is missing', () => {
    render(
      <SessionCard
        request={baseRequest({ mentor: undefined })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByText("Mentor")).toBeTruthy();
  });

  it('should fall back to "Mentee" when mentee data is missing', () => {
    render(
      <SessionCard
        request={baseRequest({ mentee: undefined })}
        index={0}
        navigate={navigate}
        personKey="mentee"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByText("Mentee")).toBeTruthy();
  });

  it('should show the "Ongoing" pill styling for ongoing sessions', () => {
    render(
      <SessionCard
        request={baseRequest({ status: "ongoing" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    const pill = screen.getByText("Ongoing");
    expect(pill.className).toContain("bg-blue-100");
  });

  it('should show the "Accepted" pill styling for non-ongoing sessions', () => {
    render(
      <SessionCard
        request={baseRequest({ status: "accepted" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    const pill = screen.getByText("Accepted");
    expect(pill.className).toContain("bg-emerald-100");
  });

  it("should pick the accent color using index modulo palette length", () => {
    const twoColorPalette = ["#111111", "#222222"];
    const { container } = render(
      <SessionCard
        request={baseRequest()}
        index={3}
        navigate={navigate}
        personKey="mentor"
        accentPalette={twoColorPalette}
      />,
    );
    // index 3 % length 2 === 1 -> "#222222"
    const badge = container.querySelector(".rounded-xl.flex.flex-col");
    expect(badge.style.backgroundColor).toBe("rgb(34, 34, 34)");
  });

  it("should render the compact Open Dashboard button for ongoing + compact", () => {
    render(
      <SessionCard
        request={baseRequest({ status: "ongoing" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
        size="compact"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Open Dashboard →" }),
    ).toBeTruthy();
  });

  it("should render the default Open Dashboard button for ongoing + default size", () => {
    render(
      <SessionCard
        request={baseRequest({ status: "ongoing" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByRole("button", { name: "Open Dashboard" })).toBeTruthy();
  });

  it("should navigate to the shared dashboard when Open Dashboard is clicked", () => {
    render(
      <SessionCard
        request={baseRequest({ status: "ongoing", _id: "abc123" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open Dashboard" }));
    expect(navigate).toHaveBeenCalledWith("/shared-dashboard/abc123");
  });

  it('should show "Awaiting Payment" for non-ongoing default size', () => {
    render(
      <SessionCard
        request={baseRequest({ status: "accepted" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
      />,
    );
    expect(screen.getByText("Awaiting Payment")).toBeTruthy();
  });

  it('should show neither a button nor "Awaiting Payment" for non-ongoing compact size', () => {
    render(
      <SessionCard
        request={baseRequest({ status: "accepted" })}
        index={0}
        navigate={navigate}
        personKey="mentor"
        accentPalette={accentPalette}
        size="compact"
      />,
    );
    expect(screen.queryByText("Awaiting Payment")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
