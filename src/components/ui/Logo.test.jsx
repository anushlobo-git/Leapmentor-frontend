import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Logo from "@components/ui/Logo";

describe("Logo", () => {
  it("renders the logo image and text", () => {
    render(<Logo onClick={() => {}} />);

    expect(
      screen.getByRole("img", { name: /LeapMentor logo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /LeapMentor/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Logo onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: /LeapMentor/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation via Enter", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Logo onClick={handleClick} />);

    const button = screen.getByRole("button", { name: /LeapMentor/i });
    button.focus();

    await user.keyboard("{Enter}");

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation via Space", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Logo onClick={handleClick} />);

    const button = screen.getByRole("button", { name: /LeapMentor/i });
    button.focus();

    await user.keyboard("{ }");

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders light variant text color when requested", () => {
    render(<Logo onClick={() => {}} variant="light" />);

    expect(screen.getByText(/LeapMentor/i)).toHaveClass("text-white");
  });

  it("renders dark variant text color by default", () => {
    render(<Logo onClick={() => {}} />);

    expect(screen.getByText(/LeapMentor/i)).toHaveClass("text-gray-900");
  });
});
