import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import SharedNotificationsTab from "./SharedNotificationsTab";
import {
  getNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  markNotificationRead,
  deleteNotification,
} from "@features/notifications/api/notifications.api";
import { normalizeApiNotif } from "@features/notifications/mappers/notificationMapper";

// 1. Setup global mocks for external API modules and data normalizing mappers
vi.mock("@features/notifications/api/notifications.api", () => ({
  getNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  clearAllNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

vi.mock("@features/notifications/mappers/notificationMapper", () => ({
  normalizeApiNotif: vi.fn((notif) => ({ ...notif, isApi: true })),
}));

vi.mock("@components/common/EmptyState", () => ({
  default: ({ title, message }) => (
    <div data-testid="mock-empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  ),
}));

describe("SharedNotificationsTab", () => {
  let mockSetActiveTab;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetActiveTab = vi.fn();
  });

  // ── LOADING STATE TESTS ────────────────────────────────────────────────────
  it("should render placeholder skeleton elements while operations are loading", () => {
    getNotifications.mockReturnValue(new Promise(() => {})); // Suspends execution
    const { container } = render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    const skeletonElements = container.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  // ── LIVE API SUCCESS TESTS ─────────────────────────────────────────────────
  it("should display live mapped notifications upon successful backend data responses", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          {
            id: "api-notif-1",
            type: "new_message",
            read: false,
            time: "10 minutes ago",
            title: "Live Chat Request",
            senderName: "Alice M.",
            body: "Alice sent a chat update.",
            actions: [],
          },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(mockApiResponse);

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Live Chat Request")).toBeInTheDocument();
    });

    expect(normalizeApiNotif).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Could not load live notifications."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Total Notifications")).toBeInTheDocument();
  });

  // ── LIVE INDIVIDUAL ROW INTERACTION & REJECTION FALLBACK TESTS ─────────────
  it("should fall back gracefully to default sample configurations when API returns error exceptions", async () => {
    getNotifications.mockRejectedValueOnce(new Error("Network Failure"));

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Could not load live notifications. Showing sample data.",
        ),
      ).toBeInTheDocument();
    });

    // Check that sample notifications are drawn correctly from INITIAL_NOTIFICATIONS
    expect(screen.getByText("New Connect Request")).toBeInTheDocument();
    // Use the unique body paragraph string matcher to avoid the badge/title text double-match error
    expect(
      screen.getByText(/Career Coaching with Chris Johnson/i),
    ).toBeInTheDocument();
  });

  it("should trigger specific patch updates when clicking individual unread cards in live mode", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          {
            id: "live-card-1",
            type: "new_message",
            read: false,
            title: "Test Title",
          },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(mockApiResponse);
    markNotificationRead.mockResolvedValueOnce({});

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    const cardButton = screen.getByText("Test Title").closest("button");
    fireEvent.click(cardButton);

    await waitFor(() => {
      expect(markNotificationRead).toHaveBeenCalledWith("live-card-1");
    });
  });

  // ── STATS BAR & DATE PARSING CORNER TESTS ──────────────────────────────────
  it("should compute metadata aggregates correctly across varied dates", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          { id: "d1", type: "new_message", read: false, time: "5 minutes ago" },
          { id: "d2", type: "feedback", read: true, time: "Yesterday" },
          {
            id: "d3",
            type: "upcoming_session",
            read: true,
            time: "15 days ago",
          },
        ],
      },
    };
    normalizeApiNotif.mockImplementation((n) => ({ ...n, isApi: false }));
    getNotifications.mockResolvedValueOnce(mockApiResponse);

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      const values = screen.getAllByText(/[0-9]+/);
      const valuesText = values.map((v) => v.textContent);
      expect(valuesText).toContain("3");
      expect(valuesText).toContain("1");
    });
  });

  // ── BULK CONTROLLER INTERACTION ACTIONS ────────────────────────────────────
  it("should mark all active card views as read when processing generic mass updates", async () => {
    getNotifications.mockRejectedValueOnce(
      new Error("Static Fallback Trigger"),
    );
    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });

    const markAllBtn = screen.getByText("Mark all as read");
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      const unreadCountHeader = screen.getByText("Unread").previousSibling;
      expect(unreadCountHeader.textContent).toBe("0");
    });
    expect(markAllNotificationsRead).not.toHaveBeenCalled();
  });

  it("should flush out container entries completely upon clicking layout cleanup elements", async () => {
    getNotifications.mockRejectedValueOnce(
      new Error("Static Fallback Trigger"),
    );
    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Clear all")).toBeInTheDocument();
    });

    const clearAllBtn = screen.getByText("Clear all");
    fireEvent.click(clearAllBtn);

    await waitFor(() => {
      expect(screen.getByTestId("mock-empty-state")).toBeInTheDocument();
    });
    expect(clearAllNotifications).not.toHaveBeenCalled();
  });

  it("should execute individual row removals upon hitting standalone card delete icons", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          {
            id: "del-1",
            type: "new_message",
            read: true,
            title: "Target Delete Card",
          },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(mockApiResponse);
    deleteNotification.mockResolvedValueOnce({});

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Target Delete Card")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteNotification).toHaveBeenCalledWith("del-1");
      expect(screen.queryByText("Target Delete Card")).not.toBeInTheDocument();
    });
  });

  // ── CARD ACTION LAYOUT & STOPPROPAGATION VERIFICATIONS ─────────────────────
  it("should prevent bubbling interactions when supplementary action tags are selected", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          {
            id: "act-1",
            type: "connect_request",
            read: true,
            title: "Action Card Verification",
            actions: [{ label: "Verify Primary Option", primary: true }],
          },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(mockApiResponse);
    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Verify Primary Option")).toBeInTheDocument();
    });

    const actionButton = screen.getByText("Verify Primary Option");
    fireEvent.click(actionButton);

    expect(markNotificationRead).not.toHaveBeenCalled();
  });

  // ── NAVIGATION MAP RESOLUTION TESTING MATRICES ─────────────────────────────
  const testNavigation = async (type, role, expectedTab) => {
    cleanup(); // Cleans up the DOM tree from the previous test iteration completely
    vi.clearAllMocks();

    const response = {
      data: {
        notifications: [
          { id: `nav-${type}-${role}`, type, read: true, title: `Nav ${type}` },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(response);

    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role={role} />,
    );

    await waitFor(() => {
      expect(screen.getByText(`Nav ${type}`)).toBeInTheDocument();
    });

    const elementBtn = screen.getByText(`Nav ${type}`).closest("button");
    fireEvent.click(elementBtn);

    expect(mockSetActiveTab).toHaveBeenCalledWith(expectedTab);
  };

  it("should resolve proper dashboard panel routes across all matrix scenarios", async () => {
    // 1. Connect request received configurations
    await testNavigation("connect_request_received", "mentee", "findMentors");
    await testNavigation("connect_request_received", "mentor", "requests");

    // 2. Connect request declined configurations
    await testNavigation("connect_request_declined", "mentee", "findMentors");
    await testNavigation("connect_request_declined", "mentor", "requests");

    // 3. Connect request referred configurations
    await testNavigation("connect_request_referred", "mentee", "findMentors");
    await testNavigation("connect_request_referred", "mentor", "requests");

    // 4. Connect request accepted configurations
    await testNavigation("connect_request_accepted", "mentee", "history");
    await testNavigation("connect_request_accepted", "mentor", "connects");

    // 5. Standard session metrics
    await testNavigation("upcoming_session", "mentee", "connects");
    await testNavigation("new_message", "mentor", "connects");
    await testNavigation("session_completed", "mentee", "connects");

    // 6. Secondary metrics & support logs
    await testNavigation("new_review", "mentor", "profile");
    await testNavigation("support_resolved", "mentor", "home");
  });

  it("should process unknown type logs silently without crashing execution chains", async () => {
    const mockApiResponse = {
      data: {
        notifications: [
          {
            id: "unknown-id",
            type: "MALFORMED_UNSUPPORTED_TYPE",
            read: true,
            title: "Ghost Card",
          },
        ],
      },
    };
    getNotifications.mockResolvedValueOnce(mockApiResponse);
    render(
      <SharedNotificationsTab setActiveTab={mockSetActiveTab} role="mentor" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Ghost Card")).toBeInTheDocument();
    });

    const elementBtn = screen.getByText("Ghost Card").closest("button");
    fireEvent.click(elementBtn);

    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
});
