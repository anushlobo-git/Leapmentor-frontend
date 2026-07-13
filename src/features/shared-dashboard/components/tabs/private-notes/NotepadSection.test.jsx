import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotepadSection from "./NotepadSection";
import usePrivateNotes from "@features/notes/hooks/usePrivateNotes";

// Mock the custom notes hook layer
vi.mock("@features/notes/hooks/usePrivateNotes", () => ({
  default: vi.fn(),
}));

// Mock subcomponents to track parameter handoffs cleanly
vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/NotepadEditor",
  () => ({
    default: ({ note, onSave, onDelete, onClose, saving }) => (
      <div data-testid="mock-editor">
        <h3>Active: {note.title}</h3>
        <p>Content: {note.content}</p>
        {saving && <span>Saving In Progress</span>}
        <button
          onClick={() => onSave(note._id, "Updated Title", "Updated Content")}
        >
          Save Note
        </button>
        <button
          onClick={() => onSave(null, "Brand New Title", "Brand New Content")}
        >
          Save As New
        </button>
        <button onClick={() => onDelete(note._id)}>Delete Note</button>
        <button onClick={onClose}>Close Editor</button>
      </div>
    ),
  }),
);

vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/NoteListItem",
  () => ({
    default: ({ note, isActive, onClick }) => (
      <button
        data-testid={`note-item-${note._id}`}
        data-active={isActive}
        onClick={onClick}
      >
        {note.title}
      </button>
    ),
  }),
);

describe("NotepadSection", () => {
  const mockNotes = [
    {
      _id: "note-1",
      title: "First Idea Log",
      content: "Markdown details here.",
    },
    {
      _id: "note-2",
      title: "Second Strategy Checklist",
      content: "More points.",
    },
  ];

  const baseHookValues = {
    notes: mockNotes,
    loading: false,
    saving: false,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usePrivateNotes.mockReturnValue(baseHookValues);
    vi.spyOn(globalThis, "confirm").mockImplementation(() => true);
  });

  it("should display a loading spinner loop when hook indicates loading state is true", () => {
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      loading: true,
    });

    const { container } = render(
      <NotepadSection connectId="c-123" isCompleted={false} />,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.queryByText("New Note")).not.toBeInTheDocument();
  });

  it("should auto-select the first note element on load via effects when data finishes fetching", () => {
    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    // Verify item 1 auto-assigns active statuses attributes
    expect(screen.getByTestId("note-item-note-1")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId("note-item-note-2")).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(screen.getByText("Active: First Idea Log")).toBeInTheDocument();
  });

  it("should render placeholder empty view layout elements when notes list arrives completely empty", () => {
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      notes: [],
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(screen.getByText("No note selected")).toBeInTheDocument();

    // Check that both empty view and sidebar "New Note" triggers show up
    expect(screen.getAllByRole("button", { name: /New Note/i })).toHaveLength(
      2,
    );
  });

  it("should suppress addition actions workflows when isCompleted prop flag evaluates to true", () => {
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      notes: [],
    });

    render(<NotepadSection connectId="c-123" isCompleted={true} />);

    expect(
      screen.queryByRole("button", { name: /New Note/i }),
    ).not.toBeInTheDocument();
  });

  it("should update views and set active notes elements context when a user creates an untitled note successfully", async () => {
    const user = userEvent.setup();
    const mockCreateNote = vi.fn().mockResolvedValue({
      success: true,
      note: { _id: "note-new-abc", title: "Untitled Note", content: "" },
    });

    // Append the new note to the mocked list to properly satisfy the internal notes.find lookup branch
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      createNote: mockCreateNote,
      notes: [
        ...mockNotes,
        { _id: "note-new-abc", title: "Untitled Note", content: "" },
      ],
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const newNoteBtn = screen.getAllByRole("button", { name: /New Note/i })[0];
    await user.click(newNoteBtn);

    expect(mockCreateNote).toHaveBeenCalledWith("Untitled Note", "");
    expect(screen.getByText("Active: Untitled Note")).toBeInTheDocument();
  });

  it("should ignore structural state assignments if a new note creation action resolves unsuccessfully", async () => {
    const user = userEvent.setup();
    const mockCreateNote = vi.fn().mockResolvedValue({ success: false });

    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      createNote: mockCreateNote,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const newNoteBtn = screen.getAllByRole("button", { name: /New Note/i })[0];
    await user.click(newNoteBtn);

    // activeNote stays assigned to default index 0 note element
    expect(screen.getByText("Active: First Idea Log")).toBeInTheDocument();
  });

  it("should route save calls containing IDs into updateNote hooks cleanly", async () => {
    const user = userEvent.setup();
    const mockUpdateNote = vi.fn();

    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      updateNote: mockUpdateNote,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const saveBtn = screen.getByRole("button", { name: "Save Note" });
    await user.click(saveBtn);

    expect(mockUpdateNote).toHaveBeenCalledWith(
      "note-1",
      "Updated Title",
      "Updated Content",
    );
  });

  it("should route save calls missing IDs into createNote hooks, updating tracking IDs upon successful resolutions", async () => {
    const user = userEvent.setup();
    const mockCreateNote = vi.fn().mockResolvedValue({
      success: true,
      note: {
        _id: "note-created-xyz",
        title: "Brand New Title",
        content: "Brand New Content",
      },
    });

    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      createNote: mockCreateNote,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    // Mock activeNote array append to bypass find fallback limits during testing execution loops
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      notes: [
        ...mockNotes,
        {
          _id: "note-created-xyz",
          title: "Brand New Title",
          content: "Brand New Content",
        },
      ],
    });

    const saveAsNewBtn = screen.getByRole("button", { name: "Save As New" });
    await user.click(saveAsNewBtn);

    expect(mockCreateNote).toHaveBeenCalledWith(
      "Brand New Title",
      "Brand New Content",
    );
    expect(screen.getByText("Active: Brand New Title")).toBeInTheDocument();
  });

  it("should exit delete workflows gracefully if the global confirmation prompt gets declined", async () => {
    const user = userEvent.setup();
    globalThis.confirm.mockReturnValue(false); // User clicks 'Cancel' on confirmation prompt
    const mockDeleteNote = vi.fn();

    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      deleteNote: mockDeleteNote,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete Note" });
    await user.click(deleteBtn);

    expect(mockDeleteNote).not.toHaveBeenCalled();
    expect(screen.getByText("Active: First Idea Log")).toBeInTheDocument();
  });

  it("should delete selected items, automatically shifting active focuses onto alternative surviving notes items", async () => {
    const user = userEvent.setup();
    globalThis.confirm.mockReturnValue(true); // User clicks 'OK' on confirmation prompt
    const mockDeleteNote = vi.fn();

    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      deleteNote: mockDeleteNote,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    // Adjust notes mock values vector to simulate removal updates cleanly inside the render pipeline
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      notes: [mockNotes[1]], // Only second note survives
    });

    const deleteBtn = screen.getByRole("button", { name: "Delete Note" });
    await user.click(deleteBtn);

    expect(mockDeleteNote).toHaveBeenCalledWith("note-1");
    // Focus auto-adjusts to note-2
    expect(
      screen.getByText("Active: Second Strategy Checklist"),
    ).toBeInTheDocument();
  });

  it("should shift active ID tracks when item listings buttons capture manual selection clicks", async () => {
    const user = userEvent.setup();
    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const noteTwoItemBtn = screen.getByTestId("note-item-note-2");
    await user.click(noteTwoItemBtn);

    expect(noteTwoItemBtn).toHaveAttribute("data-active", "true");
    expect(
      screen.getByText("Active: Second Strategy Checklist"),
    ).toBeInTheDocument();
  });

  it("should toggle mobile layout views when interacting with dismiss closures configurations actions", async () => {
    const user = userEvent.setup();
    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const closeEditorBtn = screen.getByRole("button", { name: "Close Editor" });
    await user.click(closeEditorBtn);

    expect(screen.getByText("No note selected")).toBeInTheDocument();
  });

  it("should forward live hook saving flags directly onto active sub-editor layout components", () => {
    usePrivateNotes.mockReturnValue({
      ...baseHookValues,
      saving: true,
    });

    render(<NotepadSection connectId="c-123" isCompleted={false} />);
    expect(screen.getByText("Saving In Progress")).toBeInTheDocument();
  });

  it("should support responsive viewports back transitions button executions elements paths", async () => {
    const user = userEvent.setup();
    render(<NotepadSection connectId="c-123" isCompleted={false} />);

    const backButton = screen.getByRole("button", { name: /Back to notes/i });
    await user.click(backButton);

    // Confirms interaction runs safely without errors
    expect(backButton).toBeInTheDocument();
  });
});
