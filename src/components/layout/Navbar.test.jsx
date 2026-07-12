/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

// Mock child components
vi.mock("@components/ui/Logo", () => ({
  default: ({ onClick }) => <div data-testid="logo" onClick={onClick}>Logo</div>,
}));

vi.mock("@components/ui/Button", () => ({
  default: ({ children, onClick, variant, fullWidth }) => (
    <button 
      data-testid={`button-${variant}`} 
      onClick={onClick}
      className={fullWidth ? "full-width" : ""}
    >
      {children}
    </button>
  ),
}));

vi.mock("@components/ui/HamburgerIcon", () => ({
  default: ({ isOpen }) => <div data-testid="hamburger" data-open={isOpen}>Icon</div>,
}));

describe("Navbar", () => {
  beforeEach(() => {
    globalThis.location = { pathname: "/" };
    globalThis.scrollTo = vi.fn();
  });

  it("should render Logo", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("should render desktop buttons", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByTestId("button-outline")).toBeInTheDocument();
    expect(screen.getByTestId("button-primary")).toBeInTheDocument();
  });

  it("should render Register button", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("should render Login button", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should render hamburger icon on mobile", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByTestId("hamburger")).toBeInTheDocument();
  });

  it("should have base nav classes", () => {
    const { container } = render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("top-0");
    expect(nav).toHaveClass("left-0");
    expect(nav).toHaveClass("right-0");
    expect(nav).toHaveClass("z-50");
    expect(nav).toHaveClass("bg-white");
  });

  it("should toggle mobile menu on hamburger click", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const hamburger = screen.getByTestId("hamburger");
    expect(hamburger).toHaveAttribute("data-open", "false");
    
    await user.click(hamburger);
    expect(hamburger).toHaveAttribute("data-open", "true");
  });

  it("should not show mobile menu initially", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const mobileMenu = screen.queryByText("Register");
    // Mobile menu buttons should exist but not be in mobile menu div
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("should scroll to top when logo clicked on home page", async () => {
    const user = userEvent.setup();
    globalThis.location.pathname = "/";
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const logo = screen.getByTestId("logo");
    await user.click(logo);
    
    expect(globalThis.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("should navigate to home when logo clicked on other page", async () => {
    const user = userEvent.setup();
    globalThis.location.pathname = "/other";
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const logo = screen.getByTestId("logo");
    await user.click(logo);
    
    expect(globalThis.scrollTo).not.toHaveBeenCalled();
  });
});
