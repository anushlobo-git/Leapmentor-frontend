// src/features/shared-dashboard/components/tabs/notesTabShared.test.jsx
import { render, screen } from "@testing-library/react";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock("@lib/logger", () => ({
  default: { info: vi.fn(), warn: vi.fn() },
}));
vi.mock("@lib/formatters/dateTime", () => ({
  formatDateSeparator: vi.fn((d) => (d ? "Today" : "")),
  isSameDay: vi.fn((a, b) => a === b),
}));

// ─── Imports after mocks ─────────────────────────────────────────────────────
import logger from "@lib/logger";
import { formatDateSeparator, isSameDay } from "@lib/formatters/dateTime";
import {
  groupNotesByDay,
  downloadNoteFile,
  NoteDateSeparator,
  FileTypeBadge,
  NotesLoadingSkeletons,
} from "./notesTabShared.jsx";

// ─── groupNotesByDay ──────────────────────────────────────────────────────────
describe("groupNotesByDay", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an empty array for an empty notes list", () => {
    expect(groupNotesByDay([])).toEqual([]);
  });

  it("inserts a separator before every group of notes on a new day", () => {
    vi.mocked(isSameDay).mockReturnValue(false); // treat every pair as different days

    const notes = [
      { _id: "n1", createdAt: "2025-01-01T10:00:00Z" },
      { _id: "n2", createdAt: "2025-01-02T10:00:00Z" },
    ];
    const result = groupNotesByDay(notes);

    // Expect: sep, note, sep, note  (4 items)
    expect(result).toHaveLength(4);
    expect(result[0].type).toBe("separator");
    expect(result[1].type).toBe("note");
    expect(result[2].type).toBe("separator");
    expect(result[3].type).toBe("note");
  });

  it("inserts only one separator when two notes are on the same day", () => {
    vi.mocked(isSameDay).mockReturnValue(true); // same day for all pairs

    const notes = [
      { _id: "n1", createdAt: "2025-01-01T09:00:00Z" },
      { _id: "n2", createdAt: "2025-01-01T11:00:00Z" },
    ];
    const result = groupNotesByDay(notes);

    // Expect: sep, note, note  (3 items)
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe("separator");
    expect(result[1].type).toBe("note");
    expect(result[2].type).toBe("note");
  });

  it("sets correct dateStr and key on separator items", () => {
    vi.mocked(isSameDay).mockReturnValue(false);
    const note = { _id: "abc", createdAt: "2025-05-10T08:00:00Z" };
    const [sep] = groupNotesByDay([note]);
    expect(sep.dateStr).toBe(note.createdAt);
    expect(sep.key).toBe(`sep-${note._id}`);
  });

  it("sets the note and key on note items", () => {
    vi.mocked(isSameDay).mockReturnValue(false);
    const note = { _id: "xyz", createdAt: "2025-05-10T08:00:00Z" };
    const items = groupNotesByDay([note]);
    const noteItem = items.find((i) => i.type === "note");
    expect(noteItem.note).toBe(note);
    expect(noteItem.key).toBe(note._id);
  });
});

// ─── downloadNoteFile ─────────────────────────────────────────────────────────
describe("downloadNoteFile", () => {
  let origFetch;
  let origCreateObjectURL;
  let origRevokeObjectURL;
  let origOpen;

  beforeEach(() => {
    vi.clearAllMocks();
    origFetch = globalThis.fetch;
    origCreateObjectURL = globalThis.URL.createObjectURL;
    origRevokeObjectURL = globalThis.URL.revokeObjectURL;
    origOpen = globalThis.open;
    globalThis.URL.createObjectURL = vi.fn(() => "blob:fake-url");
    globalThis.URL.revokeObjectURL = vi.fn();
    globalThis.open = vi.fn();
  });

  afterEach(() => {
    // IMPORTANT: restore all spies before React tests run
    vi.restoreAllMocks();
    globalThis.fetch = origFetch;
    globalThis.URL.createObjectURL = origCreateObjectURL;
    globalThis.URL.revokeObjectURL = origRevokeObjectURL;
    globalThis.open = origOpen;
  });

  it("logs an info message with fileId and fileUrl on success", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve(new Blob(["data"])) })
    );
    const note = { _id: "n1", fileUrl: "https://example.com/file.pdf", fileName: "file.pdf" };
    const realCreate = document.createElement.bind(document);
    const anchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document, "createElement").mockImplementation((tag) =>
      tag === "a" ? anchor : realCreate(tag)
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});

    await downloadNoteFile(note, "shared note");

    expect(logger.info).toHaveBeenCalledWith(
      "Downloading shared note file",
      expect.objectContaining({ fileId: "n1", fileUrl: note.fileUrl })
    );
    expect(anchor.download).toBe("file.pdf");
    expect(anchor.click).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("falls back to globalThis.open when fetch throws", async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("network error")));
    const note = { _id: "n2", fileUrl: "https://example.com/file.pdf" };
    await downloadNoteFile(note, "private note");
    expect(logger.warn).toHaveBeenCalled();
    expect(globalThis.open).toHaveBeenCalledWith(note.fileUrl, "_blank");
  });

  it("uses 'download' as fileName when note.fileName is absent", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve(new Blob(["x"])) })
    );
    const realCreate = document.createElement.bind(document);
    const anchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document, "createElement").mockImplementation((tag) =>
      tag === "a" ? anchor : realCreate(tag)
    );
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
    const note = { _id: "n3", fileUrl: "https://example.com/x" };
    await downloadNoteFile(note, "note");
    expect(anchor.download).toBe("download");
  });

  it("capitalizes the label in the warn message", async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("err")));
    const note = { _id: "n4", fileUrl: "url" };

    await downloadNoteFile(note, "shared note");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Shared note"),
      expect.any(Object)
    );
  });
});

// ─── NoteDateSeparator ────────────────────────────────────────────────────────
describe("NoteDateSeparator", () => {
  it("renders the formatted date returned by formatDateSeparator", () => {
    vi.mocked(formatDateSeparator).mockReturnValue("May 10, 2025");
    render(<NoteDateSeparator dateStr="2025-05-10T00:00:00Z" />);
    expect(screen.getByText("May 10, 2025")).toBeInTheDocument();
  });

  it("renders 'Today' when formatDateSeparator returns 'Today'", () => {
    vi.mocked(formatDateSeparator).mockReturnValue("Today");
    render(<NoteDateSeparator dateStr={new Date().toISOString()} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
});

// ─── FileTypeBadge ────────────────────────────────────────────────────────────
describe("FileTypeBadge", () => {
  const cfg = {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    icon: "📄",
    label: "PDF",
  };

  it("renders the icon and label", () => {
    render(<FileTypeBadge cfg={cfg} />);
    expect(screen.getByText("📄")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("applies the cfg CSS classes to the container", () => {
    const { container } = render(<FileTypeBadge cfg={cfg} />);
    const div = container.firstChild;
    expect(div.className).toContain("bg-red-50");
    expect(div.className).toContain("border-red-200");
  });
});

// ─── NotesLoadingSkeletons ─────────────────────────────────────────────────────
describe("NotesLoadingSkeletons", () => {
  it("renders 4 skeleton cards", () => {
    const { container } = render(
      <NotesLoadingSkeletons gridClassName="grid grid-cols-2 gap-4" />
    );
    const cards = container.querySelectorAll(".animate-pulse");
    expect(cards).toHaveLength(4);
  });

  it("applies the provided gridClassName to the wrapper", () => {
    const { container } = render(
      <NotesLoadingSkeletons gridClassName="my-custom-grid" />
    );
    expect(container.firstChild.className).toContain("my-custom-grid");
  });
});
