import { render, screen, act, fireEvent } from "@testing-library/react";
import { uploadVerificationDocuments } from "@features/mentor/api/mentor.api";
import { useNavigate } from "react-router-dom";

// Mock API layer
vi.mock("@features/mentor/api/mentor.api", () => ({
  uploadVerificationDocuments: vi.fn(),
}));

// Mock router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock common loader
vi.mock("@components/common/FullScreenLoader", () => ({
  default: ({ message }) => (
    <div data-testid="fullscreen-loader">{message}</div>
  ),
}));

// Mock sub-components
vi.mock("@features/mentor/components/PhoneNumberField", () => ({
  default: ({ value, onChange, error }) => (
    <div>
      <input data-testid="phone-input" value={value} onChange={onChange} />
      {error && <span data-testid="phone-error">{error}</span>}
    </div>
  ),
}));

vi.mock("@features/mentor/components/ResumeUpload", () => ({
  default: ({ file, onChange, error }) => (
    <div>
      <button
        type="button"
        data-testid="resume-change-btn"
        onClick={() => onChange({ name: "cv.pdf" }, null)}
      >
        Set Resume
      </button>
      <button
        type="button"
        data-testid="resume-error-btn"
        onClick={() => onChange(null, "Resume upload error")}
      >
        Set Resume Error
      </button>
      {file && <span data-testid="resume-file-name">{file.name}</span>}
      {error && <span data-testid="resume-error">{error}</span>}
    </div>
  ),
}));

vi.mock("@features/mentor/components/WorkExperienceUpload", () => ({
  default: ({ files, onChange, error }) => (
    <div>
      <button
        type="button"
        data-testid="workexp-change-btn"
        onClick={() => onChange([{ name: "exp.pdf" }], null)}
      >
        Set Work Exp
      </button>
      <button
        type="button"
        data-testid="workexp-error-btn"
        onClick={() => onChange([], "Work exp error")}
      >
        Set Work Exp Error
      </button>
      {files.length > 0 && (
        <span data-testid="workexp-count">{files.length}</span>
      )}
      {error && <span data-testid="workexp-error">{error}</span>}
    </div>
  ),
}));

vi.mock("@features/mentor/components/VerificationInstructionsModal", () => ({
  default: ({ onClose }) => (
    <div data-testid="instructions-modal">
      <button type="button" data-testid="close-modal" onClick={onClose}>
        Close instructions
      </button>
    </div>
  ),
}));

describe("VerificationFormShell component", () => {
  let VerificationFormShell;

  beforeAll(async () => {
    import.meta.env.VITE_API_BASE_URL = "http://test-env-base";
    VerificationFormShell = (await import("./VerificationFormShell")).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("evaluates module fallback URL when VITE_API_BASE_URL is falsy", async () => {
    vi.resetModules();
    const oldUrl = import.meta.env.VITE_API_BASE_URL;
    delete import.meta.env.VITE_API_BASE_URL;
    const FalsyShell = (await import("./VerificationFormShell")).default;
    render(<FalsyShell />);
    expect(screen.getByText("Verify Your Profile")).toBeInTheDocument();
    import.meta.env.VITE_API_BASE_URL = oldUrl;
  });

  it("renders child fields and instructions modal initially", () => {
    render(<VerificationFormShell />);

    expect(screen.getByTestId("instructions-modal")).toBeInTheDocument();
    expect(screen.getByTestId("phone-input")).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByTestId("close-modal");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("instructions-modal")).not.toBeInTheDocument();
  });

  it("updates state on phone number, resume, and experience change triggers", () => {
    render(<VerificationFormShell />);

    // Type phone
    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+919876543210" } });
    expect(phoneInput.value).toBe("+919876543210");

    // Click resume button to change resume
    fireEvent.click(screen.getByTestId("resume-change-btn"));
    expect(screen.getByTestId("resume-file-name")).toHaveTextContent("cv.pdf");

    // Click resume error button to trigger error state
    fireEvent.click(screen.getByTestId("resume-error-btn"));
    expect(screen.getByTestId("resume-error")).toHaveTextContent(
      "Resume upload error",
    );

    // Click work exp button
    fireEvent.click(screen.getByTestId("workexp-change-btn"));
    expect(screen.getByTestId("workexp-count")).toHaveTextContent("1");

    // Click work exp error button
    fireEvent.click(screen.getByTestId("workexp-error-btn"));
    expect(screen.getByTestId("workexp-error")).toHaveTextContent(
      "Work exp error",
    );
  });

  it("fails client side validations if form fields are empty on submit", () => {
    render(<VerificationFormShell />);

    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });
    fireEvent.click(submitBtn);

    expect(screen.getByTestId("phone-error")).toHaveTextContent(
      "Phone number is required",
    );
    expect(screen.getByTestId("resume-error")).toHaveTextContent(
      "Resume is required",
    );
    expect(uploadVerificationDocuments).not.toHaveBeenCalled();
  });

  it("submits files and handles progress and successful navigation", async () => {
    vi.useFakeTimers();
    uploadVerificationDocuments.mockImplementation(
      async (formData, onProgress) => {
        if (onProgress) {
          onProgress({ loaded: 80, total: 100 });
        }
        return { success: true };
      },
    );

    render(<VerificationFormShell />);

    // Close instructions modal
    fireEvent.click(screen.getByTestId("close-modal"));

    // Enter details
    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+919876543210" } });
    fireEvent.click(screen.getByTestId("resume-change-btn"));
    fireEvent.click(screen.getByTestId("workexp-change-btn"));

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(uploadVerificationDocuments).toHaveBeenCalled();
    expect(screen.getByTestId("fullscreen-loader")).toBeInTheDocument();

    // Advance navigation timer
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
  });

  it("handles api submission failure and displays errors", async () => {
    uploadVerificationDocuments.mockRejectedValueOnce({
      response: { data: { message: "Internal upload limit reached" } },
    });

    render(<VerificationFormShell />);

    // Close instructions modal
    fireEvent.click(screen.getByTestId("close-modal"));

    // Enter details
    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+919876543210" } });
    fireEvent.click(screen.getByTestId("resume-change-btn"));

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(
      screen.getByText("Internal upload limit reached"),
    ).toBeInTheDocument();
  });

  it("handles api submission generic error fallback", async () => {
    uploadVerificationDocuments.mockRejectedValueOnce(new Error("Timeout"));

    render(<VerificationFormShell />);

    // Close instructions modal
    fireEvent.click(screen.getByTestId("close-modal"));

    // Enter details
    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+919876543210" } });
    fireEvent.click(screen.getByTestId("resume-change-btn"));

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(
      screen.getByText("Failed to submit documents. Please try again."),
    ).toBeInTheDocument();
  });

  it("clears phone error when user updates input field after failure", () => {
    render(<VerificationFormShell />);
    fireEvent.click(screen.getByTestId("close-modal"));

    // Submit empty to set validation errors
    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });
    fireEvent.click(submitBtn);
    expect(screen.getByTestId("phone-error")).toHaveTextContent(
      "Phone number is required",
    );

    // Change input
    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+12" } });
    expect(screen.queryByTestId("phone-error")).toBeNull();
  });

  it("submits files but handles progress callback when total is missing", async () => {
    uploadVerificationDocuments.mockImplementation(
      async (formData, onProgress) => {
        if (onProgress) {
          onProgress({ loaded: 50 }); // e.total is undefined
        }
        return { success: true };
      },
    );

    render(<VerificationFormShell />);
    fireEvent.click(screen.getByTestId("close-modal"));

    const phoneInput = screen.getByTestId("phone-input");
    fireEvent.change(phoneInput, { target: { value: "+919876543210" } });
    fireEvent.click(screen.getByTestId("resume-change-btn"));

    const submitBtn = screen.getByRole("button", {
      name: /Submit for Verification/i,
    });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(uploadVerificationDocuments).toHaveBeenCalled();
  });
});
