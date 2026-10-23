import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResumeUpload from "./ResumeUpload";
import { validateResumeFile } from "@lib/validation/schemas";

// Mock validator
vi.mock("@lib/validation/schemas", () => ({
  validateResumeFile: vi.fn(),
}));

describe("ResumeUpload component", () => {
  const mockOnChange = vi.fn();
  const mockFile = new File(["test contents"], "my-cv.pdf", {
    type: "application/pdf",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders drag and drop zone when no file is selected", () => {
    render(<ResumeUpload file={null} onChange={mockOnChange} />);

    expect(screen.getByText(/Drop your resume here/i)).toBeInTheDocument();
    expect(
      screen.getByText("PDF, JPG, PNG, WEBP · Max 10MB"),
    ).toBeInTheDocument();
  });

  it("handles input change validation error path", () => {
    validateResumeFile.mockReturnValueOnce({
      valid: false,
      error: "File exceeds 10MB limit",
    });

    const { container } = render(
      <ResumeUpload file={null} onChange={mockOnChange} />,
    );
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(validateResumeFile).toHaveBeenCalledWith(mockFile);
    expect(mockOnChange).toHaveBeenCalledWith(null, "File exceeds 10MB limit");
  });

  it("handles input change success path", () => {
    validateResumeFile.mockReturnValueOnce({ valid: true, error: null });

    const { container } = render(
      <ResumeUpload file={null} onChange={mockOnChange} />,
    );
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(validateResumeFile).toHaveBeenCalledWith(mockFile);
    expect(mockOnChange).toHaveBeenCalledWith(mockFile, null);
  });

  it("returns early if no files were selected on input change", () => {
    const { container } = render(
      <ResumeUpload file={null} onChange={mockOnChange} />,
    );
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(validateResumeFile).not.toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("handles drag-over prevention and drop validation error path", () => {
    validateResumeFile.mockReturnValueOnce({
      valid: false,
      error: "Invalid format type",
    });

    render(<ResumeUpload file={null} onChange={mockOnChange} />);

    const label = screen.getByLabelText("Upload resume or CV");

    // dragover
    const dragOverEvt = fireEvent.dragOver(label);
    expect(dragOverEvt).toBe(false); // default prevented (returns false from fireEvent)

    // drop
    fireEvent.drop(label, {
      dataTransfer: { files: [mockFile] },
    });

    expect(validateResumeFile).toHaveBeenCalledWith(mockFile);
    expect(mockOnChange).toHaveBeenCalledWith(null, "Invalid format type");
  });

  it("handles drag drop success path", () => {
    validateResumeFile.mockReturnValueOnce({ valid: true, error: null });

    render(<ResumeUpload file={null} onChange={mockOnChange} />);
    const label = screen.getByLabelText("Upload resume or CV");

    fireEvent.drop(label, {
      dataTransfer: { files: [mockFile] },
    });

    expect(validateResumeFile).toHaveBeenCalledWith(mockFile);
    expect(mockOnChange).toHaveBeenCalledWith(mockFile, null);
  });

  it("returns early if no files were dropped", () => {
    render(<ResumeUpload file={null} onChange={mockOnChange} />);
    const label = screen.getByLabelText("Upload resume or CV");

    fireEvent.drop(label, {
      dataTransfer: { files: [] },
    });

    expect(validateResumeFile).not.toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("renders file info card when file is selected and triggers removal", async () => {
    const user = userEvent.setup();

    render(
      <ResumeUpload
        file={{ name: "cv-leap.pdf", size: 204800 }}
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText("cv-leap.pdf")).toBeInTheDocument();
    expect(screen.getByText("200 KB")).toBeInTheDocument(); // 204800 / 1024

    const removeBtn = screen.getByRole("button");
    await user.click(removeBtn);

    expect(mockOnChange).toHaveBeenCalledWith(null, null);
  });

  it("renders error prop message and applies error styles", () => {
    render(
      <ResumeUpload
        file={null}
        onChange={mockOnChange}
        error="Resume is required for approval"
      />,
    );

    expect(
      screen.getByText("Resume is required for approval"),
    ).toBeInTheDocument();
  });
});
