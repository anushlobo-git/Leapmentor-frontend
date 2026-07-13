import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Importing using the exact filename spelling matching the codebase disk reference
import ConnectSuccessModal from "./ConnectSucessModal";

describe("ConnectSuccessModal", () => {
  it("should render the mentor name when a valid string value is provided", () => {
    render(
      <ConnectSuccessModal mentorName="Jane Doe" onBackToDashboard={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", { name: /Request Sent!/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByText("the mentor")).not.toBeInTheDocument();
  });

  it("should render fallback text when mentorName prop evaluates to a falsy string or empty value", () => {
    render(<ConnectSuccessModal mentorName="" onBackToDashboard={vi.fn()} />);

    expect(screen.getByText("the mentor")).toBeInTheDocument();
  });

  it("should invoke onBackToDashboard callback when clicking the confirmation button", async () => {
    const user = userEvent.setup();
    const mockOnBackToDashboard = vi.fn();

    render(
      <ConnectSuccessModal
        mentorName="Jane Doe"
        onBackToDashboard={mockOnBackToDashboard}
      />,
    );

    const button = screen.getByRole("button", { name: /Back to Dashboard/i });
    await user.click(button);

    expect(mockOnBackToDashboard).toHaveBeenCalledTimes(1);
  });
});
