import { render, screen, fireEvent, act } from "@testing-library/react";
import IntegrationsSection from "./IntegrationsSection";
import {
  getGoogleCalendarAuthUrl,
  disconnectGoogleCalendar,
} from "@features/mentor/api/mentor.api";
import logger from "@lib/logger";

// Mock API layer
vi.mock("@features/mentor/api/mentor.api", () => ({
  getGoogleCalendarAuthUrl: vi.fn(),
  disconnectGoogleCalendar: vi.fn(),
}));

// Mock logger
vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("IntegrationsSection component", () => {
  const mockOnConnectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.open = vi.fn();
  });

  it("handles successful connect flow with message events", async () => {
    getGoogleCalendarAuthUrl.mockResolvedValueOnce({
      data: { url: "https://gcal.auth.url" },
    });

    render(
      <IntegrationsSection
        googleCalendarConnected={false}
        onConnectionChange={mockOnConnectionChange}
      />,
    );

    const connectBtn = screen.getByRole("button", { name: "Connect" });
    fireEvent.click(connectBtn);

    expect(getGoogleCalendarAuthUrl).toHaveBeenCalled();
    expect(connectBtn).toHaveTextContent("Connecting...");

    await act(async () => {
      await Promise.resolve();
    });

    expect(globalThis.open).toHaveBeenCalledWith(
      "https://gcal.auth.url",
      "gcal_auth",
      "width=500,height=600",
    );

    // Simulate random message event (should be ignored)
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { type: "OTHER_EVENT" } }),
      );
    });
    expect(mockOnConnectionChange).not.toHaveBeenCalled();

    // Simulate success message event
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "GOOGLE_CALENDAR_CONNECTED" },
        }),
      );
    });

    expect(mockOnConnectionChange).toHaveBeenCalledWith(true);
    expect(logger.info).toHaveBeenCalledWith(
      "Google Calendar connected via popup",
    );
  });

  it("handles popup error callback flow", async () => {
    getGoogleCalendarAuthUrl.mockResolvedValueOnce({
      data: { url: "https://gcal.auth.url" },
    });

    render(
      <IntegrationsSection
        googleCalendarConnected={false}
        onConnectionChange={mockOnConnectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await act(async () => {
      await Promise.resolve();
    });

    // Simulate error message event
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "GOOGLE_CALENDAR_ERROR", error: "Permission denied" },
        }),
      );
    });

    expect(mockOnConnectionChange).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      "Google Calendar error from popup",
      {
        error: "Permission denied",
      },
    );
  });

  it("handles API failure in calendar URL lookup", async () => {
    getGoogleCalendarAuthUrl.mockRejectedValueOnce("Auth fetch failed");

    render(
      <IntegrationsSection
        googleCalendarConnected={false}
        onConnectionChange={mockOnConnectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(globalThis.open).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith("Google Calendar error:", {
      error: "Auth fetch failed",
    });
  });

  it("handles successful disconnect flow", async () => {
    disconnectGoogleCalendar.mockResolvedValueOnce({});

    render(
      <IntegrationsSection
        googleCalendarConnected={true}
        onConnectionChange={mockOnConnectionChange}
      />,
    );

    const disconnectBtn = screen.getByRole("button", { name: "Disconnect" });
    fireEvent.click(disconnectBtn);

    expect(disconnectGoogleCalendar).toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnConnectionChange).toHaveBeenCalledWith(false);
  });

  it("handles API failure during disconnect flow", async () => {
    disconnectGoogleCalendar.mockRejectedValueOnce("Network Failure");

    render(
      <IntegrationsSection
        googleCalendarConnected={true}
        onConnectionChange={mockOnConnectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnConnectionChange).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith("Google Calendar error:", {
      error: "Network Failure",
    });
  });
});
