import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MentorIndustryChart from "@features/admin/components/common/MentorIndustryChart";

describe("MentorIndustryChart", () => {
  it("renders an empty state when no data is available", () => {
    render(<MentorIndustryChart data={[]} />);

    expect(
      screen.getByText(/No industry data available yet/i),
    ).toBeInTheDocument();
  });

  it("renders chart data and labels when data is provided", () => {
    const data = [
      { industry: "Engineering", count: 10 },
      { industry: "Design", count: 4 },
    ];

    render(<MentorIndustryChart data={data} />);

    expect(
      screen.getByText(/Mentor Industry Distribution/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Design/i)).toBeInTheDocument();
  });

  it("renders the chart for zero-count data", () => {
    render(
      <MentorIndustryChart data={[{ industry: "Operations", count: 0 }]} />,
    );

    expect(screen.getByText(/Operations/i)).toBeInTheDocument();
  });

  it("renders the chart for medium and large datasets", () => {
    const mediumData = Array.from({ length: 6 }, (_, index) => ({
      industry: `Industry ${index + 1}`,
      count: index + 1,
    }));
    const largeData = Array.from({ length: 7 }, (_, index) => ({
      industry: `Industry ${index + 1}`,
      count: index + 1,
    }));

    const { rerender } = render(<MentorIndustryChart data={mediumData} />);
    expect(screen.getByText(/Industry 6/i)).toBeInTheDocument();

    rerender(<MentorIndustryChart data={largeData} />);
    expect(screen.getByText(/Industry 7/i)).toBeInTheDocument();
  });
});
