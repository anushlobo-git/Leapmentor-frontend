import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import LeapBuddy from "./LeapBuddy";
import {
  sendAiChatMessage,
  sendSupportMessage,
} from "@features/support/api/support.api";

// ── Mock Core API Layer Endpoints ───────────────────────
vi.mock("@features/support/api/support.api", () => ({
  sendAiChatMessage: vi.fn(),
  sendSupportMessage: vi.fn(),
}));

// ── Mock FAQ Data Structures Explicitly ──────────────────
vi.mock("@features/support/data/faqs", () => ({
  menteeFaqs: [
    {
      category: "General",
      items: [
        { q: "How do I book a mentor?", a: "Select a profile and click book." },
      ],
    },
  ],
  mentorFaqs: [
    {
      category: "Payouts",
      items: [{ q: "When do I get paid?", a: "Earnings clear weekly." }],
    },
  ],
}));

// ── Mock FormField Reusable Core Component Transparently ──
vi.mock("@components/ui/FormField", () => ({
  default: vi.fn(({ as: Component = "input", focusColor, ...props }) => (
    <Component {...props} data-focuscolor={focusColor} />
  )),
}));

describe("LeapBuddy", () => {
  const mockUser = {
    name: "Priya Sharma",
    email: "priya@leapmentor.com",
  };

  const mockProfile = {
    skills: ["React", "Node.js"],
    interestedFields: ["Fintech", "EdTech"],
    currentRole: "Software Engineer",
    company: "Google",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Default standard baseline API resolutions
    vi.mocked(sendAiChatMessage).mockResolvedValue({
      data: { content: [{ text: "Standard AI response statement." }] },
    });
    vi.mocked(sendSupportMessage).mockResolvedValue({ success: true });

    // Polyfill scrollIntoView for JSDOM layout safety checks
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Section 1: Initialization, Welcomes, & Profiles ──
  describe("Initial Layout and Role Personalization Paths", () => {
    it("should initialize with custom personalized welcome text for a mentee profile", () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);

      // Floating activation trigger node validation
      const floatingBtn = screen.getByTitle("Chat with LeapBuddy");
      expect(floatingBtn).toBeInTheDocument();

      // Open pane to inspect baseline greetings context text
      fireEvent.click(floatingBtn);
      expect(screen.getByText(/Hey Priya!/i)).toBeInTheDocument();
      expect(screen.getByText(/mentee account/i)).toBeInTheDocument();
      expect(screen.getByText("How do I book a mentor?")).toBeInTheDocument();
    });

    it("should display generic welcome variations if user property references are empty", () => {
      render(<LeapBuddy role="mentor" user={null} />);

      const floatingBtn = screen.getByTitle("Chat with LeapBuddy");
      fireEvent.click(floatingBtn);

      expect(screen.getByText(/Hey there!/i)).toBeInTheDocument();
      expect(screen.getByText(/mentor account/i)).toBeInTheDocument();
      expect(screen.getByText("When do I get paid?")).toBeInTheDocument();
    });
  });

  // ── Section 2: Floating Delay Timer Cycles ──
  describe("Introductory Bubble Timer Sequences", () => {
    it("should pop open the greeting chip after 2.5s and auto-hide it after another 6s", () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);

      // Closed initially
      expect(screen.queryByText(/Got a question\?/i)).not.toBeInTheDocument();

      // Advance clock past introductory display trigger limit (2500ms)
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      expect(screen.getByText(/Got a question\?/i)).toBeInTheDocument();

      // Advance clock past auto-hide window threshold limit (6000ms)
      act(() => {
        vi.advanceTimersByTime(6000);
      });
      expect(screen.queryByText(/Got a question\?/i)).not.toBeInTheDocument();
    });

    it("should close introductory greeting bubble immediately if clicked", () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      const bubbleBtn = screen.getByText(/Got a question\?/i).closest("button");
      fireEvent.click(bubbleBtn);

      expect(screen.queryByText(/Got a question\?/i)).not.toBeInTheDocument();
      expect(
        screen.getByText("Online · Instant responses"),
      ).toBeInTheDocument();
    });
  });

  // ── Section 3: Pane Window State Operations ──
  describe("Chat Interface Window Operations", () => {
    it("should toggle the visibility status parameters of the main panel window", () => {
      render(<LeapBuddy role="mentee" />);

      const toggleBtn = screen.getByTitle("Chat with LeapBuddy");

      // Open
      fireEvent.click(toggleBtn);
      expect(screen.getByText("LeapBuddy")).toBeInTheDocument();

      // Close
      fireEvent.click(toggleBtn);
      expect(screen.queryByText("LeapBuddy")).not.toBeInTheDocument();
    });

    it("should flush message logs and reset structures on selecting the clear button option", () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);

      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      // Select the layout clear callback node element
      const clearBtn = screen.getByRole("button", { name: "Clear" });
      fireEvent.click(clearBtn);

      expect(
        screen.getByText("Hey Priya! 👋 I'm LeapBuddy! How can I help?"),
      ).toBeInTheDocument();
    });
  });

  // ── Section 4: Chat Interactivity & Input Handling ──
  describe("Conversation Processing and Input Operations", () => {
    it("should intercept and discard empty whitespace entries on message dispatch requests", () => {
      render(<LeapBuddy role="mentee" />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const textInput = screen.getByPlaceholderText(
        "Ask LeapBuddy anything...",
      );
      fireEvent.change(textInput, { target: { value: "     " } });

      const submitBtn = screen.getByText("➤");
      fireEvent.click(submitBtn);

      expect(sendAiChatMessage).not.toHaveBeenCalled();
    });

    it("should handle key down events dispatching requests on Enter keys without shift inputs", async () => {
      render(<LeapBuddy role="mentee" user={mockUser} profile={mockProfile} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const textInput = screen.getByPlaceholderText(
        "Ask LeapBuddy anything...",
      );

      await act(async () => {
        fireEvent.change(textInput, {
          target: { value: "How do I book a session?" },
        });
        fireEvent.keyDown(textInput, { key: "Enter", shiftKey: false });
      });

      expect(sendAiChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({ content: "How do I book a session?" }),
          ],
          systemPrompt: expect.stringContaining("You are LeapBuddy"),
        }),
      );
      expect(
        screen.getByText("Standard AI response statement."),
      ).toBeInTheDocument();
    });

    it("should ignore Enter keys if shift modifier indicators evaluate to true", () => {
      render(<LeapBuddy role="mentee" />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const textInput = screen.getByPlaceholderText(
        "Ask LeapBuddy anything...",
      );
      fireEvent.change(textInput, { target: { value: "Line 1\n" } });
      fireEvent.keyDown(textInput, { key: "Enter", shiftKey: true });

      expect(sendAiChatMessage).not.toHaveBeenCalled();
    });

    it("should automatically select and process input query entries via standard quick chips selection", async () => {
      render(<LeapBuddy role="mentor" />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const chipsBtn = screen.getByRole("button", {
        name: "When do I get paid?",
      });

      await act(async () => {
        fireEvent.click(chipsBtn);
      });

      expect(sendAiChatMessage).toHaveBeenCalled();
      expect(screen.getByText("When do I get paid?")).toBeInTheDocument();
    });

    it("should append a failure notification message item inline if AI chat calls drop with standard exceptions", async () => {
      vi.mocked(sendAiChatMessage).mockRejectedValueOnce(
        new Error("Timeout crash exception"),
      );
      render(<LeapBuddy role="mentee" />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const textInput = screen.getByPlaceholderText(
        "Ask LeapBuddy anything...",
      );

      await act(async () => {
        fireEvent.change(textInput, { target: { value: "Ping request" } });
        fireEvent.click(screen.getByText("➤"));
      });

      expect(screen.getByText(/Connection issue/i)).toBeInTheDocument();
    });
  });

  // ── Section 5: Escalation Form Form Processing ──
  describe("Human Admin Ticket Escalation Workflows", () => {
    beforeEach(() => {
      vi.mocked(sendAiChatMessage).mockResolvedValueOnce({
        data: {
          content: [{ text: "Please wait while I handle this. [ESCALATE]" }],
        },
      });
    });

    it("should render supplementary support ticketing forms upon intercepting escalate instructions", async () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      const textInput = screen.getByPlaceholderText(
        "Ask LeapBuddy anything...",
      );

      await act(async () => {
        fireEvent.change(textInput, {
          target: { value: "I want a refund for session 3" },
        });
        fireEvent.click(screen.getByText("➤"));
      });

      // Confirm clean strip operation removes token trace from standard rendering pane
      expect(screen.queryByText(/\[ESCALATE\]/i)).not.toBeInTheDocument();
      expect(
        screen.getByText("Please wait while I handle this."),
      ).toBeInTheDocument();

      // Confirm form input fields exist
      expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Subject")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Describe your issue..."),
      ).toBeInTheDocument();
    });

    it("should short circuit tickets submission steps if standard fields remain blank or empty", async () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      await act(async () => {
        fireEvent.change(
          screen.getByPlaceholderText("Ask LeapBuddy anything..."),
          { target: { value: "Refund" } },
        );
        fireEvent.click(screen.getByText("➤"));
      });

      const emailInput = screen.getByPlaceholderText("Your email");
      fireEvent.change(emailInput, { target: { value: "" } }); // Wipe initial auto-fill parameter to zero

      const submitTicketBtn = screen.getByRole("button", {
        name: /Submit to Admin/i,
      });
      fireEvent.click(submitTicketBtn);

      expect(sendSupportMessage).not.toHaveBeenCalled();
    });

    it("should display success confirmations upon successful ticket transmissions", async () => {
      render(<LeapBuddy role="mentee" user={mockUser} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      await act(async () => {
        fireEvent.change(
          screen.getByPlaceholderText("Ask LeapBuddy anything..."),
          { target: { value: "Account dispute" } },
        );
        fireEvent.click(screen.getByText("➤"));
      });

      // Mock user inputs inside form components fields
      fireEvent.change(screen.getByPlaceholderText("Your email"), {
        target: { value: "priya@leapmentor.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Subject"), {
        target: { value: "Dispute" },
      });
      fireEvent.change(screen.getByPlaceholderText("Describe your issue..."), {
        target: { value: "Issue description log." },
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /Submit to Admin/i }),
        );
      });

      expect(sendSupportMessage).toHaveBeenCalledWith(
        {
          email: "priya@leapmentor.com",
          subject: "Dispute",
          message: "Issue description log.",
        },
        "mentee",
      );
      expect(screen.getByText(/Ticket submitted!/i)).toBeInTheDocument();
    });

    it("should capture validation rejections and output contextual error hints gracefully", async () => {
      vi.mocked(sendSupportMessage).mockRejectedValueOnce(
        new Error("Network gateway write rejection"),
      );
      render(<LeapBuddy role="mentee" user={mockUser} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      await act(async () => {
        fireEvent.change(
          screen.getByPlaceholderText("Ask LeapBuddy anything..."),
          { target: { value: "Dispute text" } },
        );
        fireEvent.click(screen.getByText("➤"));
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /Submit to Admin/i }),
        );
      });

      expect(screen.getByText("Failed. Please try again.")).toBeInTheDocument();
    });
  });

  // ── Section 6: Full System Prompt Generation Branch Coverage ──
  describe("System Prompt Constructor Coverage Branches", () => {
    it("should render structural knowledge contexts correctly when completely filled context options pass down", async () => {
      // Test the conditional logic paths inside buildSystemPrompt by passing absolute data records
      render(<LeapBuddy role="mentee" user={mockUser} profile={mockProfile} />);
      fireEvent.click(screen.getByTitle("Chat with LeapBuddy"));

      await act(async () => {
        fireEvent.change(
          screen.getByPlaceholderText("Ask LeapBuddy anything..."),
          { target: { value: "Hello query context" } },
        );
        fireEvent.click(screen.getByText("➤"));
      });

      // Verify the API received the complete system prompt structure safely
      expect(sendAiChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.stringContaining("- User's name: Priya Sharma"),
        }),
      );
      expect(sendAiChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.stringContaining("- Skills: React, Node.js"),
        }),
      );
    });
  });
});
