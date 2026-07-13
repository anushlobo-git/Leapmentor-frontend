import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SocialLinksSection from "./SocialLinksSection";

describe("SocialLinksSection", () => {
  const baseForm = {
    linkedInUrl: "https://linkedin.com/in/alice",
    portfolioUrl: "https://alice.dev",
  };

  const mockHandleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders inputs with current form values", () => {
    render(
      <SocialLinksSection form={baseForm} handleChange={mockHandleChange} />,
    );

    expect(screen.getByLabelText(/LinkedIn URL/i)).toHaveValue(
      "https://linkedin.com/in/alice",
    );
    expect(screen.getByLabelText(/Portfolio URL/i)).toHaveValue(
      "https://alice.dev",
    );
  });

  it("calls handleChange on input changes", async () => {
    const user = userEvent.setup();
    render(
      <SocialLinksSection form={baseForm} handleChange={mockHandleChange} />,
    );

    const portInput = screen.getByLabelText(/Portfolio URL/i);
    await user.clear(portInput);
    await user.type(portInput, "https://bob.dev");

    expect(mockHandleChange).toHaveBeenCalled();
  });
});
