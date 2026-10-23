import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TestimonialCard from "./TestimonialCard";

// Mocking ui presentation building blocks
vi.mock("@components/ui/Card", () => ({
  default: ({ children, className }) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@components/ui/StarRating", () => ({
  default: ({ count }) => (
    <span data-testid="mock-star-rating">Stars: {count}</span>
  ),
}));

vi.mock("@components/ui/LetterBall", () => ({
  default: ({ letter, color, size }) => (
    <span data-testid="mock-letter-ball" data-color={color} data-size={size}>
      {letter}
    </span>
  ),
}));

describe("TestimonialCard", () => {
  const mockTestimonial = {
    text: "This platform completely changed the trajectory of my career. My mentor provided invaluable architectural design reviews.",
    letter: "A",
    color: "bg-violet-500",
    name: "Alex Johnson",
    role: "Software Engineer",
    company: "Stripe",
    rating: 5,
  };

  it("should render default template style options when both active and dimmed are false", () => {
    render(
      <TestimonialCard
        testimonial={mockTestimonial}
        active={false}
        dimmed={false}
      />,
    );

    const card = screen.getByTestId("mock-card");
    expect(card).toBeInTheDocument();

    // Ensure the default transitions class is passed without active or dimmed variants
    expect(card).toHaveClass("p-6 transition-all duration-300");
    expect(card).not.toHaveClass("border-violet-100 shadow-xl scale-100");
    expect(card).not.toHaveClass(
      "bg-white/70 border-gray-100 shadow-sm opacity-50 scale-95",
    );

    // Assert internal metadata structure maps into fields cleanly
    expect(screen.getByText(mockTestimonial.text)).toBeInTheDocument();
    expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer · Stripe")).toBeInTheDocument();

    // Verify sub-component parameter distributions
    const letterBall = screen.getByTestId("mock-letter-ball");
    expect(letterBall).toHaveTextContent("A");
    expect(letterBall).toHaveAttribute("data-color", "bg-violet-500");
    expect(letterBall).toHaveAttribute("data-size", "lg");

    expect(screen.getByTestId("mock-star-rating")).toHaveTextContent(
      "Stars: 5",
    );
  });

  it("should apply active structural highlight styling metrics when active is set to true", () => {
    render(
      <TestimonialCard
        testimonial={mockTestimonial}
        active={true}
        dimmed={false}
      />,
    );

    const card = screen.getByTestId("mock-card");
    expect(card).toHaveClass("border-violet-100 shadow-xl scale-100");
  });

  it("should apply dimmed structural layout styles when dimmed is set to true and active is false", () => {
    render(
      <TestimonialCard
        testimonial={mockTestimonial}
        active={false}
        dimmed={true}
      />,
    );

    const card = screen.getByTestId("mock-card");
    expect(card).toHaveClass(
      "bg-white/70 border-gray-100 shadow-sm opacity-50 scale-95",
    );
  });

  it("should prioritize active styles over dimmed styles if both attributes evaluate to true concurrently", () => {
    render(
      <TestimonialCard
        testimonial={mockTestimonial}
        active={true}
        dimmed={true}
      />,
    );

    const card = screen.getByTestId("mock-card");
    expect(card).toHaveClass("border-violet-100 shadow-xl scale-100");
    expect(card).not.toHaveClass(
      "bg-white/70 border-gray-100 shadow-sm opacity-50 scale-95",
    );
  });
});
