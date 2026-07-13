/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";

// Mock child components
vi.mock("@components/ui/Logo", () => ({
  default: ({ variant }) => <div data-testid="logo" data-variant={variant}>Logo</div>,
}));

vi.mock("@components/ui/ContactModal", () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="contact-modal"><button onClick={onClose}>Close</button></div> : null
  ),
}));

describe("Footer", () => {
  it("should render Logo", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("should render Logo with light variant", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    const logo = screen.getByTestId("logo");
    expect(logo).toHaveAttribute("data-variant", "light");
  });

  it("should render brand description", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/The world's leading mentorship platform/)).toBeInTheDocument();
  });

  it("should render footer link headings", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText("For Mentees")).toBeInTheDocument();
    expect(screen.getByText("For Mentors")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("should render footer links", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText("Find a Mentor")).toBeInTheDocument();
    expect(screen.getByText("Become a Mentor")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("should render copyright text", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/© 2026 LeapMentor Inc/)).toBeInTheDocument();
  });

  it("should have footer element", () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("should have footer classes", () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("text-gray-300");
    expect(footer).toHaveClass("pt-8");
    expect(footer).toHaveClass("pb-5");
    expect(footer).toHaveClass("px-6");
  });

  it("should open contact modal when Contact link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    const contactButton = screen.getByText("Contact");
    await user.click(contactButton);
    
    expect(screen.getByTestId("contact-modal")).toBeInTheDocument();
  });

  it("should close contact modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    
    // Open modal first
    const contactButton = screen.getByText("Contact");
    await user.click(contactButton);
    
    // Close modal
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);
    
    expect(screen.queryByTestId("contact-modal")).not.toBeInTheDocument();
  });

  it("should render glow accents", () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    const glowDivs = container.querySelectorAll("div[style*='radial-gradient']");
    expect(glowDivs.length).toBeGreaterThan(0);
  });
});
