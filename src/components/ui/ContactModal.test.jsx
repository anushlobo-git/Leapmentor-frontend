import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ContactModal from "@components/ui/ContactModal";

function ContactModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open contact</button>
      <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

describe("ContactModal", () => {
  it("renders an accessible dialog with the contact information when open", () => {
    const onClose = vi.fn();
    render(<ContactModal isOpen onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: "Contact Us" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleDescription("Have questions? We'd love to hear from you.");
    expect(screen.getByRole("link", { name: "leapmentor2026@gmail.com" })).toHaveAttribute(
      "href",
      "https://mail.google.com/mail/?view=cm&to=leapmentor2026@gmail.com",
    );
  });

  it("does not render a dialog when closed", () => {
    render(<ContactModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("requests closing when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    const backdrop = document.querySelector('[data-slot="dialog-overlay"]');
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when inner Close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    const btn = screen.getByRole("button", { name: "Close" });
    await user.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape key", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not request closing when content inside the dialog is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ContactModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole("heading", { name: "Contact Us" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps keyboard focus inside and returns it to the opener after closing", async () => {
    const user = userEvent.setup();
    render(<ContactModalExample />);
    const opener = screen.getByRole("button", { name: "Open contact" });

    await user.click(opener);
    const emailLink = screen.getByRole("link", { name: "leapmentor2026@gmail.com" });
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(emailLink).toHaveFocus();
    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    });
  });
});
