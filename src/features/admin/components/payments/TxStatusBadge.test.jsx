import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TxStatusBadge from "./TxStatusBadge";

// Mock the external payments constants to decouple the test from production constant values
vi.mock("@features/admin/constants/payments.constants", () => ({
  FONT: "Inter, sans-serif",
  STATUS_CONFIG: {
    success: {
      color: "#059669",
      dot: "#10b981",
      label: "Success",
    },
    failed: {
      color: "#dc2626",
      dot: "#ef4444",
      label: "Failed",
    },
  },
}));

describe("TxStatusBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the badge with the correct configuration when a known status is provided", () => {
    render(<TxStatusBadge status="success" />);

    const badgeText = screen.getByText("Success");
    expect(badgeText).toBeInTheDocument();
    expect(badgeText).toHaveStyle({
      color: "#059669",
      fontFamily: "Inter, sans-serif",
    });

    // Verify the inner dot element background matches configuration
    const badgeContainer = screen.getByText("Success");
    const dotElement = badgeContainer.querySelector("span");
    expect(dotElement).toHaveStyle({ background: "#10b981" });
  });

  it("should render with fallback style definitions and capitalized label when an unknown status is provided", () => {
    render(<TxStatusBadge status="processing" />);

    const badgeText = screen.getByText("PROCESSING");
    expect(badgeText).toBeInTheDocument();
    expect(badgeText).toHaveStyle({
      color: "#64748b",
      fontFamily: "Inter, sans-serif",
    });

    const badgeContainer = screen.getByText("PROCESSING");
    const dotElement = badgeContainer.querySelector("span");
    expect(dotElement).toHaveStyle({ background: "#94a3b8" });
  });

  it("should handle undefined status gracefully and fall back safely without crashing", () => {
    render(<TxStatusBadge status={undefined} />);

    // When status is undefined, label evaluates to undefined, so container is present but empty of status text
    const dotElement = screen
      .getByRole("img", { hidden: true } || Object)
      .parentNode.querySelector("span");
    expect(dotElement).toBeInTheDocument();
    expect(dotElement).toHaveStyle({ background: "#94a3b8" });
  });
});
