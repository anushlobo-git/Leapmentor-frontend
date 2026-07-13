import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkExperienceUpload from "./WorkExperienceUpload";
import { validateWorkExperienceFiles } from "@lib/validation/schemas";

// Mock validator
vi.mock("@lib/validation/schemas", () => ({
  validateWorkExperienceFiles: vi.fn(),
}));

describe("WorkExperienceUpload component", () => {
  const mockOnChange = vi.fn();
  const mockFiles = [
    new File(["file1"], "offer.pdf", { type: "application/pdf" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders drag and drop zone when file list is below limit", () => {
    render(<WorkExperienceUpload files={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/Drop files here/i)).toBeInTheDocument();
    expect(
      screen.getByText("PDF, JPG, PNG, WEBP · Max 10MB each · 0/3 uploaded"),
    ).toBeInTheDocument();
  });

  it("handles input change validation error path", () => {
    validateWorkExperienceFiles.mockReturnValueOnce({
      valid: false,
      error: "Limit of 3 files exceeded",
    });

    const { container } = render(
      <WorkExperienceUpload files={[]} onChange={mockOnChange} />,
    );
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: mockFiles } });

    expect(validateWorkExperienceFiles).toHaveBeenCalledWith(mockFiles, 3);
    expect(mockOnChange).toHaveBeenCalledWith([], "Limit of 3 files exceeded");
  });

  it("handles input change success path", () => {
    validateWorkExperienceFiles.mockReturnValueOnce({
      valid: true,
      error: null,
    });

    const { container } = render(
      <WorkExperienceUpload files={[]} onChange={mockOnChange} />,
    );
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, { target: { files: mockFiles } });

    expect(validateWorkExperienceFiles).toHaveBeenCalledWith(mockFiles, 3);
    expect(mockOnChange).toHaveBeenCalledWith(mockFiles, null);
    expect(fileInput.value).toBe(""); // cleared
  });

  it("handles drag drop validation error path", () => {
    validateWorkExperienceFiles.mockReturnValueOnce({
      valid: false,
      error: "Invalid format upload",
    });

    const { container } = render(
      <WorkExperienceUpload files={[]} onChange={mockOnChange} />,
    );
    const label = container.querySelector("label");

    // dragover
    const dragOverEvt = fireEvent.dragOver(label);
    expect(dragOverEvt).toBe(false); // default prevented

    // drop
    fireEvent.drop(label, {
      dataTransfer: { files: mockFiles },
    });

    expect(validateWorkExperienceFiles).toHaveBeenCalledWith(mockFiles, 3);
    expect(mockOnChange).toHaveBeenCalledWith([], "Invalid format upload");
  });

  it("handles drag drop success path", () => {
    validateWorkExperienceFiles.mockReturnValueOnce({
      valid: true,
      error: null,
    });

    const { container } = render(
      <WorkExperienceUpload files={[]} onChange={mockOnChange} />,
    );
    const label = container.querySelector("label");

    fireEvent.drop(label, {
      dataTransfer: { files: mockFiles },
    });

    expect(validateWorkExperienceFiles).toHaveBeenCalledWith(mockFiles, 3);
    expect(mockOnChange).toHaveBeenCalledWith(mockFiles, null);
  });

  it("renders list of files and triggers removal by index", async () => {
    const user = userEvent.setup();
    const activeFiles = [
      { name: "pay.pdf", size: 102400 },
      { name: "exp.png", size: 51200 },
    ];

    render(
      <WorkExperienceUpload files={activeFiles} onChange={mockOnChange} />,
    );

    expect(screen.getByText("pay.pdf")).toBeInTheDocument();
    expect(screen.getByText("100 KB")).toBeInTheDocument();

    expect(screen.getByText("exp.png")).toBeInTheDocument();
    expect(screen.getByText("50 KB")).toBeInTheDocument();

    const removeBtns = screen.getAllByRole("button");
    expect(removeBtns).toHaveLength(2);

    await user.click(removeBtns[1]); // remove exp.png

    expect(mockOnChange).toHaveBeenCalledWith(
      [{ name: "pay.pdf", size: 102400 }],
      null,
    );
  });

  it("hides drop zone when max files limit (3) is reached", () => {
    const fullFiles = [
      { name: "f1.pdf", size: 100 },
      { name: "f2.pdf", size: 100 },
      { name: "f3.pdf", size: 100 },
    ];

    const { container } = render(
      <WorkExperienceUpload files={fullFiles} onChange={mockOnChange} />,
    );

    expect(container.querySelector("label")).toBeNull();
  });

  it("renders error prop message and applies error styles", () => {
    render(
      <WorkExperienceUpload
        files={[]}
        onChange={mockOnChange}
        error="Please upload experience document proof"
      />,
    );

    expect(
      screen.getByText("Please upload experience document proof"),
    ).toBeInTheDocument();
  });
});
