import { render, screen, fireEvent, act } from "@testing-library/react";
import AvailabilityTab from "./AvailabilityTab";
import useAvailability from "@features/mentor/hooks/useAvailability";

// Mock sub-components
vi.mock("@components/common/Loader", () => ({
  default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

vi.mock("@features/mentor/hooks/useAvailability", () => ({
  default: vi.fn(),
}));

vi.mock(
  "@features/mentor/components/dashboard/availability/CalendarAvailabilitySection",
  () => ({
    default: ({
      specificDates,
      setSpecificDates,
      googleCalendarConnected,
      onBusySlotsChange,
      sessionDurations,
      onValidationChange,
    }) => (
      <div data-testid="calendar-section">
        <button
          type="button"
          data-testid="trigger-conflict"
          onClick={() => {
            onBusySlotsChange([
              {
                start: "2026-07-15T14:30:00",
                end: "2026-07-15T15:30:00",
              },
            ]);
          }}
        >
          Trigger Conflict
        </button>
        <button
          type="button"
          data-testid="trigger-custom-conflict"
          onClick={() => {
            onBusySlotsChange([
              {
                start: "2026-07-15T10:30:00",
                end: "2026-07-15T11:30:00",
              },
            ]);
          }}
        >
          Trigger Custom Conflict
        </button>
        <button
          type="button"
          data-testid="trigger-non-overlap"
          onClick={() => {
            onBusySlotsChange([
              {
                start: "2026-07-15T08:00:00",
                end: "2026-07-15T09:00:00",
              },
            ]);
          }}
        >
          Trigger Non Overlap
        </button>
        <button
          type="button"
          data-testid="trigger-invalid"
          onClick={() => onValidationChange(false)}
        >
          Trigger Invalid
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "@features/mentor/components/dashboard/availability/TimezoneDurationSection",
  () => ({
    default: () => (
      <div data-testid="timezone-section">Timezone duration section</div>
    ),
  }),
);

vi.mock(
  "@features/mentor/components/dashboard/availability/IntegrationsSection",
  () => ({
    default: ({ onConnectionChange }) => (
      <div data-testid="integrations-section">
        <button
          type="button"
          data-testid="toggle-google"
          onClick={() => onConnectionChange(true)}
        >
          Connect Google
        </button>
      </div>
    ),
  }),
);

describe("AvailabilityTab component", () => {
  const mockToggleDuration = vi.fn();
  const mockUpdateTimezone = vi.fn();
  const mockSaveAvailability = vi.fn();
  const mockCancelChanges = vi.fn();
  const mockSetSpecificDates = vi.fn();
  // Execute updater callbacks so inner arrow functions (e.g. handleConnectionChange's (prev) => ...) are covered
  let stateAvailability = {};
  const mockSetAvailability = vi.fn((updater) => {
    if (typeof updater === "function") {
      stateAvailability = updater(stateAvailability);
    } else {
      stateAvailability = updater;
    }
  });

  const defaultAvailability = {
    specificDates: [
      {
        date: "2026-07-15",
        // 14:00 = PM path; 15:00 end so conflict with 14:30-15:30 busy slot works
        slots: [{ startTime: "14:00", endTime: "15:00" }],
      },
    ],
    googleCalendarConnected: false,
    sessionDurations: [30, 60],
    timezone: "Asia/Kolkata",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    stateAvailability = { ...defaultAvailability };
    useAvailability.mockReturnValue({
      availability: defaultAvailability,
      loading: false,
      saving: false,
      msg: { type: "", text: "" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });
  });

  it("renders loading spinner when loading is true", () => {
    useAvailability.mockReturnValue({
      loading: true,
    });

    render(<AvailabilityTab />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders main controls, status messages, and handles connection updates", () => {
    const { rerender } = render(<AvailabilityTab />);

    expect(screen.getByText("Availability Settings")).toBeInTheDocument();

    // Trigger connect google
    fireEvent.click(screen.getByTestId("toggle-google"));
    expect(mockSetAvailability).toHaveBeenCalled();

    // Rerender with success message
    useAvailability.mockReturnValue({
      availability: defaultAvailability,
      loading: false,
      saving: false,
      msg: { type: "success", text: "Successfully saved changes" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });

    rerender(<AvailabilityTab />);
    expect(screen.getByText("Successfully saved changes")).toHaveClass(
      "text-emerald-700",
    );

    // Rerender with error message
    useAvailability.mockReturnValue({
      availability: defaultAvailability,
      loading: false,
      saving: false,
      msg: { type: "error", text: "Failed to save changes" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });

    rerender(<AvailabilityTab />);
    expect(screen.getByText("Failed to save changes")).toHaveClass(
      "text-red-600",
    );
  });

  it("triggers cancel changes correctly", () => {
    render(<AvailabilityTab />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockCancelChanges).toHaveBeenCalled();
  });

  it("saves changes directly when no conflict exists", () => {
    render(<AvailabilityTab />);
    fireEvent.click(screen.getByText("Save Changes"));
    expect(mockSaveAvailability).toHaveBeenCalled();
  });

  it("saves changes directly when busySlots exist but do not overlap", () => {
    render(<AvailabilityTab />);
    fireEvent.click(screen.getByTestId("trigger-non-overlap"));
    fireEvent.click(screen.getByText("Save Changes"));
    expect(mockSaveAvailability).toHaveBeenCalled();
  });

  it("disables save button and handleSave returns early when validation fails", () => {
    render(<AvailabilityTab />);

    // Mark calendar as invalid
    fireEvent.click(screen.getByTestId("trigger-invalid"));

    const saveBtn = screen.getByRole("button", { name: /Save /i });
    expect(saveBtn).toBeDisabled();

    // Directly invoke onClick via React internal props to cover the early-return guard
    const reactKey = Object.keys(saveBtn).find((k) =>
      k.startsWith("__reactProps$"),
    );
    if (reactKey && saveBtn[reactKey].onClick) {
      saveBtn[reactKey].onClick({ preventDefault: () => {} });
    }
    // handleSave should bail out before calling saveAvailability
    expect(mockSaveAvailability).not.toHaveBeenCalled();
  });

  it("handles busy conflicts formatting with AM/PM, wrap, and falsy slot start or end time", () => {
    const OriginalDate = globalThis.Date;
    globalThis.Date = class extends OriginalDate {
      constructor(...args) {
        if (typeof args[0] === "string" && args[0].includes("null")) {
          return new OriginalDate("2026-07-15T10:00:00");
        }
        return new OriginalDate(...args);
      }
    };

    const customAvailability = {
      specificDates: [
        {
          date: "2026-07-15",
          slots: [
            { startTime: "09:00", endTime: "12:00" }, // covers AM and || 12 wraps
            { startTime: null, endTime: "15:00" }, // falsy startTime triggers formatSlotTime early return
          ],
        },
      ],
      googleCalendarConnected: false,
      sessionDurations: [30, 60],
      timezone: "Asia/Kolkata",
    };

    useAvailability.mockReturnValue({
      availability: customAvailability,
      loading: false,
      saving: false,
      msg: { type: "", text: "" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });

    render(<AvailabilityTab />);
    fireEvent.click(screen.getByTestId("trigger-custom-conflict"));
    fireEvent.click(screen.getByText("Save Changes"));

    expect(screen.getByText("Busy Time Conflict")).toBeInTheDocument();

    globalThis.Date = OriginalDate;
  });

  it("handles nullish specificDates fallback rendering and saving state text", () => {
    const nullishAvailability = {
      specificDates: null,
      googleCalendarConnected: false,
      sessionDurations: [30, 60],
      timezone: "Asia/Kolkata",
    };

    useAvailability.mockReturnValue({
      availability: nullishAvailability,
      loading: false,
      saving: false,
      msg: { type: "", text: "" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });

    render(<AvailabilityTab />);

    // Save changes when specificDates is null
    fireEvent.click(screen.getByText("Save Changes"));
    expect(mockSaveAvailability).toHaveBeenCalled();
  });

  it("triggers conflict modal and allows saving anyway or editing", () => {
    render(<AvailabilityTab />);

    // Trigger conflict setting specific dates & busy slots
    fireEvent.click(screen.getByTestId("trigger-conflict"));

    // Save changes
    fireEvent.click(screen.getByText("Save Changes"));

    // Conflicts found -> BusyConflictModal visible
    expect(screen.getByText("Busy Time Conflict")).toBeInTheDocument();

    // 1. Click cancel (Go Back & Edit)
    fireEvent.click(screen.getByText("Go Back & Edit"));
    expect(screen.queryByText("Busy Time Conflict")).not.toBeInTheDocument();
    expect(mockSaveAvailability).not.toHaveBeenCalled();

    // Save changes again
    fireEvent.click(screen.getByText("Save Changes"));

    // 2. Click confirm (Yes, Save Anyway)
    fireEvent.click(screen.getByText("Yes, Save Anyway"));
    expect(screen.queryByText("Busy Time Conflict")).not.toBeInTheDocument();
    expect(mockSaveAvailability).toHaveBeenCalled();
  });

  it("displays Saving... state on button when saving is true", () => {
    useAvailability.mockReturnValue({
      availability: defaultAvailability,
      loading: false,
      saving: true,
      msg: { type: "", text: "" },
      toggleDuration: mockToggleDuration,
      updateTimezone: mockUpdateTimezone,
      saveAvailability: mockSaveAvailability,
      cancelChanges: mockCancelChanges,
      setSpecificDates: mockSetSpecificDates,
      setAvailability: mockSetAvailability,
    });

    render(<AvailabilityTab />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
