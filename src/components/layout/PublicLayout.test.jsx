/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicLayout from "./PublicLayout";

// Mock child components
vi.mock("@components/layout/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("@components/layout/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

describe("PublicLayout", () => {
  it("should render children", () => {
    render(
      <PublicLayout>
        <div>Page Content</div>
      </PublicLayout>
    );
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("should render Navbar", () => {
    render(<PublicLayout>Content</PublicLayout>);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("should render Footer", () => {
    render(<PublicLayout>Content</PublicLayout>);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should have base container classes", () => {
    const { container } = render(<PublicLayout>Content</PublicLayout>);
    const div = container.firstChild;
    expect(div).toHaveClass("min-h-screen");
    expect(div).toHaveClass("flex");
    expect(div).toHaveClass("flex-col");
    expect(div).toHaveClass("font-sans");
    expect(div).toHaveClass("antialiased");
  });

  it("should render main element", () => {
    const { container } = render(<PublicLayout>Content</PublicLayout>);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("flex-1");
  });
});
