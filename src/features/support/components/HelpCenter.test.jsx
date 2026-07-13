import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import HelpCenter from "./HelpCenter";
import { sendSupportMessage } from "@features/support/api/support.api";

// ── Shared Mutable Context State References ─────────────
let mockPathname = "/dashboard/mentee";

// ── Mock Framework Hooks & Stores ────────────────────────
vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(() => ({ pathname: mockPathname })),
}));

vi.mock("@features/support/api/support.api", () => ({
  sendSupportMessage: vi.fn(),
}));

// ── Mock Internal Core Data Lists ────────────────────────
vi.mock("@features/support/data/faqs", () => ({
  menteeFaqs: [
    {
      category: "Account",
      items: [
        { q: "How do I sign up as a mentee?", a: "Go to registration page." },
      ],
    },
    {
      category: "Billing",
      items: [
        { q: "What payments do you accept?", a: "We accept all credit cards." },
      ],
    },
  ],
  mentorFaqs: [
    {
      category: "Sessions",
      items: [
        {
          q: "How do I accept a session?",
          a: "Click confirm inside your request dashboard.",
        },
      ],
    },
  ],
}));

// ── Mock Specialized Subcomponents Transparently ────────
vi.mock("@components/ui/FormField", () => ({
  default: ({ as: Component = "input", ...props }) => <Component {...props} />,
}));

vi.mock("@features/support/components/FaqItem", () => ({
  default: ({ item, isOpen, onToggle }) => (
    <div data-testid="faq-wrapper">
      <button onClick={onToggle}>{item.q}</button>
      {isOpen && <p>{item.a}</p>}
    </div>
  ),
}));

describe("HelpCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/dashboard/mentee";
    vi.mocked(sendSupportMessage).mockResolvedValue({ success: true });
  });

  // ── Role Separation and Layout Routing ───────────────────
  it("should render Mentee help content when pathname reflects a mentee user space", () => {
    mockPathname = "/dashboard/mentee";
    render(<HelpCenter />);

    expect(screen.getByText("mentee")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search mentee FAQs..."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How do I sign up as a mentee?"),
    ).toBeInTheDocument();
  });

  it("should render Mentor help content when pathname reflects a mentor user space", () => {
    mockPathname = "/dashboard/mentor";
    render(<HelpCenter />);

    expect(screen.getByText("mentor")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search mentor FAQs..."),
    ).toBeInTheDocument();
    expect(screen.getByText("How do I accept a session?")).toBeInTheDocument();
  });

  // ── Search & Filter Management Layout Layers ─────────────
  it("should filter the visual FAQ matrix dynamically based on search keyword inputs", () => {
    render(<HelpCenter />);

    const searchInput = screen.getByPlaceholderText("Search mentee FAQs...");
    fireEvent.change(searchInput, { target: { value: "payments" } });

    expect(
      screen.getByText("What payments do you accept?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("How do I sign up as a mentee?"),
    ).not.toBeInTheDocument();
  });

  it("should display a clean empty search result block when text entry yields no matches", () => {
    render(<HelpCenter />);

    const searchInput = screen.getByPlaceholderText("Search mentee FAQs...");
    fireEvent.change(searchInput, {
      target: { value: "Unobtainable Keyword Phrase Match" },
    });

    expect(screen.getByText(/No results for/i)).toBeInTheDocument();
  });

  it("should isolate specific FAQ nodes when explicit category tabs capture selection clicks", () => {
    render(<HelpCenter />);

    const billingTab = screen.getByRole("button", { name: "Billing" });
    fireEvent.click(billingTab);

    expect(
      screen.getByText("What payments do you accept?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("How do I sign up as a mentee?"),
    ).not.toBeInTheDocument();
  });

  // ── Subcomponent Prop Delegation and Interactivity ──────
  it("should trigger expansion toggle state assignments upon interaction with custom items", () => {
    render(<HelpCenter />);

    const faqQuestionButton = screen.getByRole("button", {
      name: "How do I sign up as a mentee?",
    });

    // Initial closed state check
    expect(
      screen.queryByText("Go to registration page."),
    ).not.toBeInTheDocument();

    // Fire expansion click trigger
    fireEvent.click(faqQuestionButton);
    expect(screen.getByText("Go to registration page.")).toBeInTheDocument();

    // Collapse click toggle verification
    fireEvent.click(faqQuestionButton);
    expect(
      screen.queryByText("Go to registration page."),
    ).not.toBeInTheDocument();
  });

  // ── Contact Form Processing and API Mutations ────────────
  it("should validate entries, execute post updates, and transition smoothly onto a success splash", async () => {
    render(<HelpCenter />);

    const emailInput = screen.getByPlaceholderText("Your email address");
    const subjectInput = screen.getByPlaceholderText("Subject");
    const messageInput = screen.getByPlaceholderText("Describe your issue...");
    const submitBtn = screen.getByRole("button", { name: "Send Message" });

    fireEvent.change(emailInput, { target: { value: "user@leapmentor.com" } });
    fireEvent.change(subjectInput, {
      target: { value: "Missing Transaction Token" },
    });
    fireEvent.change(messageInput, {
      target: { value: "My payment went through but tokens are zero." },
    });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(sendSupportMessage).toHaveBeenCalledWith(
      {
        email: "user@leapmentor.com",
        subject: "Missing Transaction Token",
        message: "My payment went through but tokens are zero.",
      },
      "mentee",
    );

    expect(screen.getByText("Message sent!")).toBeInTheDocument();
  });

  it("should output localized system error notice messages if the backend endpoint fails", async () => {
    vi.mocked(sendSupportMessage).mockRejectedValueOnce(
      new Error("Database write error"),
    );
    render(<HelpCenter />);

    const submitBtn = screen.getByRole("button", { name: "Send Message" });

    await act(async () => {
      fireEvent.submit(submitBtn.closest("form"));
    });

    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  it("should support clearing out the success overlay context layout to send another message", async () => {
    render(<HelpCenter />);

    await act(async () => {
      fireEvent.submit(
        screen.getByRole("button", { name: "Send Message" }).closest("form"),
      );
    });

    const resetBtn = screen.getByRole("button", { name: "Send another" });
    fireEvent.click(resetBtn);

    expect(
      screen.getByRole("button", { name: "Send Message" }),
    ).toBeInTheDocument();
  });
});
