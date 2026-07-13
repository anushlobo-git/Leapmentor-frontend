import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import RescheduleModal from "./RescheduleModal";
import { getMentorAvailabilityForConnect } from "@features/sessions/api/sessions.api";
import { formatTime, isActive } from "@features/goals/utils/sessionCardUtils";

// Mock external API paths using exact config requirements
vi.mock("@features/sessions/api/sessions.api", () => ({
  getMentorAvailabilityForConnect: vi.fn(),
}));

// Mock utilitarian shared helpers
vi.mock("@features/goals/utils/sessionCardUtils", () => ({
  formatTime: vi.fn((time) => `Formatted-${time}`),
  isActive: vi.fn(),
}));

// Mock internal sibling subcomponent to test parameter mapping and actions directly
vi.mock("./AvailabilityBody", () => ({
  default: ({ availLoading, availError, selectedSlot, onSelect }) => (
    <div data-testid="mock-availability-body">
      {availLoading && <span>Loading Slots...</span>}
      {availError && <span>Error: {availError}</span>}
      <button
        data-testid="trigger-select-slot"
        onClick={() =>
          onSelect({ date: "2026-08-20", startTime: "10:00", endTime: "11:00" })
        }
      >
        Select Slot Option
      </button>
      {selectedSlot && (
        <span data-testid="chosen-slot-indicator">
          Active Target Slot Selected
        </span>
      )}
    </div>
  ),
}));

describe("RescheduleModal", () => {
  let defaultProps;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default return states for shared utility hooks
    isActive.mockReturnValue(true);

    defaultProps = {
      slotIndex: 1,
      connectRequestId: "connect-req-123",
      existingSlots: [
        {
          date: "2026-08-10",
          startTime: "09:00",
          endTime: "10:00",
          status: "active",
        }, // index 0 (active)
        {
          date: "2026-08-11",
          startTime: "14:00",
          endTime: "15:00",
          status: "active",
        }, // index 1 (under test)
        {
          date: "2026-08-12",
          startTime: "16:00",
          endTime: "17:00",
          status: "active",
        }, // index 2 (will mock as inactive)
      ],
      onConfirm: vi.fn(),
      onClose: vi.fn(),
      saving: false,
    };
  });

  it("should filter existing slots correctly to extract booked slots on mount (Happy Path)", async () => {
    // Make index 2 inactive to evaluate the secondary verification condition rule branch
    isActive.mockImplementation((slot) => slot.date !== "2026-08-12");

    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: {
        slots: [{ id: "slot-a" }],
        sessionDurations: [30, 45, 60],
      },
    });

    render(<RescheduleModal {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(getMentorAvailabilityForConnect).toHaveBeenCalledWith(
      "connect-req-123",
      60,
    );
    expect(screen.getByText("Reschedule Session")).toBeInTheDocument();

    // Verifies durations custom override renders
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("should use default duration listings fallback array when backend response leaves it empty", async () => {
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: {
        slots: [],
        sessionDurations: null, // Forces reliance on [30, 60] default arrays configuration branch
      },
    });

    render(<RescheduleModal {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
  });

  it("should extract nested response message property structure upon custom API failure catch blocks", async () => {
    const apiError = {
      response: {
        data: {
          message: "Custom Server Constraint Exception Error Message",
        },
      },
    };
    getMentorAvailabilityForConnect.mockRejectedValueOnce(apiError);

    render(<RescheduleModal {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText(
        "Error: Custom Server Constraint Exception Error Message",
      ),
    ).toBeInTheDocument();
  });

  it("should handle total generic fallback text statement strings if exception object holds no tailored data details", async () => {
    getMentorAvailabilityForConnect.mockRejectedValueOnce(
      new Error("Generic Network Crash"),
    );

    render(<RescheduleModal {...defaultProps} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByText("Error: Failed to load availability."),
    ).toBeInTheDocument();
  });

  it("should update parameters and clear chosen slot options upon clicking session duration buttons", async () => {
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: { slots: [] },
    });

    render(<RescheduleModal {...defaultProps} />);
    await act(async () => {
      await Promise.resolve();
    });

    // Click subcomponent button to fill a temporary slot state selection
    fireEvent.click(screen.getByTestId("trigger-select-slot"));
    expect(screen.getByTestId("chosen-slot-indicator")).toBeInTheDocument();

    // Trigger secondary request refresh via switching duration tabs configuration
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: { slots: [] },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("30 min"));
    });

    expect(getMentorAvailabilityForConnect).toHaveBeenCalledWith(
      "connect-req-123",
      30,
    );
    // Asserts clear operation selection branch targets correctly reset state options
    expect(
      screen.queryByTestId("chosen-slot-indicator"),
    ).not.toBeInTheDocument();
  });

  it("should show bottom checkout panel and confirm rescheduling details successfully", async () => {
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: { slots: [] },
    });

    render(<RescheduleModal {...defaultProps} />);
    await act(async () => {
      await Promise.resolve();
    });

    // Select the new slot to launch the confirmation block panel visibility branch
    fireEvent.click(screen.getByTestId("trigger-select-slot"));

    expect(screen.getByText("New Slot")).toBeInTheDocument();
    expect(
      screen.getByText("Formatted-10:00 – Formatted-11:00"),
    ).toBeInTheDocument();

    // Confirm operation execution payload
    fireEvent.click(
      screen.getByRole("button", { name: /Confirm Reschedule/i }),
    );
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(1, {
      date: "2026-08-20",
      startTime: "10:00",
      endTime: "11:00",
    });
  });

  it("should apply customized disabling layout parameters cleanly when saving flag state changes to true", async () => {
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: { slots: [] },
    });
    defaultProps.saving = true;

    render(<RescheduleModal {...defaultProps} />);
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByTestId("trigger-select-slot"));

    const confirmButton = screen.getByRole("button", {
      name: /Rescheduling.../i,
    });
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should terminate the workflow completely when cancel or cross icon actions are invoked", async () => {
    getMentorAvailabilityForConnect.mockResolvedValueOnce({
      data: { slots: [] },
    });

    render(<RescheduleModal {...defaultProps} />);
    await act(async () => {
      await Promise.resolve();
    });

    // Click Top Close Button
    const headerCloseButton = screen.getAllByRole("button")[0];
    fireEvent.click(headerCloseButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    // Open Bottom Panel via Slot Selection to access structural cancel options
    fireEvent.click(screen.getByTestId("trigger-select-slot"));
    const bottomCancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(bottomCancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
