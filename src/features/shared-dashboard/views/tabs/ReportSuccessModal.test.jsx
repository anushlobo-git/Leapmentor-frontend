// src/features/shared-dashboard/components/tabs/ReportSuccessModal.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ReportSuccessModal from "./ReportSuccessModal.jsx";

describe("ReportSuccessModal", () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    render(<ReportSuccessModal onBack={onBack} />);
  });

  it("renders modal content", () => {
    expect(screen.getByText(/Report Submitted/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Session/i })).toBeInTheDocument();
  });

  it("calls onBack when Back button is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /Back to Session/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
