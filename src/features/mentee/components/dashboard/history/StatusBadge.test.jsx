import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders status badge correctly with pending status", () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText("pending");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("capitalize");
  });

  it("renders status badge correctly with completed status", () => {
    render(<StatusBadge status="completed" />);
    const badge = screen.getByText("completed");
    expect(badge).toBeInTheDocument();
  });
});
