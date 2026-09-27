import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Testimonials, {
  getCardStateClassName,
  TestimonialCard,
} from "./TestimonialsWidget";

describe("TestimonialsWidget", () => {
  let uuidSpy;
  beforeEach(() => {
    vi.useFakeTimers();
    // make crypto.randomUUID stable for tests when available
    if (
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      uuidSpy = vi
        .spyOn(globalThis.crypto, "randomUUID")
        .mockReturnValue("fixed-uuid");
    }
  });
  afterEach(() => {
    vi.useRealTimers();
    if (uuidSpy) uuidSpy.mockRestore();
  });

  it("renders header and stats and initial testimonial", () => {
    render(<Testimonials />);

    expect(screen.getByText(/What Our Community Says/i)).toBeInTheDocument();
    expect(screen.getByText(/Real stories, real growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Mentees Helped/i)).toBeInTheDocument();

    // initial testimonial text (first item)
    expect(
      screen.getByText(
        /LeapMentor completely transformed my career trajectory/i,
      ),
    ).toBeInTheDocument();
  });

  it("changes visible testimonial when dot is clicked", () => {
    render(<Testimonials />);

    const dotButtons = screen.getAllByLabelText(/Show testimonial from/i);
    expect(dotButtons.length).toBeGreaterThan(1);

    // click second testimonial's dot
    fireEvent.click(dotButtons[1]);
    // advance timers for the internal animation delay
    vi.advanceTimersByTime(300);

    expect(
      screen.getByText(/I was stuck in the same role for 3 years\./i),
    ).toBeInTheDocument();
  });

  it("navigates using prev/next buttons and respects animating guard", () => {
    const { container } = render(<Testimonials />);

    const nextButton = screen.getAllByLabelText(/Show next testimonial/i)[0];
    const prevButton = screen.getAllByLabelText(
      /Show previous testimonial/i,
    )[0];

    // move next once -> Arjun Mehta
    act(() => {
      fireEvent.click(nextButton);
      vi.advanceTimersByTime(300);
    });
    const activeCard = container.querySelector(".shadow-xl");
    expect(activeCard).toBeTruthy();
    expect(activeCard.textContent).toContain("Arjun Mehta");

    // move next again -> Sneha Reddy
    act(() => {
      fireEvent.click(nextButton);
      vi.advanceTimersByTime(300);
    });
    const activeCard2 = container.querySelector(".shadow-xl");
    expect(activeCard2).toBeTruthy();
    expect(activeCard2.textContent).toContain("Sneha Reddy");

    // go back previous -> Arjun Mehta
    act(() => {
      fireEvent.click(prevButton);
      vi.advanceTimersByTime(300);
    });
    const activeCard3 = container.querySelector(".shadow-xl");
    expect(activeCard3.textContent).toContain("Arjun Mehta");
  });

  it("getCardStateClassName returns expected classes and TestimonialCard renders stars", () => {
    expect(getCardStateClassName(true, false)).toContain("shadow-xl");
    expect(getCardStateClassName(false, true)).toContain("opacity-50");
    expect(getCardStateClassName(false, false)).toContain("border-gray-100");

    // render TestimonialCard directly to assert star count
    const sample = {
      name: "X",
      role: "R",
      company: "C",
      avatar: "A",
      color: "bg-red-500",
      rating: 3,
      text: "hi",
    };
    const { container } = render(<TestimonialCard testimonial={sample} />);
    // count star svgs inside the card (there are additional svg icons; check for star path presence)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it("TestimonialCard active and dimmed class variants render correctly", () => {
    const sample = {
      name: "A",
      role: "R",
      company: "C",
      avatar: "AV",
      color: "bg-blue-500",
      rating: 4,
      text: "t",
    };
    const { container: c1 } = render(
      <TestimonialCard testimonial={sample} active />,
    );
    expect(c1.firstChild.className).toMatch(/shadow-xl/);

    const { container: c2 } = render(
      <TestimonialCard testimonial={sample} dimmed />,
    );
    expect(c2.firstChild.className).toMatch(/opacity-50/);
  });

  it("dots show active width and clicking active dot is a no-op", () => {
    const { container } = render(<Testimonials />);
    const dotButtons = screen.getAllByLabelText(/Show testimonial from/i);
    // first dot is active initially
    expect(dotButtons[0].style.width).toBe("24px");
    // clicking the active dot should not change active
    fireEvent.click(dotButtons[0]);
    vi.advanceTimersByTime(300);
    const activeCard = container.querySelector(".shadow-xl");
    expect(activeCard.textContent).toContain("Priya Sharma");
  });

  it("top prev/next buttons trigger navigation", () => {
    const { container } = render(<Testimonials />);
    // top nav buttons have class including 'w-10 h-10' — find them
    const navButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) =>
        b.className &&
        b.className.includes("w-10") &&
        b.className.includes("h-10"),
    );
    expect(navButtons.length).toBeGreaterThanOrEqual(2);

    const [prevTop, nextTop] = [
      navButtons[0],
      navButtons[navButtons.length - 1],
    ];

    act(() => {
      fireEvent.click(nextTop);
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector(".shadow-xl").textContent).toContain(
      "Arjun Mehta",
    );

    act(() => {
      fireEvent.click(prevTop);
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector(".shadow-xl").textContent).toContain(
      "Priya Sharma",
    );
  });

  it("go early-return when animating is true", () => {
    const { container } = render(<Testimonials />);
    const dotButtons = screen.getAllByLabelText(/Show testimonial from/i);
    const navButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) =>
        b.className &&
        b.className.includes("w-10") &&
        b.className.includes("h-10"),
    );
    const nextTop = navButtons[navButtons.length - 1];

    // click a dot to set animating true synchronously, then immediately call go(1)
    fireEvent.click(dotButtons[1]);
    // do not advance timers yet; animating should be true and nextTop should be ignored
    fireEvent.click(nextTop);

    // advance timers to finish the dot transition
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // after timers, active should be the dot we clicked (Arjun Mehta)
    expect(container.querySelector(".shadow-xl").textContent).toContain(
      "Arjun Mehta",
    );
  });
});
