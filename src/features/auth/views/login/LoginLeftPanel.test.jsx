import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginLeftPanel from "./LoginLeftPanel";

// ── 1. Mock External Constant Module ──────────────────────────────────────
vi.mock("@constants/images", () => ({
  IMAGES: {
    LOGIN: "mocked-login-image-path.jpg",
  },
}));

// ── 2. Test Suite ─────────────────────────────────────────────────────────
describe("LoginLeftPanel", () => {
  it("should render background image with correct source and alt description", () => {
    render(<LoginLeftPanel />);

    const fallbackImage = screen.getByRole("img", { name: /login visual/i });
    expect(fallbackImage).toBeInTheDocument();
    expect(fallbackImage).toHaveAttribute("src", "mocked-login-image-path.jpg");
  });

  it("should render the panel branding typography content elements correctly", () => {
    render(<LoginLeftPanel />);

    // Accounts for JSDOM accessible name calculation ignoring whitespace inside linebreaks (<br />)
    expect(
      screen.getByRole("heading", {
        name: /The right connection\s*changes everything\./i,
      }),
    ).toBeInTheDocument();

    // Validate supportive subtext elements using flexible text fragment matchers
    expect(
      screen.getByText(/Where experience meets ambition/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/grow together, go further\./i),
    ).toBeInTheDocument();
  });
});
