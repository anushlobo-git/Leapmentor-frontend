import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import Testimonials from "./Testimonials";

// ── Mock Presentational Child Layouts ────────────────────
vi.mock("@features/marketing/components/TestimonialCard", () => ({
  default: vi.fn(({ testimonial, active, dimmed }) => (
    <div
      data-testid="testimonial-card"
      data-active={active ? "true" : "false"}
      data-dimmed={dimmed ? "true" : "false"}
    >
      {testimonial.name}
    </div>
  )),
}));

vi.mock("@components/ui/StatCard", () => ({
  default: vi.fn(({ value, label }) => (
    <div data-testid="stat-card">
      <span>{value}</span>
      <span>{label}</span>
    </div>
  )),
}));

vi.mock("@components/ui/SideArrow", () => ({
  default: vi.fn(({ onClick, direction }) => (
    <button data-testid={`arrow-${direction}`} onClick={onClick}>
      {direction}
    </button>
  )),
}));

describe("Testimonials", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial Mount and Setup Layout Branches ─────────────
  it("should render headers, metrics metrics rows, and carousel segments accurately", () => {
    render(<Testimonials />);

    expect(screen.getByText("What Our Community Says")).toBeInTheDocument();
    expect(screen.getByText("Real stories, real growth")).toBeInTheDocument();

    const stats = screen.getAllByTestId("stat-card");
    expect(stats).toHaveLength(3);
    expect(screen.getByText("5,000+")).toBeInTheDocument();

    const initialCards = screen.getAllByTestId("testimonial-card");
    expect(initialCards[0]).toHaveAttribute("data-dimmed", "true"); // Rohit Joshi (Index 5)
    expect(initialCards[1]).toHaveAttribute("data-active", "true"); // Priya Sharma (Index 0)
    expect(initialCards[2]).toHaveAttribute("data-dimmed", "true"); // Arjun Mehta (Index 1)
  });

  // ── Automatic Carousel Sliding Rotation Intervals ────────
  it("should advance active indices automatically when standard 4000ms intervals cycle out", () => {
    render(<Testimonials />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Arjun Mehta");
  });

  // ── Navigation Arrow Control Click Handlers ──────────────
  it("should advance carousel forward cleanly when right arrow elements capture clicks", () => {
    render(<Testimonials />);

    const rightArrow = screen.getByTestId("arrow-right");
    fireEvent.click(rightArrow);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Arjun Mehta");
  });

  it("should regress carousel index backwards safely when left arrow elements catch clicks", () => {
    render(<Testimonials />);

    const leftArrow = screen.getByTestId("arrow-left");
    fireEvent.click(leftArrow);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Rohit Joshi");
  });

  // ── Background Preview Click Target Elements ─────────────
  it("should cycle carousel view when secondary dim preview cards trigger click handlers", () => {
    render(<Testimonials />);

    // Securely target the next card's button wrapper using its contents to avoid DOM ordering mismatches
    const nextDimmedCardButton = screen
      .getByText("Arjun Mehta")
      .closest("button");
    fireEvent.click(nextDimmedCardButton);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Arjun Mehta");
  });

  // ── Inline Pagination Dot Indicator Buttons ──────────────
  it("should shift current view cleanly towards mapped coordinate states when navigation dots are selected", () => {
    render(<Testimonials />);

    // Gather all dot buttons by filtering out the layout navigation arrow keys and side containers
    const dots = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          !btn.getAttribute("data-testid") && !btn.className.includes("w-1/3"),
      );

    // The component design executes a singular step move (go(1) or go(-1)) based on an index delta comparison check, rather than a direct jump.
    // Clicking index 2 when active is 0 moves forward exactly 1 space to index 1.
    fireEvent.click(dots[2]);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Arjun Mehta");
  });

  // ── Short-Circuit Animation Guard Lock Branches ──────────
  it("should apply stylistic opacity scales and block parallel adjustments during active transition loops", () => {
    render(<Testimonials />);

    const rightArrow = screen.getByTestId("arrow-right");

    fireEvent.click(rightArrow);
    fireEvent.click(rightArrow);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCardsCount = screen
      .getAllByTestId("testimonial-card")
      .filter((c) => c.getAttribute("data-active") === "true");
    expect(activeCardsCount).toHaveLength(1);
  });

  it("should completely drop pagination dot click events if dot represents the current active item", () => {
    render(<Testimonials />);

    const dots = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          !btn.getAttribute("data-testid") && !btn.className.includes("w-1/3"),
      );
    fireEvent.click(dots[0]);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const activeCard = screen
      .getAllByTestId("testimonial-card")
      .find((c) => c.getAttribute("data-active") === "true");
    expect(activeCard.textContent).toBe("Priya Sharma");
  });
});
