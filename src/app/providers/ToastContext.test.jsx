import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import { ToastProvider, useToast } from "./ToastContext";

// Test helper component to invoke context methods
const TestConsumer = ({ toastOptions }) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(toastOptions)}>Trigger Toast</button>;
};

// Test helper component to evaluate hook outside provider error branch
const FaultyConsumer = () => {
  useToast();
  return <div>Outside Provider</div>;
};

describe("ToastContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should throw an error when useToast is executed outside of ToastProvider context", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<FaultyConsumer />)).toThrow(
      "useToast must be used within ToastProvider",
    );

    consoleSpy.mockRestore();
  });

  it("should correctly render children nested within the provider layout shield", () => {
    render(
      <ToastProvider>
        <span data-testid="nested-child">Active Content</span>
      </ToastProvider>,
    );

    expect(screen.getByTestId("nested-child")).toBeInTheDocument();
  });

  it("should fall back to success type by default when type property is omitted", () => {
    render(
      <ToastProvider>
        <TestConsumer
          toastOptions={{
            title: "Default Success",
            message: "Operation completed",
          }}
        />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);

    expect(screen.getByText("Default Success")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("should support and apply dedicated configurations for custom toast types", () => {
    const { rerender } = render(
      <ToastProvider>
        <TestConsumer toastOptions={{ type: "error", title: "System Error" }} />
      </ToastProvider>,
    );

    let button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);
    expect(screen.getByText("System Error")).toBeInTheDocument();

    // Rerender to target alternate warning branch mapping structures
    rerender(
      <ToastProvider>
        <TestConsumer
          toastOptions={{ type: "warning", title: "System Warning" }}
        />
      </ToastProvider>,
    );
    button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);
    expect(screen.getByText("System Warning")).toBeInTheDocument();
  });

  it("should fallback to info layout template configuration if an undefined type variant is specified", () => {
    render(
      <ToastProvider>
        <TestConsumer
          toastOptions={{
            type: "unsupported-variant",
            title: "Fallback Context",
          }}
        />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);

    expect(screen.getByText("Fallback Context")).toBeInTheDocument();
  });

  it("should evaluate conditional node branches cleanly when title or message parameters are missing", () => {
    render(
      <ToastProvider>
        <TestConsumer toastOptions={{ type: "info" }} />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);

    // Assert that conditional paragraph elements are completely omitted from structural compilation
    expect(screen.queryByText("", { selector: "p" })).not.toBeInTheDocument();
  });

  it("should automatically evict and unmount the notification item node post 3000ms delay window expiration", () => {
    render(
      <ToastProvider>
        <TestConsumer toastOptions={{ title: "Volatile Warning Notice" }} />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(button);

    expect(screen.getByText("Volatile Warning Notice")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      screen.queryByText("Volatile Warning Notice"),
    ).not.toBeInTheDocument();
  });

  it("should close the modal immediately and prevent propagation mechanics when dismissal button is triggered", () => {
    const parentClickMock = vi.fn();

    render(
      <div onClick={parentClickMock}>
        <ToastProvider>
          <TestConsumer toastOptions={{ title: "Stray Intercept Target" }} />
        </ToastProvider>
      </div>,
    );

    const spawnButton = screen.getByRole("button", { name: /Trigger Toast/i });
    fireEvent.click(spawnButton);

    expect(screen.getByText("Stray Intercept Target")).toBeInTheDocument();

    // Reset tracking metrics to isolate the upcoming close click transaction cleanly
    parentClickMock.mockClear();

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(
      screen.queryByText("Stray Intercept Target"),
    ).not.toBeInTheDocument();

    // Verify e.stopPropagation() was called successfully
    expect(parentClickMock).not.toHaveBeenCalled();
  });
});
