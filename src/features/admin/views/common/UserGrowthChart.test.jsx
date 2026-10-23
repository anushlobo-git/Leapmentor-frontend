import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserGrowthChart from "./UserGrowthChart";

describe("UserGrowthChart", () => {
  test("shows empty state when no data", () => {
    render(<UserGrowthChart data={[]} />);
    expect(screen.getByText("No growth data yet.")).toBeInTheDocument();
  });

  test("renders chart, range buttons, and shows tooltip on hover", async () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      label: `Day ${i + 1}`,
      count: i + 1,
    }));

    const { container } = render(<UserGrowthChart data={data} />);

    // Title and buttons
    expect(screen.getByText("User Growth")).toBeInTheDocument();
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByText("30D")).toBeInTheDocument();
    expect(screen.getByText("90D")).toBeInTheDocument();

    // svg renders
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Find the transparent hit-rects used for mouse interactions and hover the first
    const hitRects = Array.from(container.querySelectorAll("rect")).filter(
      (r) => r.getAttribute("fill") === "transparent",
    );
    expect(hitRects.length).toBeGreaterThan(0);

    fireEvent.mouseEnter(hitRects[0]);

    await waitFor(() => {
      // 'Day 1' can appear in both the tooltip and axis labels; ensure at least one exists
      const days = screen.getAllByText("Day 1");
      expect(days.length).toBeGreaterThan(0);
      expect(screen.getByText("1 users")).toBeInTheDocument();
    });
  });
});
