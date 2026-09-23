import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionActions from "./SessionActions";

describe("SessionActions", () => {
  // ── Branch Variant 1: Within Window & Not Saving ───────────────────────────
  it("should render both active action buttons when within the reschedule window and not saving", async () => {
    const user = userEvent.setup();
    const handleReschedule = vi.fn();
    const handleCancel = vi.fn();

    render(
      <SessionActions
        withinRescheduleWindow={true}
        saving={false}
        onRescheduleClick={handleReschedule}
        onCancelClick={handleCancel}
      />,
    );

    // Verify correct elements render
    const rescheduleBtn = screen.getByRole("button", { name: /reschedule/i });
    const cancelBtn = screen.getByRole("button", { name: /cancel session/i });

    expect(rescheduleBtn).toBeInTheDocument();
    expect(rescheduleBtn).not.toBeDisabled();
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();

    // Verify interaction triggers callbacks
    await user.click(rescheduleBtn);
    expect(handleReschedule).toHaveBeenCalledTimes(1);

    await user.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  // ── Branch Variant 2: Outside Window & Not Saving ──────────────────────────
  it("should render an inactive notice banner when outside the reschedule window", async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();

    render(
      <SessionActions
        withinRescheduleWindow={false}
        saving={false}
        onRescheduleClick={vi.fn()}
        onCancelClick={handleCancel}
      />,
    );

    // Verify the explicit reschedule notice text renders instead of a button
    expect(
      screen.queryByRole("button", { name: /^reschedule$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Reschedule unavailable (before 12hrs)"),
    ).toBeInTheDocument();

    // Verify cancel session remains completely active
    const cancelBtn = screen.getByRole("button", { name: /cancel session/i });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();

    await user.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  // ── Branch Variant 3: Saving State Active ──────────────────────────────────
  it("should disable all functional buttons when background processing save state is true", () => {
    render(
      <SessionActions
        withinRescheduleWindow={true}
        saving={true}
        onRescheduleClick={vi.fn()}
        onCancelClick={vi.fn()}
      />,
    );

    const rescheduleBtn = screen.getByRole("button", { name: /reschedule/i });
    const cancelBtn = screen.getByRole("button", { name: /cancel session/i });

    // Verify disable attributes are locked down to protect against duplicate submissions
    expect(rescheduleBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
    expect(rescheduleBtn).toHaveClass("disabled:cursor-not-allowed");
    expect(cancelBtn).toHaveClass("disabled:cursor-not-allowed");
  });
});
