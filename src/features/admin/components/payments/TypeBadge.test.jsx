import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TypeBadge from "./TypeBadge";

// Mock the constants module to strictly isolate component styling and fallback configurations
vi.mock("@features/admin/constants/payments.constants", () => ({
  FONT: "Mocked-Inter-Sans",
  TYPE_CONFIG: {
    escrow: {
      bg: "#e0f2fe",
      color: "#0369a1",
      border: "#bae6fd",
      label: "Escrow Deposit",
    },
    payout: {
      bg: "#ecfdf5",
      color: "#047857",
      border: "#a7f3d0",
      label: "Release Payout",
    },
  },
}));

describe("TypeBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the specific badge configuration when a recognized type is passed", () => {
    render(<TypeBadge type="escrow" />);

    const badge = screen.getByText("Escrow Deposit");
    expect(badge).toBeInTheDocument();

    // Validate inline style bindings applied from the mocked configuration match exactly
    expect(badge.style.background).toBe("rgb(224, 242, 254)");
    expect(badge.style.color).toBe("rgb(3, 105, 161)");
    expect(badge.style.border).toBe("1px solid rgb(186, 230, 253)");
    expect(badge.style.fontFamily).toBe("Mocked-Inter-Sans");
  });

  it("should render alternate theme values accurately for secondary verified types", () => {
    render(<TypeBadge type="payout" />);

    const badge = screen.getByText("Release Payout");
    expect(badge).toBeInTheDocument();
    expect(badge.style.background).toBe("rgb(236, 253, 245)");
    expect(badge.style.color).toBe("rgb(4, 120, 87)");
    expect(badge.style.border).toBe("1px solid rgb(167, 243, 208)");
  });

  it("should fallback to safe slate styling rules when an unknown type string value is passed", () => {
    render(<TypeBadge type="UNKNOWN_TRANSACTION_TYPE" />);

    const badge = screen.getByText("UNKNOWN_TRANSACTION_TYPE");
    expect(badge).toBeInTheDocument();

    expect(badge.style.background).toBe("rgb(248, 250, 252)");
    expect(badge.style.color).toBe("rgb(100, 116, 139)");
    expect(badge.style.border).toBe("1px solid rgb(226, 232, 240)");
  });

  it("should safely handle an empty, null, or missing type prop value without crashing", () => {
    const { container } = render(<TypeBadge type={null} />);

    // Query selector targets the structural span element directly to avoid multiple generic elements matching
    const badge = container.querySelector("span");
    expect(badge).toBeInTheDocument();
    expect(badge.style.background).toBe("rgb(248, 250, 252)");
    expect(badge.style.color).toBe("rgb(100, 116, 139)");
    expect(badge.style.border).toBe("1px solid rgb(226, 232, 240)");
  });
});
