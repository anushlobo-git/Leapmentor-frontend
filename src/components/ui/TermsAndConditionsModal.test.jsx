import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TermsAndConditionsModal from "@components/ui/TermsAndConditionsModal";

describe("TermsAndConditionsModal", () => {
  it("renders the modal when open and closes on overlay click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <TermsAndConditionsModal isOpen onClose={onClose} onAccept={vi.fn()} />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("dialog").firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables accept button until the checkbox is checked", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onClose = vi.fn();

    render(
      <TermsAndConditionsModal isOpen onClose={onClose} onAccept={onAccept} />,
    );

    const acceptButton = screen.getByRole("button", {
      name: /Accept & Continue/i,
    });
    expect(acceptButton).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(acceptButton).toBeEnabled();

    await user.click(acceptButton);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <TermsAndConditionsModal isOpen onClose={onClose} onAccept={vi.fn()} />,
    );

    await user.click(screen.getByLabelText(/Close modal/i));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
