import { render, screen, fireEvent } from "@testing-library/react";
import RequestActionModal from "./RequestActionModal";

describe("RequestActionModal Component", () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for accepted type", () => {
    render(
      <RequestActionModal
        type="accepted"
        menteeName="John Doe"
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Request Accepted!")).toBeInTheDocument();
    expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/calendar invite has been sent/),
    ).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: "Back to Requests" });
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalled();
  });

  it("renders correctly for rejected type", () => {
    render(
      <RequestActionModal
        type="rejected"
        menteeName="John Doe"
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Request Rejected")).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(
      screen.queryByText(/calendar invite has been sent/),
    ).not.toBeInTheDocument();
  });
});
