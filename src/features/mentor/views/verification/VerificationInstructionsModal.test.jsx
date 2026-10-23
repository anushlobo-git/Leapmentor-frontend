import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerificationInstructionsModal from "./VerificationInstructionsModal";

describe("VerificationInstructionsModal component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates through steps using Next and Back buttons", async () => {
    const user = userEvent.setup();
    render(<VerificationInstructionsModal onClose={mockOnClose} />);

    // Step 1 check
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Phone & Resume")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: "← Back" });
    expect(backBtn).toBeDisabled();

    const nextBtn = screen.getByRole("button", { name: "Next →" });
    await user.click(nextBtn);

    // Step 2 check
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByText("Supporting Documents")).toBeInTheDocument();
    expect(backBtn).not.toBeDisabled();

    // Click back
    await user.click(backBtn);
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("reaches last step and shows extra banner and calls onClose upon clicking finish", async () => {
    const user = userEvent.setup();
    render(<VerificationInstructionsModal onClose={mockOnClose} />);

    const nextBtn = screen.getByRole("button", { name: "Next →" });

    // Move to step 4
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);

    expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
    expect(screen.getByText("You're Verified!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your documents are stored securely and will never be shared with mentees.",
      ),
    ).toBeInTheDocument();

    const finishBtn = screen.getByRole("button", {
      name: "Got it, let's go →",
    });
    await user.click(finishBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking backdrop, close icon, or Skip button", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <VerificationInstructionsModal onClose={mockOnClose} />,
    );

    // 1. Click backdrop
    const backdrop = screen.getByLabelText(
      "Close verification guidance backdrop",
    );
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // 2. Click close cross icon
    rerender(<VerificationInstructionsModal onClose={mockOnClose} />);
    const closeCross = screen.getAllByRole("button")[1]; // first is backdrop, second is close icon
    await user.click(closeCross);
    expect(mockOnClose).toHaveBeenCalledTimes(2);

    // 3. Click Skip
    rerender(<VerificationInstructionsModal onClose={mockOnClose} />);
    const skipBtn = screen.getByRole("button", { name: /Skip/i });
    await user.click(skipBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });
});
