import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConnectCard from "./ConnectCard";

describe("ConnectCard", () => {
  it("renders name, role/company and skills and token label", () => {
    const person = {
      currentRole: "Senior Engineer",
      company: "Acme",
      skills: ["React", "Node"],
      profilePicture: "",
    };
    const session = { totalAmount: 50 };
    const mockClick = vi.fn();

    render(
      <ConnectCard
        name="Jane Doe"
        person={person}
        session={session}
        tokenLabel="50 tokens"
        onDashboardClick={mockClick}
      />,
    );

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Senior Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/50 tokens/)).toBeInTheDocument();
  });

  it("falls back to initials when image errors", () => {
    const person = {
      currentRole: "Engineer",
      profilePicture: "http://example.com/bad.jpg",
    };
    const mockClick = vi.fn();

    render(
      <ConnectCard
        name="Al Bus"
        person={person}
        session={{}}
        tokenLabel=""
        onDashboardClick={mockClick}
      />,
    );

    const img = screen.getByRole("img", { name: /Al Bus/i });
    // simulate image error
    fireEvent.error(img);

    // initials should show (AB)
    expect(screen.getByText(/AB/)).toBeInTheDocument();
  });

  it("calls onDashboardClick when button clicked", () => {
    const mockClick = vi.fn();
    render(
      <ConnectCard
        name="Sam"
        person={{}}
        session={{}}
        tokenLabel=""
        onDashboardClick={mockClick}
      />,
    );
    const btn = screen.getByRole("button", {
      name: /Go to Shared Dashboard|View Session & Notes/i,
    });
    fireEvent.click(btn);
    expect(mockClick).toHaveBeenCalled();
  });
});
