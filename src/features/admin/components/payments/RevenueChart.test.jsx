import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RevenueChart from "./RevenueChart";

// Mock the constants module to avoid dependency issues during the test suite execution
vi.mock("@features/admin/constants/payments.constants", () => ({
  MONO: "monospace",
}));

describe("RevenueChart", () => {
  it("should render the loading skeleton state when loading is true", () => {
    const { container } = render(<RevenueChart data={[]} loading={true} />);

    // Check for the presence of the pulse animation class
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle({ background: "#f1f5f9" });
  });

  it("should return null and render nothing when data is empty and not loading", () => {
    const { container } = render(<RevenueChart data={[]} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should format and render values under 1000 and over 1000 correctly on the Y-Axis", () => {
    const mockData = [
      { amount: 500, label: "Jan" },
      { amount: 2500, label: "Feb" },
      { amount: 1000, label: "Mar" },
    ];

    render(<RevenueChart data={mockData} loading={false} />);

    // Under 1000 check: min value is 500, format should output standard string
    expect(screen.getByText("500")).toBeInTheDocument();

    // Over 1000 check: max value is 2500, format should output optimized 'k' string
    expect(screen.getByText("2.5k")).toBeInTheDocument();

    // Check presence of X-Axis labels
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
  });

  it("should handle uniform flat data successfully where max minus min equals zero", () => {
    const mockData = [
      { amount: 1000, label: "Week 1" },
      { amount: 1000, label: "Week 2" },
    ];

    const { container } = render(
      <RevenueChart data={mockData} loading={false} />,
    );

    // Verify paths are generated properly without dividing by zero errors
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2); // One for area layer, one for line stroke layer
  });

  it("should display the interactive tooltip on hover and remove it on mouse exit", async () => {
    const user = userEvent.setup();
    const mockData = [
      { amount: 800, label: "Point Alpha" },
      { amount: 1200, label: "Point Beta" },
    ];

    const { container } = render(
      <RevenueChart data={mockData} loading={false} />,
    );

    // Locate transparent interactive hover boundary boxes
    const hoverRegions = container.querySelectorAll("rect[fill='transparent']");
    expect(hoverRegions.length).toBe(2);

    // Initial state: tooltip LP value shouldn't be rendered anywhere
    expect(screen.queryByText("800 LP")).not.toBeInTheDocument();

    // Trigger mouse enter on the first item
    await user.hover(hoverRegions[0]);
    expect(screen.getByText("800 LP")).toBeInTheDocument();

    // Trigger mouse leave on the entire SVG viewport box
    const svgElement = container.querySelector("svg");
    await user.unhover(svgElement);
    expect(screen.queryByText("800 LP")).not.toBeInTheDocument();
  });

  it("should adjust tooltip coordinates boundaries correctly when item is close to constraints", async () => {
    const user = userEvent.setup();

    // Multi-item dataset avoids division by zero, with high values to push tooltip to bounds
    const mockData = [
      { amount: 100, label: "Low Point" },
      { amount: 5000, label: "High Edge Point" },
    ];

    const { container } = render(
      <RevenueChart data={mockData} loading={false} />,
    );
    const hoverRegions = container.querySelectorAll("rect[fill='transparent']");

    // Hover over the second item positioned at the far right and top edges
    await user.hover(hoverRegions[1]);

    // Verify that tooltip renders successfully and triggers boundary calculation caps
    expect(screen.getByText("5,000 LP")).toBeInTheDocument();
  });
});
