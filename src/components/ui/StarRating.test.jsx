import { render, screen } from "@testing-library/react";
import StarRating from "@components/ui/StarRating";

describe("StarRating", () => {
  it("renders default count of 5 stars", () => {
    render(<StarRating />);

    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(5);
  });

  it("renders the correct number of filled stars", () => {
    render(<StarRating count={3} total={5} />);

    const stars = screen.getAllByTestId("star-icon");
    const filledStars = stars.filter(
      (star) => star.getAttribute("fill") === "#FBBF24",
    );
    const emptyStars = stars.filter(
      (star) => star.getAttribute("fill") === "#D1D5DB",
    );

    expect(filledStars).toHaveLength(3);
    expect(emptyStars).toHaveLength(2);
  });

  it("renders all empty stars when count is zero", () => {
    render(<StarRating count={0} total={4} />);

    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(4);
    expect(stars.every((star) => star.getAttribute("fill") === "#D1D5DB")).toBe(
      true,
    );
  });

  it("renders all filled stars when count equals total", () => {
    render(<StarRating count={4} total={4} />);

    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(4);
    expect(stars.every((star) => star.getAttribute("fill") === "#FBBF24")).toBe(
      true,
    );
  });
});
