/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedDashboardLayout from "./SharedDashboardLayout";
import {
  setActiveTab,
  selectActiveTab,
  selectViewerRole,
} from "@features/shared-dashboard/store/sharedDashboardSlice";

// ── Mocks: router + redux ──────────────────────────────────────
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockSetSearchParams = vi.fn();

let mockActiveTab = "overview";
let mockViewerRole = "mentee";

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selectorFn) => {
    if (selectorFn === selectActiveTab) return mockActiveTab;
    if (selectorFn === selectViewerRole) return mockViewerRole;
    return undefined;
  },
}));

vi.mock("@features/shared-dashboard/store/sharedDashboardSlice", () => ({
  setActiveTab: vi.fn((tab) => ({
    type: "sharedDashboard/setActiveTab",
    payload: tab,
  })),
  selectActiveTab: vi.fn((state) => state?.sharedDashboard?.activeTab),
  selectViewerRole: vi.fn((state) => state?.sharedDashboard?.viewerRole),
}));

// ── Mocks: hooks ────────────────────────────────────────────────
const mockUseSocketToast = vi.fn();
vi.mock("@features/notifications/hooks/useSocketToast", () => ({
  default: (...args) => mockUseSocketToast(...args),
}));

// ── Mocks: child components ─────────────────────────────────────
vi.mock("@features/shared-dashboard/components/SharedTopbar", () => ({
  default: ({ viewerRole, onMenuToggle, onLogoClick }) => (
    <div data-testid="shared-topbar">
      <span data-testid="topbar-viewer-role">{viewerRole}</span>
      <button onClick={onMenuToggle}>open-menu</button>
      <button onClick={onLogoClick}>logo</button>
    </div>
  ),
}));

vi.mock("@features/shared-dashboard/components/SharedSidebar", () => ({
  default: ({
    activeTab,
    setActiveTab: setTab,
    isOpen,
    onClose,
    viewerRole,
  }) => (
    <div data-testid="shared-sidebar">
      <span data-testid="sidebar-active-tab">{activeTab}</span>
      <span data-testid="sidebar-viewer-role">{viewerRole}</span>
      <span data-testid="sidebar-is-open">{String(isOpen)}</span>
      <button onClick={() => setTab("chat")}>select-chat</button>
      <button onClick={onClose}>close-sidebar</button>
    </div>
  ),
}));

vi.mock("@features/shared-dashboard/components/tabs/SharedHomeTab", () => ({
  default: () => <div data-testid="shared-home-tab">home</div>,
}));

vi.mock("@features/shared-dashboard/components/tabs/SharedChatTab", () => ({
  default: () => <div data-testid="shared-chat-tab">chat</div>,
}));

vi.mock("@features/shared-dashboard/components/tabs/SharedGoalsTab", () => ({
  default: () => <div data-testid="shared-goals-tab">goals</div>,
}));

vi.mock("@features/shared-dashboard/components/tabs/SharedNotesTab", () => ({
  default: () => <div data-testid="shared-notes-tab">notes</div>,
}));

vi.mock(
  "@features/shared-dashboard/components/tabs/SharedAdditionalSessionTab",
  () => ({
    default: () => <div data-testid="shared-addsession-tab">addSession</div>,
  }),
);

describe("SharedDashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveTab = "overview";
    mockViewerRole = "mentee";
  });

  it("renders the topbar, sidebar, and all tab containers", () => {
    render(<SharedDashboardLayout />);

    expect(screen.getByTestId("shared-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("shared-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("shared-home-tab")).toBeInTheDocument();
    expect(screen.getByTestId("shared-chat-tab")).toBeInTheDocument();
    expect(screen.getByTestId("shared-goals-tab")).toBeInTheDocument();
    expect(screen.getByTestId("shared-notes-tab")).toBeInTheDocument();
    expect(screen.getByTestId("shared-addsession-tab")).toBeInTheDocument();
  });

  it("invokes the socket toast hook on mount", () => {
    render(<SharedDashboardLayout />);
    expect(mockUseSocketToast).toHaveBeenCalledTimes(1);
  });

  it("defaults to the 'overview' tab when the store has no active tab", () => {
    mockActiveTab = undefined;
    render(<SharedDashboardLayout />);
    expect(screen.getByTestId("sidebar-active-tab")).toHaveTextContent(
      "overview",
    );
  });

  it("passes the current active tab and viewer role down to the sidebar", () => {
    mockActiveTab = "goals";
    mockViewerRole = "mentor";
    render(<SharedDashboardLayout />);

    expect(screen.getByTestId("sidebar-active-tab")).toHaveTextContent("goals");
    expect(screen.getByTestId("sidebar-viewer-role")).toHaveTextContent(
      "mentor",
    );
    expect(screen.getByTestId("topbar-viewer-role")).toHaveTextContent(
      "mentor",
    );
  });

  it("dispatches setActiveTab and updates the search params when a sidebar tab is selected", async () => {
    const user = userEvent.setup();
    render(<SharedDashboardLayout />);

    await user.click(screen.getByText("select-chat"));

    expect(setActiveTab).toHaveBeenCalledWith("chat");
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "sharedDashboard/setActiveTab",
      payload: "chat",
    });
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      { tab: "chat" },
      { replace: true },
    );
  });

  it("opens the sidebar when the topbar menu toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<SharedDashboardLayout />);

    expect(screen.getByTestId("sidebar-is-open")).toHaveTextContent("false");
    await user.click(screen.getByText("open-menu"));
    expect(screen.getByTestId("sidebar-is-open")).toHaveTextContent("true");
  });

  it("closes the sidebar when the sidebar's onClose is triggered", async () => {
    const user = userEvent.setup();
    render(<SharedDashboardLayout />);

    await user.click(screen.getByText("open-menu"));
    expect(screen.getByTestId("sidebar-is-open")).toHaveTextContent("true");

    await user.click(screen.getByText("close-sidebar"));
    expect(screen.getByTestId("sidebar-is-open")).toHaveTextContent("false");
  });

  it("navigates to the mentor dashboard when logo is clicked and viewer role is mentor", async () => {
    mockViewerRole = "mentor";
    const user = userEvent.setup();
    render(<SharedDashboardLayout />);

    await user.click(screen.getByText("logo"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
  });

  it("navigates to the mentee dashboard when logo is clicked and viewer role is not mentor", async () => {
    mockViewerRole = "mentee";
    const user = userEvent.setup();
    render(<SharedDashboardLayout />);

    await user.click(screen.getByText("logo"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
  });

  describe("tab visibility per activeTab", () => {
    it("shows the chat panel as flex when activeTab is 'chat'", () => {
      mockActiveTab = "chat";
      render(<SharedDashboardLayout />);
      const chatPanel = screen.getByTestId("shared-chat-tab").parentElement;
      expect(chatPanel.style.display).toBe("flex");
    });

    it("shows the goals panel as block when activeTab is 'goals'", () => {
      mockActiveTab = "goals";
      render(<SharedDashboardLayout />);
      const goalsPanel = screen.getByTestId("shared-goals-tab").parentElement;
      expect(goalsPanel.style.display).toBe("block");
    });

    it("shows the notes panel as block when activeTab is 'notes'", () => {
      mockActiveTab = "notes";
      render(<SharedDashboardLayout />);
      const notesPanel = screen.getByTestId("shared-notes-tab").parentElement;
      expect(notesPanel.style.display).toBe("block");
    });

    it("shows the add session panel as block when activeTab is 'addSession'", () => {
      mockActiveTab = "addSession";
      render(<SharedDashboardLayout />);
      const addSessionPanel = screen.getByTestId(
        "shared-addsession-tab",
      ).parentElement;
      expect(addSessionPanel.style.display).toBe("block");
    });

    it("hides all non-overview panels when activeTab is 'overview'", () => {
      mockActiveTab = "overview";
      render(<SharedDashboardLayout />);

      expect(
        screen.getByTestId("shared-chat-tab").parentElement.style.display,
      ).toBe("none");
      expect(
        screen.getByTestId("shared-goals-tab").parentElement.style.display,
      ).toBe("none");
      expect(
        screen.getByTestId("shared-notes-tab").parentElement.style.display,
      ).toBe("none");
      expect(
        screen.getByTestId("shared-addsession-tab").parentElement.style.display,
      ).toBe("none");
    });
  });
});
