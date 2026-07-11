import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ContactModal from "@components/ui/ContactModal";

describe("ContactModal", () => {
  it("renders when isOpen and has role dialog", () => {
    const onClose = vi.fn();
    render(<ContactModal isOpen onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("closes when backdrop button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    const backdrop = screen.getByLabelText("Close contact modal");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when inner Close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    const btn = screen.getByText("Close");
    await user.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<ContactModal isOpen onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
