/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedTopbar from "./SharedTopbar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@constants/images", () => ({
  IMAGES: {
    LOGO: "/logo.png",
  },
}));

describe("SharedTopbar", () => {
  let onMenuToggle;
  let onLogoClick;

  beforeEach(() => {
    vi.clearAllMocks();
    onMenuToggle = vi.fn();
    onLogoClick = vi.fn();
  });

  it("should render the LeapMentor logo and brand name", () => {
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    expect(screen.getByAltText("LeapMentor logo")).toBeInTheDocument();
    expect(screen.getByText("LeapMentor")).toBeInTheDocument();
  });

  it("should render the shared session badge text", () => {
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    expect(screen.getByText("Shared Session")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("should render Back button text", () => {
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    expect(screen.getAllByText("Back").length).toBeGreaterThan(0);
  });

  it("should call onMenuToggle when hamburger button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    const hamburger = container.querySelector(".shared-hamburger");
    await user.click(hamburger);

    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onLogoClick when logo button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    const logoButton = screen.getByAltText("LeapMentor logo").closest("button");
    await user.click(logoButton);

    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });

  it("should navigate to /dashboard/mentor when viewerRole is mentor and Back is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    const backButton = screen.getAllByText("Back")[0].closest("button");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
  });

  it("should navigate to /dashboard/mentee when viewerRole is mentee and Back is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SharedTopbar
        viewerRole="mentee"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    const backButton = screen.getAllByText("Back")[0].closest("button");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
  });

  it("should default to the mentee back path when viewerRole is not provided", async () => {
    const user = userEvent.setup();
    render(
      <SharedTopbar onMenuToggle={onMenuToggle} onLogoClick={onLogoClick} />,
    );

    const backButton = screen.getAllByText("Back")[0].closest("button");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
  });

  it("should apply hover background color styles on the back button", () => {
    render(
      <SharedTopbar
        viewerRole="mentor"
        onMenuToggle={onMenuToggle}
        onLogoClick={onLogoClick}
      />,
    );

    const backButton = screen.getAllByText("Back")[0].closest("button");

    fireEvent.mouseEnter(backButton);
    expect(backButton.style.backgroundColor).toBe("rgb(30, 64, 175)");

    fireEvent.mouseLeave(backButton);
    expect(backButton.style.backgroundColor).toBe("rgb(30, 58, 138)");
  });
});
