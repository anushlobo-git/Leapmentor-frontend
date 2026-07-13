import { render } from "@testing-library/react";
import MentorCardSkeleton from "./MentorCardSkeleton";

describe("MentorCardSkeleton", () => {
  it("renders correct structure of shimmer elements", () => {
    const { container } = render(<MentorCardSkeleton />);
    const shimmers = container.querySelectorAll(".animate-pulse");
    // Shimmer is called 11 times in total inside MentorCardSkeleton
    expect(shimmers.length).toBe(11);
  });
});
