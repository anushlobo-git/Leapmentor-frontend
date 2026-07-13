import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EscrowSuccessModal from "./EscrowSuccessModal";

describe("EscrowSuccessModal", () => {
  const mockOnDone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders success details correctly", () => {
    render(
      <EscrowSuccessModal
        totalAmount={220}
        mentorName="John Doe"
        onDone={mockOnDone}
      />,
    );

    expect(screen.getByText("220 tokens locked in escrow")).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("triggers onDone on backdrop, close, and Done button click", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <EscrowSuccessModal
        totalAmount={220}
        mentorName="John Doe"
        onDone={mockOnDone}
      />,
    );

    // Click backdrop
    const backdrop = screen.getByRole("button", { name: "Close" });
    await user.click(backdrop);
    expect(mockOnDone).toHaveBeenCalledTimes(1);

    // Click close icon button (the w-7 h-7 button in the header)
    const closeBtn = container.querySelector("button.w-7.h-7");
    await user.click(closeBtn);
    expect(mockOnDone).toHaveBeenCalledTimes(2);

    // Click Done button
    const doneBtn = screen.getByRole("button", { name: "Done" });
    await user.click(doneBtn);
    expect(mockOnDone).toHaveBeenCalledTimes(3);
  });
});
