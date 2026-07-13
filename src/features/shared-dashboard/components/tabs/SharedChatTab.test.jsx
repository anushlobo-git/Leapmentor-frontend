// src/features/shared-dashboard/components/tabs/SharedChatTab.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// ─── Mocks (must use the exact same import paths as the component) ───────────
vi.mock("@features/shared-dashboard/hooks/useChat");
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

// ─── Import after vi.mock ────────────────────────────────────────────────────
import { useSelector } from "react-redux";
import useChat from "@features/shared-dashboard/hooks/useChat";
import SharedChatTab from "./SharedChatTab.jsx";

// ─── Fake Redux state the component's inline selectors expect ───────────────
const fakeState = {
  sharedDashboard: {
    connectId: "conn-123",
    connect: {
      viewerRole: "mentee",
      mentor: { _id: "mentor-id", name: "Mentor User", profilePicture: null },
      mentee: { _id: "mentee-id", name: "Mentee User", profilePicture: null },
      mentorProfile: { profilePicture: null },
      menteeProfile: { profilePicture: null },
    },
  },
};

// ─── Default hook return value ───────────────────────────────────────────────
const defaultChatState = {
  messages: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  error: null,
  isTyping: false,
  otherOnline: true,
  sendMessage: vi.fn(),
  loadMore: vi.fn(),
  handleTyping: vi.fn(),
  markRead: vi.fn(),
};

// jsdom does not implement scrollIntoView — polyfill globally
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("SharedChatTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Run every selector with the fake Redux state so inline arrow selectors work
    vi.mocked(useSelector).mockImplementation((selector) => selector(fakeState));
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState });
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  it("renders a loading indicator when messages are loading", () => {
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, loading: true });
    render(<SharedChatTab />);
    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });

  // ── Empty state ────────────────────────────────────────────────────────────
  it("shows an empty-state message when there are no messages", async () => {
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, messages: [], loading: false });
    render(<SharedChatTab />);
    await waitFor(() =>
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
    );
  });

  // ── Message list ───────────────────────────────────────────────────────────
  it("renders a list of messages", () => {
    const messages = [
      {
        _id: "m1",
        content: "Hello!",
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: { _id: "mentee-id" },
      },
      {
        _id: "m2",
        content: "How are you?",
        createdAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
        sender: { _id: "mentor-id" },
      },
    ];
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, messages });
    render(<SharedChatTab />);
    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
  });

  // ── Typing indicator ───────────────────────────────────────────────────────
  it("shows a typing indicator when the other user is typing", async () => {
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, isTyping: true });
    render(<SharedChatTab />);
    await waitFor(() =>
      expect(screen.getByText(/is typing/i)).toBeInTheDocument()
    );
  });

  // ── Message input ──────────────────────────────────────────────────────────
  it("allows typing in the message input", () => {
    render(<SharedChatTab />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Test input" } });
    expect(input.value).toBe("Test input");
  });

  // ── Send message via Enter key ─────────────────────────────────────────────
  it("calls sendMessage when Enter is pressed (without Shift)", async () => {
    const sendMessage = vi.fn();
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, sendMessage });
    render(<SharedChatTab />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith("Hello world"));
  });

  // ── No send on Shift+Enter ─────────────────────────────────────────────────
  it("does NOT call sendMessage when Shift+Enter is pressed", () => {
    const sendMessage = vi.fn();
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, sendMessage });
    render(<SharedChatTab />);
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "multiline" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  // ── Error banner ───────────────────────────────────────────────────────────
  it("renders an error banner when error is present", () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      error: "Failed to load messages",
    });
    render(<SharedChatTab />);
    expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
  });

  // ── markRead called on mount ───────────────────────────────────────────────
  it("calls markRead when the component mounts", async () => {
    const markRead = vi.fn();
    vi.mocked(useChat).mockReturnValue({ ...defaultChatState, markRead });
    render(<SharedChatTab />);
    await waitFor(() => expect(markRead).toHaveBeenCalled());
  });

  // ── mentee viewerRole ─────────────────────────────────────────────────────
  it("shows mentor name in header when viewer is mentee", () => {
    render(<SharedChatTab />);
    expect(screen.getByText("Mentor User")).toBeInTheDocument();
  });

  // ── mentor viewerRole ─────────────────────────────────────────────────────
  it("shows mentee name in header when viewer is mentor", () => {
    const mentorViewState = {
      sharedDashboard: {
        connectId: "conn-456",
        connect: {
          viewerRole: "mentor",
          mentor: { _id: "mentor-id", name: "Mentor User", profilePicture: null },
          mentee: { _id: "mentee-id", name: "Mentee User", profilePicture: null },
          mentorProfile: { profilePicture: null },
          menteeProfile: { profilePicture: null },
        },
      },
    };
    vi.mocked(useSelector).mockImplementation((selector) => selector(mentorViewState));
    render(<SharedChatTab />);
    expect(screen.getByText("Mentee User")).toBeInTheDocument();
  });
});
