import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComingSoon from "./ComingSoon";

describe("ComingSoon", () => {
  it("renders icon, title, description and badge", () => {
    render(
      <ComingSoon
        icon={<span>★</span>}
        title="New Feature"
        desc="Short desc"
      />,
    );

    expect(screen.getByText("★")).toBeInTheDocument();
    expect(screen.getByText(/New Feature/i)).toBeInTheDocument();
    expect(screen.getByText(/Short desc/i)).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/i)).toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });
});
