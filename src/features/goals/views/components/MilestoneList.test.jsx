import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import MilestoneList from "./MilestoneList";

describe("MilestoneList", () => {
  let mockGoal;
  let mockMilestones;
  let mockOnAdd;
  let mockOnToggle;
  let mockOnDelete;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGoal = { _id: "goal_123" };
    mockOnAdd = vi.fn();
    mockOnToggle = vi.fn();
    mockOnDelete = vi.fn();

    mockMilestones = [
      {
        _id: "m1",
        title: "Milestone One",
        isCompleted: false,
        dueDate: "2027-12-31",
      },
      {
        _id: "m2",
        title: "Milestone Two",
        isCompleted: true,
        dueDate: "2025-01-01",
      },
    ];
  });

  // ── Main Shell & Sorting Branch Path Tests ────────────────────────
  it("should sort pending milestones before completed milestones", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("Milestone One")).toBeInTheDocument();
    expect(screen.getByText("Milestone Two")).toBeInTheDocument();
  });

  it("should render an empty state text banner layout when milestones array length evaluates to 0", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={[]}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("No milestones yet")).toBeInTheDocument();
    expect(
      screen.getByText("Break your goal into smaller, checkable steps."),
    ).toBeInTheDocument();
  });

  // ── MilestoneProgress Component Conditional Branches ──────────────
  it("should display singular form text label block when only 1 milestone total exists", () => {
    const singleMilestone = [
      { _id: "m1", title: "Only One", isCompleted: false },
    ];
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={singleMilestone}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("0 of 1 milestone completed")).toBeInTheDocument();
  });

  it("should display success confirmation icons and text flags when all milestones are completed", () => {
    const allDoneMilestones = [
      { _id: "m1", title: "Done One", isCompleted: true },
      { _id: "m2", title: "Done Two", isCompleted: true },
    ];

    render(
      <MilestoneList
        goal={mockGoal}
        milestones={allDoneMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("All milestones completed!")).toBeInTheDocument();
    expect(screen.getByText("100%")).toHaveClass("text-green-600");
  });

  // ── AddMilestoneForm Action Handler Branches ──────────────────────
  it("should open form and handle adding workflow successfully then clear the layout on success", async () => {
    mockOnAdd.mockResolvedValueOnce({ success: true });

    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    const openFormBtn = screen.getByRole("button", { name: /Add Milestone/i });
    fireEvent.click(openFormBtn);

    const input = screen.getByPlaceholderText("Milestone title...");
    fireEvent.change(input, { target: { value: "New Milestone Item" } });

    const submitBtn = screen.getByRole("button", { name: "Add" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockOnAdd).toHaveBeenCalledWith("goal_123", {
      title: "New Milestone Item",
    });
    expect(
      screen.queryByPlaceholderText("Milestone title..."),
    ).not.toBeInTheDocument();
  });

  it("should remain inside form layout structure if the handleAdd resolution response object success flag evaluates to false", async () => {
    mockOnAdd.mockResolvedValueOnce({ success: false });

    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Milestone/i }));
    const input = screen.getByPlaceholderText("Milestone title...");
    fireEvent.change(input, { target: { value: "Persistent Title Try" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add" }));
    });

    expect(
      screen.getByPlaceholderText("Milestone title..."),
    ).toBeInTheDocument();
  });

  it("should short-circuit and block onAdd submissions completely if title validation evaluation contains only whitespace parameters", async () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Milestone/i }));
    const input = screen.getByPlaceholderText("Milestone title...");
    fireEvent.change(input, { target: { value: "   " } });

    const addBtn = screen.getByRole("button", { name: "Add" });
    expect(addBtn).toBeDisabled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("should submission processing workflows via enter key onKeyDown listeners when valid strings are passed", async () => {
    mockOnAdd.mockResolvedValueOnce({ success: true });
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Milestone/i }));
    const input = screen.getByPlaceholderText("Milestone title...");
    fireEvent.change(input, { target: { value: "Enter Key Task Entry" } });

    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it("should correctly display button disabled layouts and transform label text parameters when saving configuration properties evaluate to true", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={true}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Milestone/i }));
    fireEvent.change(screen.getByPlaceholderText("Milestone title..."), {
      target: { value: "Saving State Task Check" },
    });

    expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();
  });

  it("should close out form display views cleanly when cancel buttons intercept click handlers", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Milestone/i }));
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByPlaceholderText("Milestone title..."),
    ).not.toBeInTheDocument();
  });

  // ── MilestoneRow Rendering & Interactive Toggle States ─────────────
  it("should execute onToggle checkbox dispatch actions when row check elements capture click events", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    const checkButtons = screen
      .getAllByRole("button")
      .filter((btn) => !btn.textContent && !btn.querySelector("polyline"));
    fireEvent.click(checkButtons[0]);

    expect(mockOnToggle).toHaveBeenCalledWith("m1", true);
  });

  it("should compute date values and render an explicit 'Overdue' text layout warning badge on target nodes", () => {
    const overdueMilestone = [
      {
        _id: "m3",
        title: "Expired Action Task Item",
        isCompleted: false,
        dueDate: "2020-01-01",
      },
    ];
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={overdueMilestone}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
  });

  // ── DeleteMilestoneModal Workflow Intercept Paths ───────────────────
  it("should open validation dialog configurations and handle confirmation selections safely", async () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    const deleteRowButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("polyline"));
    fireEvent.click(deleteRowButtons[0]);

    expect(screen.getByText("Delete Milestone?")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    await act(async () => {
      fireEvent.click(confirmDeleteBtn);
    });

    expect(mockOnDelete).toHaveBeenCalledWith("m1");
    expect(screen.queryByText("Delete Milestone?")).not.toBeInTheDocument();
  });

  it("should cancel confirmation routines and close layout visibility parameters cleanly on backdrop overlay clicks", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    const deleteRowButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("polyline"));
    fireEvent.click(deleteRowButtons[0]);

    const closeDialogBackdrop = screen.getByRole("button", {
      name: "Close dialog",
    });
    fireEvent.click(closeDialogBackdrop);

    expect(screen.queryByText("Delete Milestone?")).not.toBeInTheDocument();
  });

  it("should cancel confirmation routines when explicit modal cancel action buttons are triggered", () => {
    render(
      <MilestoneList
        goal={mockGoal}
        milestones={mockMilestones}
        saving={false}
        onAdd={mockOnAdd}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    );

    const deleteRowButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("polyline"));
    fireEvent.click(deleteRowButtons[0]);

    // Since the Add Form is closed, the only Cancel button present is the one inside the open modal
    const cancelModalBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelModalBtn);

    expect(screen.queryByText("Delete Milestone?")).not.toBeInTheDocument();
  });
});
