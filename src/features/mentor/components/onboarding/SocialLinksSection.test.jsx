import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SocialLinksSection from "./SocialLinksSection";

describe("SocialLinksSection", () => {
  let mockForm;
  let mockOnChange;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnChange = vi.fn();
    mockForm = {
      portfolioUrl: "https://initialportfolio.com",
      linkedInUrl: "https://linkedin.com/in/initialname",
    };
  });

  it("should render headers, input labels, and initial values from form state correctly", () => {
    render(<SocialLinksSection form={mockForm} onChange={mockOnChange} />);

    // Verify section header text is present
    expect(
      screen.getByRole("heading", { level: 2, name: /Social Links/i }),
    ).toBeInTheDocument();

    // Verify portfolio label, input field value, and placeholder characteristics
    const portfolioInput = screen.getByLabelText(
      /Portfolio or Personal Website URL/i,
    );
    expect(portfolioInput).toBeInTheDocument();
    expect(portfolioInput).toHaveValue("https://initialportfolio.com");
    expect(portfolioInput).toHaveAttribute(
      "placeholder",
      "https://yourportfolio.com",
    );

    // Verify LinkedIn label, input field value, and placeholder characteristics
    const linkedInInput = screen.getByLabelText(/LinkedIn Profile URL/i);
    expect(linkedInInput).toBeInTheDocument();
    expect(linkedInInput).toHaveValue("https://linkedin.com/in/initialname");
    expect(linkedInInput).toHaveAttribute(
      "placeholder",
      "https://linkedin.com/in/yourname",
    );
  });

  it("should call onChange handler when the portfolio input field receives new user keystrokes", async () => {
    const user = userEvent.setup();
    render(<SocialLinksSection form={mockForm} onChange={mockOnChange} />);

    const portfolioInput = screen.getByLabelText(
      /Portfolio or Personal Website URL/i,
    );

    // Type an individual character to trigger the change callback loop
    await user.type(portfolioInput, "s");

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: "portfolioUrl",
        }),
      }),
    );
  });

  it("should call onChange handler when the LinkedIn input field receives new user keystrokes", async () => {
    const user = userEvent.setup();
    render(<SocialLinksSection form={mockForm} onChange={mockOnChange} />);

    const linkedInInput = screen.getByLabelText(/LinkedIn Profile URL/i);

    // Type an individual character to trigger the change callback loop
    await user.type(linkedInInput, "m");

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: "linkedInUrl",
        }),
      }),
    );
  });
});
