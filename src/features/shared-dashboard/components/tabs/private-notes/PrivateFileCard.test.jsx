import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrivateFileCard from "./PrivateFileCard";
import { formatDateString } from "@lib/formatters/dateTime";
import {
  formatFileSize,
  FILE_TYPE_CONFIG,
} from "@features/notes/utils/notesHelpers";
import {
  downloadNoteFile,
  FileTypeBadge,
} from "@features/shared-dashboard/components/tabs/notesTabShared";

// Mock date formatter utility
vi.mock("@lib/formatters/dateTime", () => ({
  formatDateString: vi.fn(() => "July 13, 2026"),
}));

// Mock size formatting and config variables
vi.mock("@features/notes/utils/notesHelpers", () => ({
  formatFileSize: vi.fn(() => "4.5 MB"),
  FILE_TYPE_CONFIG: {
    pdf: { icon: "pdf-icon", color: "red" },
    other: { icon: "generic-icon", color: "slate" },
  },
}));

// Mock shared note layout components and global download handlers
vi.mock("@features/shared-dashboard/components/tabs/notesTabShared", () => ({
  downloadNoteFile: vi.fn(),
  FileTypeBadge: vi.fn(({ cfg }) => (
    <div data-testid="file-type-badge" data-icon={cfg.icon} />
  )),
}));

describe("PrivateFileCard", () => {
  const baseNote = {
    _id: "note-abc-123",
    fileType: "pdf",
    title: "Q3 Strategy Planning Document",
    fileName: "q3_final_report.pdf",
    fileUrl: "https://storage.leapmentor.com/private/q3.pdf",
    fileSize: 4718592,
    createdAt: "2026-07-13T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly when title and filename are distinct strings", () => {
    render(<PrivateFileCard note={baseNote} onDelete={vi.fn()} />);

    expect(
      screen.getByText("Q3 Strategy Planning Document"),
    ).toBeInTheDocument();
    expect(screen.getByText("q3_final_report.pdf")).toBeInTheDocument();
    expect(screen.getByText(/4.5 MB/)).toBeInTheDocument();
    expect(screen.getByText(/July 13, 2026/)).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();

    const badge = screen.getByTestId("file-type-badge");
    expect(badge).toHaveAttribute("data-icon", "pdf-icon");
  });

  it("should suppress secondary filename label if title is omitted or matches the filename exactly", () => {
    const fallbackNote = {
      ...baseNote,
      title: "", // Forces title || fileName fallback branch check
      fileName: "shared_workbook.xlsx",
    };

    const { rerender } = render(
      <PrivateFileCard note={fallbackNote} onDelete={vi.fn()} />,
    );

    // Title display falls back to raw fileName text string
    expect(screen.getByText("shared_workbook.xlsx")).toBeInTheDocument();

    // Duplicate sub-text label element should be suppressed
    const headings = screen.queryAllByText("shared_workbook.xlsx");
    expect(headings).toHaveLength(1);

    // Re-verify when title matches fileName exactly
    const matchingTitleNote = {
      ...baseNote,
      title: "same_name.docx",
      fileName: "same_name.docx",
    };
    rerender(<PrivateFileCard note={matchingTitleNote} onDelete={vi.fn()} />);
    expect(screen.queryAllByText("same_name.docx")).toHaveLength(1);
  });

  it("should fall back to general configurations object if fileType key does not exist inside configuration matrix", () => {
    const exoticNote = {
      ...baseNote,
      fileType: "unknown-exotic-extension",
    };

    render(<PrivateFileCard note={exoticNote} onDelete={vi.fn()} />);

    const badge = screen.getByTestId("file-type-badge");
    expect(badge).toHaveAttribute("data-icon", "generic-icon");
  });

  it("should trigger download action file utility functions when clicking the download button", async () => {
    const user = userEvent.setup();
    render(<PrivateFileCard note={baseNote} onDelete={vi.fn()} />);

    const downloadButton = screen.getByRole("button", { name: /Download/i });
    await user.click(downloadButton);

    expect(downloadNoteFile).toHaveBeenCalledTimes(1);
    expect(downloadNoteFile).toHaveBeenCalledWith(baseNote, "private note");
  });

  it("should abort delete workflow seamlessly if confirmation dialogue resolves false", async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();
    const confirmSpy = vi.spyOn(globalThis, "confirm").mockReturnValue(false);

    render(<PrivateFileCard note={baseNote} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith("Delete this file?");
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("should toggle loading descriptors text and execute onDelete successfully when confirmation dialog is accepted", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);

    // Create a deferred promise mechanism to halt state update resolution mid-flight
    let resolveDeletePromise;
    const mockOnDelete = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveDeletePromise = resolve;
      });
    });

    render(<PrivateFileCard note={baseNote} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    // Verify button goes into disabling lifecycle status and changes text to Deleting...
    expect(deleteButton).toHaveTextContent("Deleting...");
    expect(deleteButton).toBeDisabled();
    expect(mockOnDelete).toHaveBeenCalledWith("note-abc-123");

    // Flush the asynchronous operation loop
    await act(async () => {
      resolveDeletePromise();
    });

    // Check cleanup transitions return component fields back onto passive defaults
    expect(deleteButton).toHaveTextContent("Delete");
    expect(deleteButton).not.toBeDisabled();
  });
});
