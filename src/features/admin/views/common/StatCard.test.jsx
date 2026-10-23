import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard";

describe("StatCard", () => {
  const defaultProps = {
    label: "Total Users",
    value: 1250,
    sub: "Active this month",
    icon: <span data-testid="mock-icon">icon</span>,
    trend: undefined,
  };

  it("should render the card with default accent color and provided basic props", () => {
    render(<StatCard {...defaultProps} sub={null} />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();

    // Validate default accent color applications (#2563eb)
    const iconContainer = screen.getByTestId("mock-icon").parentElement;
    expect(iconContainer).toHaveStyle({ color: "#2563eb" });
  });

  it("should conditionally render subtext when sub prop is provided", () => {
    render(<StatCard {...defaultProps} sub="Active this month" />);

    expect(screen.getByText("Active this month")).toBeInTheDocument();
  });

  it("should render fallback placeholder string when value is null or undefined", () => {
    render(<StatCard {...defaultProps} value={null} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should render positive trend indicators and formatting when trend is greater than or equal to 0", () => {
    render(<StatCard {...defaultProps} trend={12} />);

    expect(screen.getByText("12%")).toBeInTheDocument();

    // Check line and polyline paths for the positive direction
    const svgElement = screen
      .getByText("12%")
      .parentElement.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
    expect(svgElement.querySelector("polyline")).toBeInTheDocument();
  });

  it("should render negative trend indicators and formatting when trend is less than 0", () => {
    render(<StatCard {...defaultProps} trend={-8} />);

    // Math.abs should make the displayed value positive
    expect(screen.getByText("8%")).toBeInTheDocument();

    const svgElement = screen
      .getByText("8%")
      .parentElement.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("should apply custom accent configurations to styles and icons when provided", () => {
    const customAccent = "#ff5733";
    render(<StatCard {...defaultProps} accent={customAccent} />);

    const iconContainer = screen.getByTestId("mock-icon").parentElement;
    expect(iconContainer).toHaveStyle({ color: customAccent });
  });
});
