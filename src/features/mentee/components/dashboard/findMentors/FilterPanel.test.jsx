import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import FilterPanel from "./FilterPanel";

describe("FilterPanel", () => {
  let defaultFilters;
  let mockUpdateFilter;
  let mockResetFilters;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockUpdateFilter = vi.fn();
    mockResetFilters = vi.fn();

    defaultFilters = {
      industry: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      experience: "",
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Branch 1: Collapsed Default Render ──────────────────────────────
  it("should render the closed filter toggle button without showing active counts or clear actions", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: /Filters/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn.className).toContain("border-slate-200");
    expect(screen.queryByText("Clear all filters")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  // ── Branch 2: Active Filters Badge & Clear Display ──────────────────
  it("should display correct badge counts, update button styles, and render a clear option when items are active", () => {
    const activeFilters = {
      ...defaultFilters,
      industry: "Technology",
      minRating: "4.5",
    };

    render(
      <FilterPanel
        filters={activeFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: /Filters/i });
    expect(toggleBtn.className).toContain("border-blue-400");
    expect(screen.getByText("2")).toBeInTheDocument();

    // Open panel to verify the visibility of the "Clear all filters" option button
    fireEvent.click(toggleBtn);
    const clearBtn = screen.getByRole("button", { name: /Clear all filters/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(mockResetFilters).toHaveBeenCalledTimes(1);
  });

  // ── Branch 3: Collapsible Layout Panel Toggling ──────────────────────
  it("should toggle panel open and close layout visibility parameters upon toggle selection", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: /Filters/i });

    // Open panel
    fireEvent.click(toggleBtn);
    expect(
      screen.getByRole("combobox", { name: /Industry/i }),
    ).toBeInTheDocument();

    // Close panel
    fireEvent.click(toggleBtn);
    expect(
      screen.queryByRole("combobox", { name: /Industry/i }),
    ).not.toBeInTheDocument();
  });

  // ── Branch 4: Industry Dropdown Selection ───────────────────────────
  it("should update filter values immediately when a new industry choice is selected", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const select = screen.getByRole("combobox", { name: /Industry/i });
    fireEvent.change(select, { target: { value: "Finance" } });

    expect(mockUpdateFilter).toHaveBeenCalledWith("industry", "Finance");
  });

  // ── Branch 5: Debounced Minimum and Maximum Prices Range Inputs ──────
  it("should debounce minimum price changes and clear stale tracking timers on sequential entries", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    const minPriceInput = screen.getByRole("spinbutton", {
      name: /Minimum price per hour/i,
    });

    // Simulate keystroke sequence clearing any previous timers
    fireEvent.change(minPriceInput, { target: { value: "4" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(mockUpdateFilter).not.toHaveBeenCalled();

    // Next keystroke executes resetting inner countdown clocks
    fireEvent.change(minPriceInput, { target: { value: "45" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockUpdateFilter).toHaveBeenCalledWith("minPrice", "45");
  });

  it("should debounce maximum price changes and invoke update triggers after structural delays", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));
    const maxPriceInput = screen.getByRole("spinbutton", {
      name: /Maximum price per hour/i,
    });

    fireEvent.change(maxPriceInput, { target: { value: "100" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockUpdateFilter).toHaveBeenCalledWith("maxPrice", "100");
  });

  // ── Branch 6: Minimum Rating Selection Buttons ──────────────────────
  it("should submit explicit filter configurations when specific minimum rating options are selected", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const ratingBtn = screen.getByRole("button", { name: "4.0+" });
    fireEvent.click(ratingBtn);

    expect(mockUpdateFilter).toHaveBeenCalledWith("minRating", "4.0");
  });

  // ── Branch 7: Experience Range Selection Buttons ────────────────────
  it("should update experience criteria immediately when specialized option nodes catch clicks", () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const experienceBtn = screen.getByRole("button", { name: "3–5 yrs" });
    fireEvent.click(experienceBtn);

    expect(mockUpdateFilter).toHaveBeenCalledWith("experience", "3-5");
  });

  // ── Branch 8: Component State Sync via External Filter Updates ─────
  it("should synchronize localized input attributes when active values are modified externally", () => {
    const { rerender } = render(
      <FilterPanel
        filters={defaultFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const minInput = screen.getByRole("spinbutton", {
      name: /Minimum price per hour/i,
    });
    const maxInput = screen.getByRole("spinbutton", {
      name: /Maximum price per hour/i,
    });

    // Verify properties adapt cleanly upon structural shifts
    const incomingExternalFilters = {
      ...defaultFilters,
      minPrice: "25",
      maxPrice: "75",
    };

    rerender(
      <FilterPanel
        filters={incomingExternalFilters}
        updateFilter={mockUpdateFilter}
        resetFilters={mockResetFilters}
      />,
    );

    expect(minInput.value).toBe("25");
    expect(maxInput.value).toBe("75");
  });
});
