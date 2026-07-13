// src/features/shared-dashboard/components/tabs/private-notes/NoteListItem.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock("@lib/formatters/dateTime", () => ({
  formatDateString: vi.fn((v) => (v ? "Jan 1, 2025" : "")),
}));

import NoteListItem from "./NoteListItem.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeNote = (overrides = {}) => ({
  _id: "note-1",
  title: "My Note",
  content: "Hello world this is a note",
  updatedAt: "2025-01-01T00:00:00Z",
  ...overrides,
});

describe("NoteListItem", () => {
  let onClick;

  beforeEach(() => {
    vi.clearAllMocks();
    onClick = vi.fn();
  });

  // ── Renders title ──────────────────────────────────────────────────────────
  it("renders the note title", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    expect(screen.getByText("My Note")).toBeInTheDocument();
  });

  // ── Fallback title ─────────────────────────────────────────────────────────
  it("shows 'Untitled Note' when title is absent", () => {
    render(
      <NoteListItem note={makeNote({ title: "" })} isActive={false} onClick={onClick} />
    );
    expect(screen.getByText("Untitled Note")).toBeInTheDocument();
  });

  // ── Content preview ────────────────────────────────────────────────────────
  it("renders a truncated content preview", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    expect(screen.getByText("Hello world this is a note")).toBeInTheDocument();
  });

  // ── No preview when content is empty ──────────────────────────────────────
  it("does not render a preview paragraph when content is empty", () => {
    const { container } = render(
      <NoteListItem note={makeNote({ content: "" })} isActive={false} onClick={onClick} />
    );
    const paragraphs = container.querySelectorAll("p");
    // title paragraph + date paragraph = 2; no third "preview" paragraph
    expect(paragraphs).toHaveLength(2);
    // Confirm none of the paragraphs has the preview class
    const hasPreview = Array.from(paragraphs).some((p) =>
      p.className.includes("text-xs text-slate-400")
    );
    expect(hasPreview).toBe(false);
  });

  // ── Preview limited to 60 chars ────────────────────────────────────────────
  it("limits the preview to the first 60 characters of content", () => {
    const longContent = "A".repeat(100);
    render(
      <NoteListItem note={makeNote({ content: longContent })} isActive={false} onClick={onClick} />
    );
    expect(screen.getByText("A".repeat(60))).toBeInTheDocument();
  });

  // ── Formatted date ─────────────────────────────────────────────────────────
  it("shows the formatted updatedAt date", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    expect(screen.getByText("Jan 1, 2025")).toBeInTheDocument();
  });

  // ── onClick called ─────────────────────────────────────────────────────────
  it("calls onClick when the button is clicked", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ── Active styles ──────────────────────────────────────────────────────────
  it("applies active styling classes when isActive is true", () => {
    render(<NoteListItem note={makeNote()} isActive={true} onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-blue-300");
    expect(button.className).toContain("bg-blue-50");
  });

  // ── Inactive styles ────────────────────────────────────────────────────────
  it("applies inactive styling classes when isActive is false", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-slate-200");
    expect(button.className).toContain("bg-white");
  });

  // ── Title colour when active ───────────────────────────────────────────────
  it("applies blue title colour when active", () => {
    render(<NoteListItem note={makeNote()} isActive={true} onClick={onClick} />);
    const title = screen.getByText("My Note");
    expect(title.className).toContain("text-blue-800");
  });

  // ── Title colour when inactive ─────────────────────────────────────────────
  it("applies slate title colour when inactive", () => {
    render(<NoteListItem note={makeNote()} isActive={false} onClick={onClick} />);
    const title = screen.getByText("My Note");
    expect(title.className).toContain("text-slate-700");
  });
});
