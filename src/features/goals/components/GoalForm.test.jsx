import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GoalForm from "./GoalForm";

describe("GoalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty default fields when no initial data configuration is provided", () => {
    render(<GoalForm onSave={vi.fn()} onCancel={vi.fn()} saving={false} />);

    expect(screen.getByLabelText(/Goal Title/i)).toHaveValue("");
    expect(screen.getByLabelText(/Description/i)).toHaveValue("");
    expect(screen.getByLabelText(/Start Date/i)).toHaveValue("");
    expect(screen.getByLabelText(/End Date/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /Save Goal/i })).toBeDisabled();
  });

  it("should populate fields correctly when given initial values payload", () => {
    const initialData = {
      title: "Master TypeScript",
      description: "Complete advanced design patterns course.",
      startDate: "2026-07-01",
      endDate: "2026-08-31",
    };

    render(
      <GoalForm
        initial={initialData}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={false}
      />,
    );

    expect(screen.getByLabelText(/Goal Title/i)).toHaveValue(
      "Master TypeScript",
    );
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      "Complete advanced design patterns course.",
    );
    expect(screen.getByLabelText(/Start Date/i)).toHaveValue("2026-07-01");
    expect(screen.getByLabelText(/End Date/i)).toHaveValue("2026-08-31");
    expect(
      screen.getByRole("button", { name: /Save Goal/i }),
    ).not.toBeDisabled();
  });

  it("should display a loading spinner and disable interactive action buttons while saving is true", () => {
    render(
      <GoalForm
        initial={{ title: "React Test" }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={true}
      />,
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Saving.../i })).toBeDisabled();
  });

  it("should invoke onCancel callback handler when the user clicks the cancel button", async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();

    render(
      <GoalForm onSave={vi.fn()} onCancel={mockOnCancel} saving={false} />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should produce a validation error if the goal title branch verification checks fail", async () => {
    const mockOnSave = vi.fn();
    render(<GoalForm onSave={mockOnSave} onCancel={vi.fn()} saving={false} />);

    const saveButton = screen.getByRole("button", { name: /Save Goal/i });

    // Programmatically trigger the internal React handler wrapped inside act to capture the state update safely
    const reactPropsKey = Object.keys(saveButton).find((key) =>
      key.startsWith("__reactProps"),
    );
    if (reactPropsKey && saveButton[reactPropsKey]?.onClick) {
      await act(async () => {
        saveButton[reactPropsKey].onClick({
          preventDefault: () => {},
          stopPropagation: () => {},
        });
      });
    } else {
      fireEvent.click(saveButton);
    }

    // Await the asynchronous rendering change cleanly using findByText
    expect(
      await screen.findByText("Goal title is required"),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should display a validation message if either start date or end date fields are left empty", async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();

    render(<GoalForm onSave={mockOnSave} onCancel={vi.fn()} saving={false} />);

    const titleInput = screen.getByLabelText(/Goal Title/i);
    await user.type(titleInput, "Incomplete Date Milestone Goal");

    const saveButton = screen.getByRole("button", { name: /Save Goal/i });
    await user.click(saveButton);

    expect(
      screen.getByText("Please set both a start date and an end date"),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should trigger an error message if the end date is chronologically configured before the start date", async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();

    render(<GoalForm onSave={mockOnSave} onCancel={vi.fn()} saving={false} />);

    await user.type(screen.getByLabelText(/Goal Title/i), "Time paradox goal");

    // Set invalid inverted date bounds
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: "2026-07-20" },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: "2026-07-10" },
    });

    const saveButton = screen.getByRole("button", { name: /Save Goal/i });
    await user.click(saveButton);

    expect(
      screen.getByText("End date cannot be before start date"),
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should clear validation errors and invoke onSave happily when payload criteria constraints are entirely valid", async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();

    render(<GoalForm onSave={mockOnSave} onCancel={vi.fn()} saving={false} />);

    // Populate valid configuration
    await user.type(
      screen.getByLabelText(/Goal Title/i),
      "   Valid Goal Entry Space Check   ",
    );
    await user.type(
      screen.getByLabelText(/Description/i),
      "Optional description string payload.",
    );
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: "2026-07-15" },
    });

    const saveButton = screen.getByRole("button", { name: /Save Goal/i });
    await user.click(saveButton);

    // Verify error is cleared and data is trimmed/passed properly
    expect(
      screen.queryByText("End date cannot be before start date"),
    ).not.toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      title: "Valid Goal Entry Space Check",
      description: "Optional description string payload.",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
    });
  });
});
