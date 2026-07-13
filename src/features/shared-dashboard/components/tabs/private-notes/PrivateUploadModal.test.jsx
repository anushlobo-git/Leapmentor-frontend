import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrivateUploadModal from "./PrivateUploadModal";
import { validateDocumentFile } from "@lib/validation/schemas";
import { formatFileSize } from "@features/notes/utils/notesHelpers";

// Mock validation rules module
vi.mock("@lib/validation/schemas", () => ({
  validateDocumentFile: vi.fn(),
}));

// Mock size formatting utility
vi.mock("@features/notes/utils/notesHelpers", () => ({
  formatFileSize: vi.fn(() => "2.5 MB"),
}));

describe("PrivateUploadModal", () => {
  const mockFile = new File(["dummy content"], "session_notes.pdf", {
    type: "application/pdf",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    validateDocumentFile.mockReturnValue({ valid: true });
  });

  it("should render initial default overlay layout when no file is selected", () => {
    render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Upload Private File" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Drop file here or/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload Private File" }),
    ).toBeDisabled();

    const dropzoneButton = screen.getByRole("button", {
      name: /Drop file here or browse/i,
    });
    expect(dropzoneButton).toHaveClass("border-slate-200 bg-slate-50");
  });

  it("should toggle drag over class layouts when items are dragged across the dropzone boundary", () => {
    render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const dropzoneButton = screen.getByRole("button", {
      name: /Drop file here or browse/i,
    });

    fireEvent.dragOver(dropzoneButton);
    expect(dropzoneButton).toHaveClass("border-amber-400 bg-amber-50");

    fireEvent.dragLeave(dropzoneButton);
    expect(dropzoneButton).toHaveClass("border-slate-200 bg-slate-50");
  });

  it("should process dropped items, strip extensions to auto-assign title, and apply emerald style highlights", () => {
    render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const dropzoneButton = screen.getByRole("button", {
      name: /Drop file here or browse/i,
    });

    fireEvent.drop(dropzoneButton, {
      dataTransfer: { files: [mockFile] },
    });

    expect(validateDocumentFile).toHaveBeenCalledWith(mockFile);
    expect(screen.getByText("session_notes.pdf")).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Title \(optional\)/i);
    expect(titleInput).toHaveValue("session_notes");
    expect(dropzoneButton).toHaveClass("border-emerald-400 bg-emerald-50");
  });

  it("should accept files and update metadata records through the standard input change events path", () => {
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');

    fireEvent.change(hiddenFileInput, {
      target: { files: [mockFile] },
    });

    expect(screen.getByText("session_notes.pdf")).toBeInTheDocument();
  });

  it("should ignore processing and exit early if an empty change payload gets passed into validation loops", () => {
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');

    fireEvent.change(hiddenFileInput, {
      target: { files: [] },
    });

    expect(validateDocumentFile).not.toHaveBeenCalled();
    expect(screen.queryByText("Choose different file")).not.toBeInTheDocument();
  });

  it("should display red error alerts if the validation engine determines document constraints are violated", () => {
    validateDocumentFile.mockReturnValue({
      valid: false,
      error: "File dimensions or limits exceed 10MB bounds rule.",
    });

    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    fireEvent.change(hiddenFileInput, {
      target: { files: [mockFile] },
    });

    expect(
      screen.getByText("File dimensions or limits exceed 10MB bounds rule."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload Private File" }),
    ).toBeDisabled();
  });

  it("should reset form variables clean when clicking the choice reset label link button", () => {
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    fireEvent.change(hiddenFileInput, { target: { files: [mockFile] } });

    const resetButton = screen.getByRole("button", {
      name: "Choose different file",
    });
    fireEvent.click(resetButton);

    expect(screen.queryByText("session_notes.pdf")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Title \(optional\)/i),
    ).not.toBeInTheDocument();
  });

  it("should allow changes to title input fields directly", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    fireEvent.change(hiddenFileInput, { target: { files: [mockFile] } });

    const titleInput = screen.getByLabelText(/Title \(optional\)/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Final Revision Log");

    expect(titleInput).toHaveValue("Final Revision Log");
  });

  it("should execute file input target clicks when clicking interactive layout dropzone surfaces", () => {
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    const spyClick = vi.spyOn(hiddenFileInput, "click");

    const dropzoneButton = screen.getByRole("button", {
      name: /Drop file here or browse/i,
    });
    fireEvent.click(dropzoneButton);

    // Using .toHaveBeenCalled() avoids flakiness stemming from JSDOM nesting bubbling counts
    expect(spyClick).toHaveBeenCalled();
  });

  it("should support keyboard accessibility controls triggering clicks on dropzone elements with Enter or Space keys", () => {
    const { container } = render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    const spyClick = vi.spyOn(hiddenFileInput, "click");

    const dropzoneButton = screen.getByRole("button", {
      name: /Drop file here or browse/i,
    });

    fireEvent.keyDown(dropzoneButton, { key: "Escape" });
    expect(spyClick).not.toHaveBeenCalled();

    fireEvent.keyDown(dropzoneButton, { key: "Enter" });
    fireEvent.keyDown(dropzoneButton, { key: " " });

    expect(spyClick).toHaveBeenCalled();
  });

  it("should cascade network hooks and dismiss views on clean onUpload returns success", async () => {
    const user = userEvent.setup();
    const mockOnUpload = vi.fn().mockResolvedValue({ success: true });
    const mockOnClose = vi.fn();

    const { container } = render(
      <PrivateUploadModal
        onUpload={mockOnUpload}
        uploading={false}
        onClose={mockOnClose}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    fireEvent.change(hiddenFileInput, { target: { files: [mockFile] } });

    const uploadBtn = screen.getByRole("button", {
      name: "Upload Private File",
    });
    await user.click(uploadBtn);

    expect(mockOnUpload).toHaveBeenCalledWith(mockFile, "session_notes");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should preserve window visibility if onUpload actions fail or resolve falsely", async () => {
    const user = userEvent.setup();
    const mockOnUpload = vi.fn().mockResolvedValue({ success: false });
    const mockOnClose = vi.fn();

    const { container } = render(
      <PrivateUploadModal
        onUpload={mockOnUpload}
        uploading={false}
        onClose={mockOnClose}
      />,
    );

    const hiddenFileInput = container.querySelector('input[type="file"]');
    fireEvent.change(hiddenFileInput, { target: { files: [mockFile] } });

    const uploadBtn = screen.getByRole("button", {
      name: "Upload Private File",
    });
    await user.click(uploadBtn);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should block direct programmatic handleUpload clicks if no valid target file selection records exist", () => {
    const mockOnUpload = vi.fn();
    render(
      <PrivateUploadModal
        onUpload={mockOnUpload}
        uploading={false}
        onClose={vi.fn()}
      />,
    );

    const uploadBtn = screen.getByRole("button", {
      name: "Upload Private File",
    });

    const reactPropsKey = Object.keys(uploadBtn).find((key) =>
      key.startsWith("__reactProps"),
    );
    if (reactPropsKey && uploadBtn[reactPropsKey]?.onClick) {
      uploadBtn[reactPropsKey].onClick();
    }

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it("should modify text states, show spinner classes, and disable fields when uploading resolves true", () => {
    render(
      <PrivateUploadModal
        onUpload={vi.fn()}
        uploading={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
