import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Missions from "./Missions";
import FeatureCard from "@features/marketing/components/FeatureCard";

// Mock the child FeatureCard component to isolate testing of prop-mapping and grid mapping logic
vi.mock("@features/marketing/components/FeatureCard", () => ({
  default: vi.fn(({ icon, title, description }) => (
    <div data-testid="mock-feature-card">
      <span data-testid="card-title">{title}</span>
      <span data-testid="card-description">{description}</span>
      <div data-testid="card-icon-container">{icon}</div>
    </div>
  )),
}));

describe("Missions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main headers, subtitles, and introductory section text correctly", () => {
    render(<Missions />);

    expect(screen.getByText("Why Choose LeapMentor?")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Designed for your career success/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We provide more than just a chat; we provide a roadmap for your professional evolution.",
      ),
    ).toBeInTheDocument();
  });

  it("should render exactly three mapped FeatureCard component instances in the layout grid", () => {
    render(<Missions />);

    const featureCards = screen.getAllByTestId("mock-feature-card");
    expect(featureCards).toHaveLength(3);
    expect(FeatureCard).toHaveBeenCalledTimes(3);
  });

  it("should forward the correct structured title, description, and SVG icon props to each FeatureCard", () => {
    render(<Missions />);

    const titles = screen
      .getAllByTestId("card-title")
      .map((el) => el.textContent);
    const descriptions = screen
      .getAllByTestId("card-description")
      .map((el) => el.textContent);
    const iconContainers = screen.getAllByTestId("card-icon-container");

    // Verify first feature card mapping data: Verified Mentors
    expect(titles[0]).toBe("Verified Mentors");
    expect(descriptions[0]).toContain(
      "Every mentor on LeapMentor creates a detailed profile",
    );
    expect(iconContainers[0].querySelector("svg")).toBeInTheDocument();

    // Verify second feature card mapping data: Flexible Scheduling
    expect(titles[1]).toBe("Flexible Scheduling");
    expect(descriptions[1]).toContain(
      "Book sessions based on your mentor's real-time availability.",
    );
    expect(iconContainers[1].querySelector("svg")).toBeInTheDocument();

    // Verify third feature card mapping data: Structured Growth
    expect(titles[2]).toBe("Structured Growth");
    expect(descriptions[2]).toContain(
      "Set goals, break them into milestones, track session completion",
    );
    expect(iconContainers[2].querySelector("svg")).toBeInTheDocument();
  });
});
