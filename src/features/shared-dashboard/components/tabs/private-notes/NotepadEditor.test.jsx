// src/features/shared-dashboard/components/tabs/private-notes/NotepadEditor.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";

import NotepadEditor from "./NotepadEditor.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeNote = (overrides = {}) => ({
  _id: "note-1",
  title: "Test Title",
  content: "Test content here",
  ...overrides,
});

const defaultProps = (overrides = {}) => ({
  note: makeNote(),
  onSave: vi.fn(() => Promise.resolve({ success: true })),
  onDelete: vi.fn(),
  onClose: vi.fn(),
  saving: false,
  ...overrides,
});

// ─── jsdom polyfills ──────────────────────────────────────────────────────────
const origCreateObjectURL = globalThis.URL.createObjectURL;
const origRevokeObjectURL = globalThis.URL.revokeObjectURL;
const origOpen = globalThis.open;

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.URL.createObjectURL = vi.fn(() => "blob:fake");
  globalThis.URL.revokeObjectURL = vi.fn();
  globalThis.open = vi.fn(() => null);
});

afterEach(() => {
  globalThis.URL.createObjectURL = origCreateObjectURL;
  globalThis.URL.revokeObjectURL = origRevokeObjectURL;
  globalThis.open = origOpen;
});

describe("NotepadEditor", () => {
  // ── Initial render ────────────────────────────────────────────────────────
  it("renders the note title in the input", () => {
    render(<NotepadEditor {...defaultProps()} />);
    expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
  });

  it("renders the note content in the textarea", () => {
    render(<NotepadEditor {...defaultProps()} />);
    expect(screen.getByDisplayValue("Test content here")).toBeInTheDocument();
  });

  it("shows placeholder text in the title input when title is empty", () => {
    render(<NotepadEditor {...defaultProps({ note: makeNote({ title: "" }) })} />);
    expect(screen.getByPlaceholderText("Note title...")).toBeInTheDocument();
  });

  it("shows placeholder text in the textarea when content is empty", () => {
    render(
      <NotepadEditor {...defaultProps({ note: makeNote({ content: "" }) })} />
    );
    expect(
      screen.getByPlaceholderText(/start writing your private note/i)
    ).toBeInTheDocument();
  });

  // ── Word / char counter ───────────────────────────────────────────────────
  it("displays the word count and character count", () => {
    render(<NotepadEditor {...defaultProps()} />);
    // "Test content here" = 3 words, 17 chars
    expect(screen.getByText(/3 words/i)).toBeInTheDocument();
    expect(screen.getByText(/17 chars/i)).toBeInTheDocument();
  });

  it("shows '1 word' (singular) when there is exactly one word", () => {
    render(
      <NotepadEditor {...defaultProps({ note: makeNote({ content: "Hello" }) })} />
    );
    expect(screen.getByText(/1 word\b/i)).toBeInTheDocument();
  });

  it("shows '0 words' when content is empty", () => {
    render(
      <NotepadEditor {...defaultProps({ note: makeNote({ content: "" }) })} />
    );
    expect(screen.getByText(/0 words/i)).toBeInTheDocument();
  });

  // ── Dirty / unsaved state ─────────────────────────────────────────────────
  it("does NOT show 'Unsaved changes' initially", () => {
    render(<NotepadEditor {...defaultProps()} />);
    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
  });

  it("shows 'Unsaved changes' after the title is edited", () => {
    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.change(screen.getByPlaceholderText("Note title..."), {
      target: { value: "New Title" },
    });
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  it("shows 'Unsaved changes' after the content is edited", () => {
    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "New content" } }
    );
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  // ── Save button ───────────────────────────────────────────────────────────
  it("Save button is disabled when there are no unsaved changes", () => {
    render(<NotepadEditor {...defaultProps()} />);
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).toBeDisabled();
  });

  it("Save button becomes enabled after editing content", () => {
    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "Changed" } }
    );
    const saveBtn = screen.getByRole("button", { name: /save/i });
    expect(saveBtn).not.toBeDisabled();
  });

  it("calls onSave with correct args when Save is clicked", async () => {
    const onSave = vi.fn(() => Promise.resolve({ success: true }));
    render(<NotepadEditor {...defaultProps({ onSave })} />);
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "Updated" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith("note-1", "Test Title", "Updated")
    );
  });

  it("clears dirty state after successful save", async () => {
    const onSave = vi.fn(() => Promise.resolve({ success: true }));
    render(<NotepadEditor {...defaultProps({ onSave })} />);
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "Updated" } }
    );
    // Ensure 'Unsaved changes' is visible before save
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument()
    );
  });

  it("retains dirty state when onSave does not return { success: true }", async () => {
    const onSave = vi.fn(() => Promise.resolve({ success: false }));
    render(<NotepadEditor {...defaultProps({ onSave })} />);
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "Oops" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  // ── Saving spinner ────────────────────────────────────────────────────────
  it("shows 'Saving' text and disables Save when saving=true", () => {
    render(<NotepadEditor {...defaultProps({ saving: true })} />);
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  // ── Delete button ─────────────────────────────────────────────────────────
  it("renders the delete button when note has an _id", () => {
    render(<NotepadEditor {...defaultProps()} />);
    const buttons = screen.getAllByRole("button");
    const deleteBtn = buttons.find((b) => b.className.includes("border-red-200"));
    expect(deleteBtn).toBeTruthy();
  });

  it("does NOT render the delete button when note has no _id", () => {
    render(
      <NotepadEditor {...defaultProps({ note: makeNote({ _id: undefined }) })} />
    );
    const buttons = screen.getAllByRole("button");
    const deleteBtn = buttons.find((b) => b.className.includes("border-red-200"));
    expect(deleteBtn).toBeUndefined();
  });

  it("calls onDelete with the note _id when delete is clicked", () => {
    const onDelete = vi.fn();
    render(<NotepadEditor {...defaultProps({ onDelete })} />);
    const buttons = screen.getAllByRole("button");
    const deleteBtn = buttons.find((b) => b.className.includes("border-red-200"));
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("note-1");
  });

  // ── Close button ──────────────────────────────────────────────────────────
  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<NotepadEditor {...defaultProps({ onClose })} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Download .txt ─────────────────────────────────────────────────────────
  it("triggers a .txt download when the .txt button is clicked", () => {
    // Mock only what download needs: URL.createObjectURL already polyfilled
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    // Override createElement only for 'a' tags
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        const el = realCreate("a");
        el.click = clickSpy;
        el.remove = removeSpy;
        return el;
      }
      return realCreate(tag);
    });

    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Download as .txt"));

    expect(clickSpy).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("uses 'note.txt' as download name when title is empty", () => {
    const clickSpy = vi.fn();
    let capturedAnchor;
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        const el = realCreate("a");
        el.click = clickSpy;
        el.remove = vi.fn();
        capturedAnchor = el;
        return el;
      }
      return realCreate(tag);
    });

    render(
      <NotepadEditor {...defaultProps({ note: makeNote({ title: "" }) })} />
    );
    fireEvent.click(screen.getByTitle("Download as .txt"));
    expect(capturedAnchor.download).toBe("note.txt");

    vi.restoreAllMocks();
  });

  // ── Download PDF ──────────────────────────────────────────────────────────
  it("calls globalThis.open when the PDF button is clicked", () => {
    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Download as PDF"));
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(globalThis.open).toHaveBeenCalledWith("blob:fake", "_blank");
  });

  it("revokes the object URL immediately when globalThis.open returns null", () => {
    globalThis.open = vi.fn(() => null);
    render(<NotepadEditor {...defaultProps()} />);
    fireEvent.click(screen.getByTitle("Download as PDF"));
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  // ── Note change resets editor ─────────────────────────────────────────────
  it("resets title and content when the note prop changes (different _id)", async () => {
    const { rerender } = render(<NotepadEditor {...defaultProps()} />);
    // Make dirty
    fireEvent.change(
      screen.getByPlaceholderText(/start writing your private note/i),
      { target: { value: "Dirty" } }
    );
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();

    // Re-render with a different note (_id changes triggers useEffect)
    rerender(
      <NotepadEditor
        {...defaultProps({
          note: { _id: "note-2", title: "Another Note", content: "Fresh content" },
        })}
      />
    );

    await waitFor(() =>
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument()
    );
    expect(screen.getByDisplayValue("Another Note")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fresh content")).toBeInTheDocument();
  });
});
