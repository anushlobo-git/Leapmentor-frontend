import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CancelModal from "./CancelModal";

vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  formatSlotDate: vi.fn(() => "Jul 20, 2026"),
  formatTime: vi.fn(() => "10:00"),
}));

describe("CancelModal", () => {
  const slot = { startTime: "10:00", endTime: "11:00" };

  it("renders the cancel modal with reason textarea and buttons", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <CancelModal
        slot={slot}
        slotIndex={2}
        onConfirm={onConfirm}
        onClose={onClose}
        saving={false}
      />,
    );

    expect(screen.getByText(/Cancel this session\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Jul 20, 2026/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g. Schedule conflict, emergency.../i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Keep Session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Yes, Cancel It/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Keep Session is clicked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <CancelModal
        slot={slot}
        slotIndex={1}
        onConfirm={onConfirm}
        onClose={onClose}
        saving={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Keep Session/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onConfirm with slotIndex and reason text", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <CancelModal
        slot={slot}
        slotIndex={3}
        onConfirm={onConfirm}
        onClose={onClose}
        saving={false}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(/e.g. Schedule conflict, emergency.../i),
      {
        target: { value: "Emergency" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /Yes, Cancel It/i }));

    expect(onConfirm).toHaveBeenCalledWith(3, "Emergency");
  });

  it("disables buttons and shows cancelling state when saving is true", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <CancelModal
        slot={slot}
        slotIndex={0}
        onConfirm={onConfirm}
        onClose={onClose}
        saving
      />,
    );

    expect(
      screen.getByRole("button", { name: /Keep Session/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Cancelling.../i }),
    ).toBeDisabled();
  });
});
