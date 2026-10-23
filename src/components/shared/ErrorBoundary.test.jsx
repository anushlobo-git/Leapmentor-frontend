/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// Mock logger
vi.mock("@lib/monitoring/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Sentry — this boundary reports caught errors to it directly now
vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

import logger from "@lib/monitoring/logger";
import * as Sentry from "@sentry/react";

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock globalThis.location
    delete globalThis.location;
    globalThis.location = { href: "/" };
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child Component</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("should render error UI when there is an error", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should log error when error is caught", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.objectContaining({
        error: expect.anything(),
        errorInfo: expect.anything(),
      })
    );
  });

  it("should display error message when error exists", () => {
    const ThrowError = () => {
      throw new Error("Test error message");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it("should have error UI styling", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = container.querySelector(".min-h-screen");
    expect(errorContainer).toHaveClass("flex");
    expect(errorContainer).toHaveClass("items-center");
    expect(errorContainer).toHaveClass("justify-center");
    expect(errorContainer).toHaveClass("bg-slate-50");
  });

  it("should render reset button", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: "Go to Homepage" })).toBeInTheDocument();
  });

  it("should reset and navigate on button click", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const button = screen.getByRole("button", { name: "Go to Homepage" });
    button.click();

    expect(logger.info).toHaveBeenCalledWith("ErrorBoundary reset — navigating to homepage");
    expect(globalThis.location.href).toBe("/");
  });

  it("should render error icon", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have error icon container with pulse animation", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const iconContainer = container.querySelector(".animate-pulse");
    expect(iconContainer).toHaveClass("bg-rose-100");
    expect(iconContainer).toHaveClass("text-rose-600");
  });

  it("should report the caught error to Sentry", () => {
    const thrown = new Error("Test error");
    const ThrowError = () => {
      throw thrown;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(thrown);
  });

  it("should automatically clear the error when a resetKey changes", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const { rerender } = render(
      <ErrorBoundary resetKeys={["/dashboard"]}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={["/login"]}>
        <div>Recovered content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });

  it("should not clear the error when resetKeys stays the same", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const { rerender } = render(
      <ErrorBoundary resetKeys={["/dashboard"]}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={["/dashboard"]}>
        <div>Should not appear</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
