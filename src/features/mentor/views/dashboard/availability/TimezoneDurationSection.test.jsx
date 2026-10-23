import { render, screen, fireEvent } from "@testing-library/react";
import TimezoneDurationSection from "./TimezoneDurationSection";

describe("TimezoneDurationSection component", () => {
  const mockUpdateTimezone = vi.fn();
  const mockToggleDuration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default timezone selected and formats underscores", () => {
    render(
      <TimezoneDurationSection
        timezone="America/Los_Angeles"
        sessionDurations={[30]}
        updateTimezone={mockUpdateTimezone}
        toggleDuration={mockToggleDuration}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Timezone" });
    expect(select.value).toBe("America/Los_Angeles");

    // Option label should replace _ with a space
    const laOption = screen.getByRole("option", {
      name: "America/Los Angeles",
    });
    expect(laOption).toBeInTheDocument();
  });

  it("calls updateTimezone when a new option is chosen", () => {
    render(
      <TimezoneDurationSection
        timezone="Asia/Kolkata"
        sessionDurations={[30]}
        updateTimezone={mockUpdateTimezone}
        toggleDuration={mockToggleDuration}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Timezone" });
    fireEvent.change(select, { target: { value: "Europe/London" } });

    expect(mockUpdateTimezone).toHaveBeenCalledWith("Europe/London");
  });

  it("toggles session durations and highlights the active options", () => {
    render(
      <TimezoneDurationSection
        timezone="Asia/Kolkata"
        sessionDurations={[30, 60]}
        updateTimezone={mockUpdateTimezone}
        toggleDuration={mockToggleDuration}
      />,
    );

    const btn30 = screen.getByRole("button", {
      name: "30 minute session duration",
    });
    const btn45 = screen.getByRole("button", {
      name: "45 minute session duration",
    });
    const btn60 = screen.getByRole("button", {
      name: "60 minute session duration",
    });

    // Active classes
    expect(btn30).toHaveAttribute("aria-pressed", "true");
    expect(btn30).toHaveClass("bg-blue-900 text-white");

    expect(btn45).toHaveAttribute("aria-pressed", "false");
    expect(btn45).toHaveClass("bg-slate-100 text-slate-600");

    expect(btn60).toHaveAttribute("aria-pressed", "true");
    expect(btn60).toHaveClass("bg-blue-900 text-white");

    // Click 45 min
    fireEvent.click(btn45);
    expect(mockToggleDuration).toHaveBeenCalledWith(45);
  });
});
