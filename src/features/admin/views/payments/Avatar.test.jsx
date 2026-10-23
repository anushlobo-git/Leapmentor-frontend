import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("should render initials and the correct color index for a standard two-word name", () => {
    // "John Doe" -> initials "JD" -> "J" code point is 74 -> 74 % 5 = 4 -> AVATAR_COLORS[4] = "#d97706"
    render(<Avatar name="John Doe" />);

    const avatarElement = screen.getByText("JD");
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveStyle({ background: "#d97706" });
  });

  it("should render a single initial when a single-word name is provided", () => {
    // "Alice" -> initials "A" -> "A" code point is 65 -> 65 % 5 = 0 -> AVATAR_COLORS[0] = "#2563eb"
    render(<Avatar name="Alice" />);

    const avatarElement = screen.getByText("A");
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveStyle({ background: "#2563eb" });
  });

  it("should truncate initials to a maximum of 2 characters when a multi-word name is given", () => {
    // "Alex John Doe" -> initials "AJD" -> sliced to "AJ" -> "A" code point is 65 -> 65 % 5 = 0 -> AVATAR_COLORS[0] = "#2563eb"
    render(<Avatar name="Alex John Doe" />);

    const avatarElement = screen.getByText("AJ");
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveStyle({ background: "#2563eb" });
  });

  it("should render '?' fallback and the correct color when the name prop is empty or missing", () => {
    // undefined name -> fallback "?" -> "?" code point is 63 -> 63 % 5 = 3 -> AVATAR_COLORS[3] = "#059669"
    render(<Avatar name={undefined} />);

    const avatarElement = screen.getByText("?");
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveStyle({ background: "#059669" });
  });

  it("should render '?' fallback when an empty string is provided as the name", () => {
    render(<Avatar name="" />);

    const avatarElement = screen.getByText("?");
    expect(avatarElement).toBeInTheDocument();
  });
});
