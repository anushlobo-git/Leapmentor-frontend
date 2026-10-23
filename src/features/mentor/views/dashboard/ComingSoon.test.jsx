import { render, screen } from "@testing-library/react";
import ComingSoon from "./ComingSoon";

describe("ComingSoon component", () => {
  it("renders with icon, title, desc and coming soon text badge", () => {
    render(
      <ComingSoon
        icon="🚀"
        title="New Feature Tab"
        desc="This tab is currently in development."
      />,
    );

    expect(screen.getByText("🚀")).toBeInTheDocument();
    expect(screen.getByText("New Feature Tab")).toBeInTheDocument();
    expect(
      screen.getByText("This tab is currently in development."),
    ).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });
});
