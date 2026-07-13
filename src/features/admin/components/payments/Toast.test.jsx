import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "./Toast";

// Mocking external constant dependency to isolate component evaluation
vi.mock("@features/admin/constants/payments.constants", () => ({
  FONT: "MockFontFamily",
}));

describe("Toast", () => {
  it("should return null and render nothing when the toast prop is falsy", () => {
    const { container } = render(<Toast toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render success style configuration when toast type is 'success'", () => {
    const mockToast = {
      type: "success",
      msg: "Operation completed successfully!",
    };

    render(<Toast toast={mockToast} />);

    const toastElement = screen.getByText("Operation completed successfully!");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveStyle({
      fontFamily: "MockFontFamily",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#15803d",
    });
  });

  it("should render error style configuration when toast type is 'error' or any other non-success variation", () => {
    const mockToast = {
      type: "error",
      msg: "An unexpected error occurred.",
    };

    render(<Toast toast={mockToast} />);

    const toastElement = screen.getByText("An unexpected error occurred.");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveStyle({
      fontFamily: "MockFontFamily",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
    });
  });
});
