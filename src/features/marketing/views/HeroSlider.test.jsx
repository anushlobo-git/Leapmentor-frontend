import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import HeroSlider from "./HeroSlider";

// ── Mock Subcomponents for Layout Verification ─────────────────────────────
vi.mock("@components/ui/SuccessCard", () => ({
  default: () => (
    <div data-testid="mock-success-card">Success Card Content</div>
  ),
}));

describe("HeroSlider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial State Rendering & Style Branch Evaluation ─────────────────────
  it("should render structural slider layout elements with initial image visible", () => {
    render(<HeroSlider />);

    expect(screen.getByTestId("mock-success-card")).toBeInTheDocument();

    const slide1 = screen.getByAltText("Slide 1");
    const slide2 = screen.getByAltText("Slide 2");
    const slide3 = screen.getByAltText("Slide 3");

    // Verify correct properties and style opacities for baseline state
    expect(slide1).toHaveStyle({ opacity: "1" });
    expect(slide2).toHaveStyle({ opacity: "0" });
    expect(slide3).toHaveStyle({ opacity: "0" });
  });

  // ── Animation Timeline Progression Coverage ──────────────────────────────
  it("should toggle slide opacities down when the fade-out timer interval fires", () => {
    render(<HeroSlider />);

    const slide1 = screen.getByAltText("Slide 1");

    // Advance to SLIDE_INTERVAL_MS (3000ms) to trigger fade-out transition block
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // When current === i but fade is false, opacity should evaluate to 0
    expect(slide1).toHaveStyle({ opacity: "0" });
  });

  it("should switch indices and restore visibility settings when transition timeout completes", () => {
    render(<HeroSlider />);

    const slide1 = screen.getByAltText("Slide 1");
    const slide2 = screen.getByAltText("Slide 2");

    // Advance past interval (3000ms) + fade timeout duration (400ms)
    act(() => {
      vi.advanceTimersByTime(3400);
    });

    // Verification that index has shifted to the second image slot smoothly
    expect(slide1).toHaveStyle({ opacity: "0" });
    expect(slide2).toHaveStyle({ opacity: "1" });
  });

  // ── Circular Array Wrapping Loop Check ────────────────────────────────────
  it("should seamlessly wrap index tracking pointers back to zero upon reaching boundary limits", () => {
    render(<HeroSlider />);

    const slide1 = screen.getByAltText("Slide 1");
    const slide3 = screen.getByAltText("Slide 3");

    // Loop all the way through the 3 image slots (3 full cycles * 3400ms)
    act(() => {
      vi.advanceTimersByTime(3400 * 3);
    });

    // Verify index correctly rotated back to index 0 element positions
    expect(slide3).toHaveStyle({ opacity: "0" });
    expect(slide1).toHaveStyle({ opacity: "1" });
  });

  // ── Component Unmount Disposal Loop Coverage ──────────────────────────────
  it("should clear background intervals cleanly during component lifecycle unmounting", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(<HeroSlider />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
