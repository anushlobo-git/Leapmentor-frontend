import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "./Hero";

// Mock external presentational subcomponents using path aliases
vi.mock("@components/ui/LetterBall", () => ({
  default: ({ letter, color, size }) => (
    <span
      data-testid="mock-letter-ball"
      data-letter={letter}
      data-color={color}
      data-size={size}
    >
      {letter}
    </span>
  ),
}));

vi.mock("@features/marketing/components/HeroSlider", () => ({
  default: () => (
    <div data-testid="mock-hero-slider">Hero Slider Component</div>
  ),
}));

describe("Hero", () => {
  it("should render the hero section, layout text components, social proof list, and child slider module", () => {
    render(<Hero />);

    // Assert main marketing copy text elements are rendered accurately
    const primaryHeading = screen.getByRole("heading", {
      name: /empower your growth with expert mentorship/i,
    });
    expect(primaryHeading).toBeInTheDocument();

    const valuePropositionText = screen.getByText(
      /leapmentor connects ambitious professionals with industry leaders/i,
    );
    expect(valuePropositionText).toBeInTheDocument();

    // Verify social proof statistical callout string renders successfully
    expect(screen.getByText(/joined by/i)).toBeInTheDocument();
    expect(screen.getByText("5,000+")).toBeInTheDocument();
    expect(screen.getByText(/mentees this month/i)).toBeInTheDocument();

    // Verify mapped rendering loop parameters for LetterBall child elements
    const letterBalls = screen.getAllByTestId("mock-letter-ball");
    expect(letterBalls.length).toBe(3);

    // Verify structural props mapping values passed down correctly to child nodes
    expect(letterBalls[0].getAttribute("data-letter")).toBe("A");
    expect(letterBalls[0].getAttribute("data-color")).toBe("bg-pink-400");
    expect(letterBalls[0].getAttribute("data-size")).toBe("md");

    expect(letterBalls[1].getAttribute("data-letter")).toBe("B");
    expect(letterBalls[1].getAttribute("data-color")).toBe("bg-yellow-400");

    expect(letterBalls[2].getAttribute("data-letter")).toBe("C");
    expect(letterBalls[2].getAttribute("data-color")).toBe("bg-green-400");

    // Verify high-level companion section wrapper elements appear cleanly
    expect(screen.getByTestId("mock-hero-slider")).toBeInTheDocument();
  });
});
