import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSelector } from "react-redux";
import useNotes from "@features/notes/hooks/useNotes";
import PrivateFilesSection from "./PrivateFilesSection";
import {
  groupNotesByDay,
  NoteDateSeparator,
  NotesLoadingSkeletons,
} from "@features/shared-dashboard/components/tabs/notesTabShared";

// Mock React Redux useSelector
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

// Mock custom hook layer
vi.mock("@features/notes/hooks/useNotes", () => ({
  default: vi.fn(),
}));

// Mock shared components tab layouts
vi.mock("@features/shared-dashboard/components/tabs/notesTabShared", () => ({
  groupNotesByDay: vi.fn(),
  NoteDateSeparator: vi.fn(() => (
    <div data-testid="mock-separator">Date Separator</div>
  )),
  NotesLoadingSkeletons: vi.fn(() => (
    <div data-testid="mock-loading-skeletons">Loading Skeletons</div>
  )),
}));

// Mock section sub-modals and card items
vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/PrivateUploadModal",
  () => ({
    default: ({ onUpload, onClose }) => (
      <div data-testid="mock-upload-modal">
        <button
          onClick={() => onUpload("mockFileObject", "Custom Document Title")}
        >
          Confirm Upload
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ),
  }),
);

vi.mock(
  "@features/shared-dashboard/components/tabs/private-notes/PrivateFileCard",
  () => ({
    default: ({ note, onDelete }) => (
      <div data-testid={`file-card-${note._id}`}>
        <span>{note.title}</span>
        <button onClick={() => onDelete(note._id)}>Delete File</button>
      </div>
    ),
  }),
);

describe("PrivateFilesSection", () => {
  const baseHookValues = {
    privateNotes: [],
    loading: false,
    uploading: false,
    error: null,
    uploadNote: vi.fn(),
    deleteNote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default redux state values (connectId: "c-123", status: "active")
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectConnectId") return "c-123";
      return "active"; // selectConnectStatus returns active by default
    });
    useNotes.mockReturnValue(baseHookValues);
    groupNotesByDay.mockReturnValue([]);
  });

  it("should render the loading skeletons component when loading flag is true", () => {
    useNotes.mockReturnValue({
      ...baseHookValues,
      loading: true,
    });

    render(<PrivateFilesSection />);

    expect(screen.getByTestId("mock-loading-skeletons")).toBeInTheDocument();
    expect(NotesLoadingSkeletons).toHaveBeenCalledWith(
      { gridClassName: "grid grid-cols-2 gap-4 w-full" },
      undefined,
    );
  });

  it("should display empty view message and '0 files' text when notes list is absent or empty", () => {
    render(<PrivateFilesSection />);

    expect(screen.getByText("No private files yet")).toBeInTheDocument();
    expect(
      screen.getByText("0 files — only visible to you"),
    ).toBeInTheDocument();

    // Top-right and center action buttons should be visible during active connect status
    expect(screen.getAllByRole("button", { name: /Upload/i })).toHaveLength(2);
  });

  it("should adjust header text pluralization when privateNotes list contains exactly 1 item", () => {
    const singleMockNote = [{ _id: "note-1", title: "Solo File Log" }];
    useNotes.mockReturnValue({
      ...baseHookValues,
      privateNotes: singleMockNote,
    });
    groupNotesByDay.mockReturnValue([
      { type: "card", key: "note-1", note: singleMockNote[0] },
    ]);

    render(<PrivateFilesSection />);

    expect(
      screen.getByText("1 file — only visible to you"),
    ).toBeInTheDocument();
  });

  it("should conceal all uploading actions buttons when connection selector status returns completed", () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === "selectConnectId") return "c-123";
      return "completed";
    });

    render(<PrivateFilesSection />);

    expect(screen.getByText("No private files yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Upload/i }),
    ).not.toBeInTheDocument();
  });

  it("should display the network exception layout block if error string is fed by custom hook", () => {
    useNotes.mockReturnValue({
      ...baseHookValues,
      error: "Authorization fallback exception error token.",
      uploading: false,
    });

    render(<PrivateFilesSection />);

    expect(
      screen.getByText("Authorization fallback exception error token."),
    ).toBeInTheDocument();
  });

  it("should suppress error display block if a document upload operation is ongoing concurrently", () => {
    useNotes.mockReturnValue({
      ...baseHookValues,
      error: "Suppressed error text message.",
      uploading: true, // Should satisfy error && !uploading conditional check boundary bypass
    });

    render(<PrivateFilesSection />);

    expect(
      screen.queryByText("Suppressed error text message."),
    ).not.toBeInTheDocument();
  });

  it("should map list arrays correctly, tracking separator and document card component branches separately", () => {
    const mockNotesData = [
      { _id: "note-101", title: "Architecture Manual" },
      { _id: "note-102", title: "Environment Configs" },
    ];
    useNotes.mockReturnValue({
      ...baseHookValues,
      privateNotes: mockNotesData,
    });

    const mockGroupedStructure = [
      { type: "separator", key: "sep-1", dateStr: "July 13, 2026" },
      { type: "card", key: "card-1", note: mockNotesData[0] },
      { type: "card", key: "card-2", note: mockNotesData[1] },
    ];
    groupNotesByDay.mockReturnValue(mockGroupedStructure);

    render(<PrivateFilesSection />);

    expect(screen.getByTestId("mock-separator")).toBeInTheDocument();
    expect(NoteDateSeparator).toHaveBeenCalledWith(
      { dateStr: "July 13, 2026" },
      undefined,
    );

    expect(screen.getByTestId("file-card-note-101")).toBeInTheDocument();
    expect(screen.getByText("Architecture Manual")).toBeInTheDocument();
    expect(screen.getByTestId("file-card-note-102")).toBeInTheDocument();
    expect(screen.getByText("Environment Configs")).toBeInTheDocument();
  });

  it("should coordinate upload overlay views, triggering uploadNote hook calls upon form confirmation", async () => {
    const user = userEvent.setup();
    const mockUploadNote = vi.fn();
    useNotes.mockReturnValue({
      ...baseHookValues,
      uploadNote: mockUploadNote,
    });

    render(<PrivateFilesSection />);

    // Trigger upload modal view deployment click loop
    const openUploadBtn = screen.getAllByRole("button", { name: /Upload/i })[0];
    await user.click(openUploadBtn);
    expect(screen.getByTestId("mock-upload-modal")).toBeInTheDocument();

    // Confirm file addition to execute the wrapper callback closure logic path
    const submitUploadBtn = screen.getByRole("button", {
      name: "Confirm Upload",
    });
    await user.click(submitUploadBtn);
    expect(mockUploadNote).toHaveBeenCalledWith(
      "mockFileObject",
      "Custom Document Title",
      true,
    );

    // Close the overlay modal safely
    const closeModalBtn = screen.getByRole("button", { name: "Close Modal" });
    await user.click(closeModalBtn);
    expect(screen.queryByTestId("mock-upload-modal")).not.toBeInTheDocument();
  });

  it("should cascade target card ID elements into deleteNote hooks when card components call onDelete handlers", async () => {
    const user = userEvent.setup();
    const mockDeleteNote = vi.fn();
    const activeNoteList = [
      { _id: "note-kill-id", title: "Temporary Diary Notes Log" },
    ];

    useNotes.mockReturnValue({
      ...baseHookValues,
      privateNotes: activeNoteList,
      deleteNote: mockDeleteNote,
    });
    groupNotesByDay.mockReturnValue([
      { type: "card", key: "card-kill", note: activeNoteList[0] },
    ]);

    render(<PrivateFilesSection />);

    const cardDeleteBtn = screen.getByRole("button", { name: "Delete File" });
    await user.click(cardDeleteBtn);

    expect(mockDeleteNote).toHaveBeenCalledTimes(1);
    expect(mockDeleteNote).toHaveBeenCalledWith("note-kill-id", true);
  });
});
