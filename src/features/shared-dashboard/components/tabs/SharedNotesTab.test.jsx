import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import SharedNotesTab from "./SharedNotesTab";
import useNotes from "@features/notes/hooks/useNotes";
import {
  downloadNoteFile,
  groupNotesByDay,
} from "@features/shared-dashboard/components/tabs/notesTabShared";
import { validateDocumentFile } from "@lib/validation/schemas";

// ── Shared Mutable Context State References ─────────────
let mockConnectId = "conn_123";
let mockConnectStatus = "active";
let mockUserId = "user_me";

let mockNotesState = {
  notes: [],
  loading: false,
  uploading: false,
  error: null,
  uploadNote: vi.fn(),
  deleteNote: vi.fn(),
};

// ── Mock Framework Hooks & Redux Selectors ───────────────
vi.mock("react-redux", () => ({
  useSelector: vi.fn((selectorFn) => {
    // Intercept state checks to dynamically inject values
    const state = { auth: { user: { id: mockUserId } } };
    if (selectorFn.name === "selectConnectId") return mockConnectId;
    if (selectorFn.name === "selectConnectStatus") return mockConnectStatus;
    return selectorFn(state);
  }),
}));

vi.mock("@features/notes/hooks/useNotes", () => ({
  default: vi.fn(() => mockNotesState),
}));

vi.mock("@features/shared-dashboard/components/tabs/PrivateNotesTab", () => ({
  default: vi.fn(() => (
    <div data-testid="private-notes-view">Private Workspace</div>
  )),
}));

vi.mock("@lib/validation/schemas", () => ({
  validateDocumentFile: vi.fn(() => ({ valid: true, error: "" })),
}));

vi.mock("@lib/formatters/dateTime", () => ({
  formatDateString: vi.fn(() => "Jan 1, 2026"),
}));

vi.mock("@features/notes/utils/notesHelpers", () => ({
  formatFileSize: vi.fn(() => "1.2 MB"),
  FILE_TYPE_CONFIG: {
    pdf: { icon: "pdf-icon", color: "blue" },
    other: { icon: "other-icon", color: "gray" },
  },
}));

vi.mock("@features/shared-dashboard/components/tabs/notesTabShared", () => ({
  groupNotesByDay: vi.fn((notes) =>
    notes.map((n) => ({ type: "note", key: n._id, note: n })),
  ),
  downloadNoteFile: vi.fn(),
  NoteDateSeparator: vi.fn(({ dateStr }) => (
    <div data-testid="date-separator">{dateStr}</div>
  )),
  FileTypeBadge: vi.fn(() => <div data-testid="file-type-badge" />),
  NotesLoadingSkeletons: vi.fn(() => <div data-testid="loading-skeletons" />),
}));

describe("SharedNotesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectId = "conn_123";
    mockConnectStatus = "active";
    mockUserId = "user_me";

    mockNotesState = {
      notes: [],
      loading: false,
      uploading: false,
      error: null,
      uploadNote: vi.fn().mockResolvedValue({ success: true }),
      deleteNote: vi.fn().mockResolvedValue({ success: true }),
    };

    vi.mocked(useNotes).mockReturnValue(mockNotesState);
    vi.mocked(groupNotesByDay).mockImplementation((notes) =>
      notes.map((n) => ({ type: "note", key: n._id, note: n })),
    );
  });

  // ── Main Shell Tabs Routing & Guard Branches ─────────────
  it("should render an active loading spinner when connectId context property is missing", () => {
    mockConnectId = null;
    const { container } = render(<SharedNotesTab />);

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render layout header details and support switching active workspaces to private mode", () => {
    render(<SharedNotesTab />);

    expect(screen.getByText("Notes & Files")).toBeInTheDocument();

    const privateTabBtn = screen.getByRole("button", { name: /Private/i });
    fireEvent.click(privateTabBtn);

    expect(screen.getByTestId("private-notes-view")).toBeInTheDocument();
    expect(screen.queryByText("Shared Files")).not.toBeInTheDocument();
  });

  // ── SharedFilesSection State Conditions ──────────────────
  it("should display a skeleton layout component grid while hooks return active loading statuses", () => {
    mockNotesState.loading = true;
    render(<SharedNotesTab />);

    expect(screen.getByTestId("loading-skeletons")).toBeInTheDocument();
  });

  it("should show specialized empty state view containing primary action buttons if notes list is clear", () => {
    render(<SharedNotesTab />);

    expect(screen.getByText("No shared files yet")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Upload First File/i }),
    ).toBeInTheDocument();
  });

  it("should suppress file adjustment control actions and upload buttons if connection state evaluates to completed", () => {
    mockConnectStatus = "completed";
    render(<SharedNotesTab />);

    expect(
      screen.queryByRole("button", { name: /Upload First File/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Upload File/i }),
    ).not.toBeInTheDocument();
  });

  it("should render server error notice messages as an inline alert component row when populated", () => {
    mockNotesState.error =
      "File repository synchronized access denied by authorization grid.";
    render(<SharedNotesTab />);

    expect(
      screen.getByText(
        "File repository synchronized access denied by authorization grid.",
      ),
    ).toBeInTheDocument();
  });

  // ── NoteCard Rendering Variances & Interceptions ──────────
  it("should format NoteCard templates identifying current owner ownership parameters accurately", () => {
    mockNotesState.notes = [
      {
        _id: "n1",
        title: "Custom Title",
        fileName: "test.pdf",
        fileType: "pdf",
        fileSize: 1024,
        createdAt: "2026-07-13",
        uploadedBy: "user_me",
      },
    ];

    render(<SharedNotesTab />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("test.pdf")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it("should map non-matching parameters onto default values identifying external partner ownership attributes", () => {
    mockNotesState.notes = [
      {
        _id: "n2",
        title: "",
        fileName: "partner_doc.docx",
        fileType: "doc",
        fileSize: 2048,
        createdAt: "2026-07-13",
        uploadedBy: { _id: "user_partner", name: "Alex Partner" },
      },
    ];

    render(<SharedNotesTab />);

    expect(screen.getByText("partner_doc.docx")).toBeInTheDocument();
    expect(screen.getByText("Alex Partner")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/i }),
    ).not.toBeInTheDocument();
  });

  it("should trigger download note handlers when corresponding button elements capture clicks", () => {
    const targetNote = { _id: "n1", fileName: "dl.pdf", uploadedBy: "user_me" };
    mockNotesState.notes = [targetNote];

    render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Download/i }));

    expect(downloadNoteFile).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "n1" }),
      "shared note",
    );
  });

  it("should invoke structural deletion hooks only when confirmation prompts pass verification checks", async () => {
    mockNotesState.notes = [
      { _id: "n1", fileName: "del.pdf", uploadedBy: "user_me" },
    ];
    render(<SharedNotesTab />);

    const confirmSpy = vi
      .spyOn(globalThis, "confirm")
      .mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    expect(mockNotesState.deleteNote).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    });
    expect(mockNotesState.deleteNote).toHaveBeenCalledWith("n1", false);
  });

  it("should process custom inline list separators safely if provided by grouper helper schemas", () => {
    mockNotesState.notes = [{ _id: "n1", fileName: "file.pdf" }];
    vi.mocked(groupNotesByDay).mockReturnValueOnce([
      { type: "separator", key: "sep_1", dateStr: "Today" },
      { type: "note", key: "n1", note: { _id: "n1", fileName: "file.pdf" } },
    ]);

    render(<SharedNotesTab />);
    expect(screen.getByTestId("date-separator")).toBeInTheDocument();
  });

  // ── UploadModal Operations & Validation Branches ──────────
  it("should display upload form overlays and catch file formatting validation rejections", () => {
    const { container } = render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    expect(screen.getByText("Upload Shared File")).toBeInTheDocument();

    vi.mocked(validateDocumentFile).mockReturnValueOnce({
      valid: false,
      error: "File format unsupported.",
    });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: { files: [new File([""], "bad.exe")] },
    });
    expect(screen.getByText("File format unsupported.")).toBeInTheDocument();
  });

  it("should automatically extract base title suggestions when valid file attachments register", () => {
    const { container } = render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File([""], "Session_Overview.pdf")] },
    });

    expect(screen.getByDisplayValue("Session_Overview")).toBeInTheDocument();

    // Fixed: Disambiguate multiple "Upload File" buttons by fetching all and checking the inner modal footer button layout status
    const uploadButtons = screen.getAllByRole("button", {
      name: /Upload File/i,
    });
    expect(uploadButtons[1]).not.toBeDisabled();
  });

  it("should support resetting current attachments cleanly when selecting alternative target nodes", () => {
    const { container } = render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File([""], "temp.pdf")] },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Choose different file/i }),
    );
    expect(screen.getByText(/Drop file here/i)).toBeInTheDocument();
  });

  it("should execute background thunk submission streams and close windows cleanly on successes", async () => {
    const { container } = render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File([""], "upload.pdf")] },
    });

    const titleInput = screen.getByPlaceholderText("e.g. Week 2 Summary");
    fireEvent.change(titleInput, { target: { value: "Final Version Notes" } });

    await act(async () => {
      // Fixed: Target the dedicated submit modal button explicitly to bypass unique match exception crashes
      const modalSubmitBtn = screen.getAllByRole("button", {
        name: "Upload File",
      })[1];
      fireEvent.click(modalSubmitBtn);
    });

    expect(mockNotesState.uploadNote).toHaveBeenCalledWith(
      expect.any(File),
      "Final Version Notes",
      false,
    );
    expect(screen.queryByText("Upload Shared File")).not.toBeInTheDocument();
  });

  it("should adapt stylistic elements during active drag over workspace interaction branches", () => {
    render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    const dropZoneLabel = screen.getByText(/Drop file here/i).closest("label");

    fireEvent.dragOver(dropZoneLabel);
    expect(dropZoneLabel.className).toContain("border-blue-400");

    fireEvent.dragLeave(dropZoneLabel);
    expect(dropZoneLabel.className).not.toContain("border-blue-400");

    fireEvent.drop(dropZoneLabel, {
      dataTransfer: { files: [new File([""], "drop.pdf")] },
    });
    expect(screen.getByText("drop.pdf")).toBeInTheDocument();
  });

  it("should transition overlay element details showing loader icons when uploading value matches true", () => {
    mockNotesState.uploading = true;
    const { container } = render(<SharedNotesTab />);
    fireEvent.click(screen.getByRole("button", { name: /Upload File/i }));

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File([""], "loading.pdf")] },
    });

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByText(/Uploading.../i)).toBeInTheDocument();
  });
});
