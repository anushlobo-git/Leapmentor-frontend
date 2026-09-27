/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedSidebar from "./SharedSidebar";

describe("SharedSidebar", () => {
  let mockSetActiveTab;
  let mockOnClose;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetActiveTab = vi.fn();
    mockOnClose = vi.fn();
    document.body.style.overflow = "";
  });

  it("renders the base nav items (overview, chat, goals, notes) for a mentor viewer, without Add Session", () => {
    render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    const overviewButtons = screen.getAllByRole("button", {
      name: /Overview/i,
      hidden: true,
    });
    const chatButtons = screen.getAllByRole("button", {
      name: /Chat/i,
      hidden: true,
    });
    const goalsButtons = screen.getAllByRole("button", {
      name: /Goals/i,
      hidden: true,
    });
    const notesButtons = screen.getAllByRole("button", {
      name: /Notes/i,
      hidden: true,
    });

    expect(overviewButtons).toHaveLength(2);
    expect(chatButtons).toHaveLength(2);
    expect(goalsButtons).toHaveLength(2);
    expect(notesButtons).toHaveLength(2);

    expect(
      screen.queryByRole("button", { name: /Add Session/i, hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("adds the Add Session nav item for a mentee viewer", () => {
    render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        viewerRole="mentee"
      />,
    );

    const addSessionButtons = screen.getAllByRole("button", {
      name: /Add Session/i,
      hidden: true,
    });
    expect(addSessionButtons).toHaveLength(2);
  });

  it("invokes setActiveTab and onClose when a nav item is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentee"
      />,
    );

    const chatButtons = screen.getAllByRole("button", {
      name: /Chat/i,
      hidden: true,
    });
    await user.click(chatButtons[1]);

    expect(mockSetActiveTab).toHaveBeenCalledWith("chat");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onClose is not provided on the desktop nav item click", async () => {
    const user = userEvent.setup();
    render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={undefined}
        viewerRole="mentee"
      />,
    );

    const chatButtons = screen.getAllByRole("button", {
      name: /Chat/i,
      hidden: true,
    });
    await user.click(chatButtons[0]);

    expect(mockSetActiveTab).toHaveBeenCalledWith("chat");
  });

  it("sets document body overflow to hidden while open and restores it when closed", () => {
    const { rerender } = render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("restores document body overflow on unmount", () => {
    const { unmount } = render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("renders the accent bar only for the active nav item", () => {
    const { container } = render(
      <SharedSidebar
        activeTab="goals"
        setActiveTab={mockSetActiveTab}
        isOpen={false}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    // AccentBar renders as an absolutely positioned span sibling of the icon;
    // there should be exactly 2 (desktop + mobile) since only "goals" is active.
    const accentBars = Array.from(
      container.querySelectorAll("button span"),
    ).filter((el) => el.style.position === "absolute");
    expect(accentBars).toHaveLength(2);
  });

  it("invokes onClose when the mobile backdrop is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    const backdrop = container.querySelector(".shared-sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when Enter or Space is pressed on the backdrop", () => {
    const { container } = render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    const backdrop = container.querySelector(".shared-sidebar-backdrop");

    backdrop.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    backdrop.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true }),
    );
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("does not invoke onClose for irrelevant key presses on the backdrop", () => {
    const { container } = render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    const backdrop = container.querySelector(".shared-sidebar-backdrop");
    backdrop.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("invokes onClose when the mobile drawer close (X) button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SharedSidebar
        activeTab="overview"
        setActiveTab={mockSetActiveTab}
        isOpen={true}
        onClose={mockOnClose}
        viewerRole="mentor"
      />,
    );

    const allButtons = screen.getAllByRole("button", { hidden: true });
    const closeButton = allButtons.find(
      (btn) =>
        !btn.className.includes("shared-sidebar-backdrop") &&
        btn.querySelector("svg") &&
        !btn.textContent.trim(),
    );

    expect(closeButton).toBeTruthy();
    await user.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
