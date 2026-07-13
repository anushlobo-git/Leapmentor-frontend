import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "./NotFound";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("NotFound", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the 404 header and error message details", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "404" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Oops! The page you’re looking for doesn’t exist."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Go Home/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Go Back/i }),
    ).toBeInTheDocument();
  });

  it("should navigate to the root route when the Go Home button is clicked", async () => {
    const user = userEvent.setup();
    render(<NotFound />);

    const goHomeButton = screen.getByRole("button", { name: /Go Home/i });
    await user.click(goHomeButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should navigate back to the previous page when the Go Back button is clicked", async () => {
    const user = userEvent.setup();
    render(<NotFound />);

    const goBackButton = screen.getByRole("button", { name: /Go Back/i });
    await user.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
