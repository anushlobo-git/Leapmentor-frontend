import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterDropdownItem from "./RegisterDropdownItem";

describe("RegisterDropdownItem", () => {
  it("should render item elements with correct text, subtitles, emoji, and styling layout classes", () => {
    render(
      <RegisterDropdownItem
        emoji="🚀"
        title="Join as Mentee"
        subtitle="Accelerate your growth pipeline"
        iconBg="bg-blue-100"
        onClick={vi.fn()}
      />,
    );

    // Verify main interactive text items render properly
    expect(screen.getByText("Join as Mentee")).toBeInTheDocument();
    expect(
      screen.getByText("Accelerate your growth pipeline"),
    ).toBeInTheDocument();
    expect(screen.getByText("🚀")).toBeInTheDocument();

    // Verify background layout class is correctly passed down to internal wrapper element
    const iconContainer = screen.getByText("🚀").parentNode;
    expect(iconContainer).toHaveClass("bg-blue-100");
  });

  it("should trigger onClick callback function when button container is clicked by the user", async () => {
    const user = userEvent.setup();
    const handleActionClick = vi.fn();

    render(
      <RegisterDropdownItem
        emoji="🎓"
        title="Join as Mentor"
        subtitle="Share your expertise"
        iconBg="bg-purple-100"
        onClick={handleActionClick}
      />,
    );

    const buttonContainer = screen.getByRole("button");
    await user.click(buttonContainer);

    expect(handleActionClick).toHaveBeenCalledTimes(1);
  });
});
