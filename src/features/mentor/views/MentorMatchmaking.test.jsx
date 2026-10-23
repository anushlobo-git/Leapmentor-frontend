/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorMatchmaking from "./MentorMatchmaking";

describe("MentorMatchmaking", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("should render all 9 mentors by default", () => {
    render(<MentorMatchmaking />);
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Ian Scott")).toBeInTheDocument();
    expect(screen.getAllByText("Book Session")).toHaveLength(9);
  });

  it("should filter mentors by industry", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    await user.selectOptions(
      screen.getByDisplayValue("All Industries"),
      "Legal",
    );

    expect(screen.getByText("Eva Green")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });

  it("should filter mentors by minimum rating", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    await user.type(screen.getByPlaceholderText("Min Rating"), "4.9");

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument(); // 4.9
    expect(screen.getByText("Clara Lee")).toBeInTheDocument(); // 5
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument(); // 4.7
  });

  it("should filter mentors by maximum hourly rate", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    await user.type(screen.getByPlaceholderText("Max Rate ($/hr)"), "55");

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument(); // $50
    expect(screen.queryByText("Frank Liu")).not.toBeInTheDocument(); // $120
  });

  it("should filter mentors by keyword matching name, skill, badge, or industry", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    await user.type(
      screen.getByPlaceholderText("Search by name, skill, badge, or industry"),
      "blockchain",
    );

    expect(screen.getByText("Frank Liu")).toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
  });

  it("should show a no-matches message when filters exclude every mentor", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    await user.type(
      screen.getByPlaceholderText("Search by name, skill, badge, or industry"),
      "nonexistent-skill-xyz",
    );

    expect(
      screen.getByText("No mentors match your filters."),
    ).toBeInTheDocument();
  });

  it("should open the booking modal with the selected mentor's details", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    const aliceCard = screen.getByText("Alice Johnson").closest("div");
    await user.click(aliceCard.parentElement.querySelector("button"));

    expect(
      screen.getByPlaceholderText("What do you want to ask or discuss?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("should close the modal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    const bookButtons = screen.getAllByText("Book Session");
    await user.click(bookButtons[0]);
    await user.click(screen.getByText("Cancel"));

    expect(
      screen.queryByPlaceholderText("What do you want to ask or discuss?"),
    ).not.toBeInTheDocument();
  });

  it("should call alert with the mentor name and discussion text on Confirm, then close the modal", async () => {
    const user = userEvent.setup();
    render(<MentorMatchmaking />);

    const bookButtons = screen.getAllByText("Book Session");
    await user.click(bookButtons[0]);

    await user.type(
      screen.getByPlaceholderText("What do you want to ask or discuss?"),
      "Career advice",
    );
    await user.click(screen.getByText("Confirm"));

    expect(window.alert).toHaveBeenCalledWith(
      "Session requested with Alice Johnson.\nDiscussion: Career advice",
    );
    expect(
      screen.queryByPlaceholderText("What do you want to ask or discuss?"),
    ).not.toBeInTheDocument();
  });
});
