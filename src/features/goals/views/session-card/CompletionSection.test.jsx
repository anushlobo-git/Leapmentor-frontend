import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CompletionSection from "./CompletionSection";

describe("CompletionSection", () => {
  it("renders both marks and the complete button when not marked by current user", () => {
    render(
      <CompletionSection
        slot={{ menteeMarked: false, mentorMarked: false }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={1}
        onMarkComplete={vi.fn()}
        onSessionComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/You haven't marked this session complete yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Waiting for Taylor to confirm/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    ).toBeInTheDocument();
  });

  it("renders current user as marked and other user pending when only current user marked", () => {
    render(
      <CompletionSection
        slot={{ menteeMarked: true, mentorMarked: false }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={2}
        onMarkComplete={vi.fn()}
        onSessionComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/You marked this session complete/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Waiting for Taylor to confirm/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Mark Session Complete/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the mentor view correctly when viewerRole is mentor", () => {
    render(
      <CompletionSection
        slot={{ menteeMarked: true, mentorMarked: false }}
        viewerRole="mentor"
        otherName="Taylor"
        slotIndex={6}
        onMarkComplete={vi.fn()}
        onSessionComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/You haven't marked this session complete yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Taylor marked this session complete/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    ).toBeInTheDocument();
  });

  it("renders completion badge when both parties marked complete", () => {
    render(
      <CompletionSection
        slot={{ menteeMarked: true, mentorMarked: true }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={3}
        onMarkComplete={vi.fn()}
        onSessionComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Session Completed by Both Parties/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Mark Session Complete/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onMarkComplete and onSessionComplete when marking complete succeeds", async () => {
    const onMarkComplete = vi.fn().mockResolvedValue({ success: true });
    const onSessionComplete = vi.fn();

    render(
      <CompletionSection
        slot={{ menteeMarked: false, mentorMarked: true }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={4}
        onMarkComplete={onMarkComplete}
        onSessionComplete={onSessionComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    );

    await waitFor(() => expect(onMarkComplete).toHaveBeenCalledWith(4));
    await waitFor(() => expect(onSessionComplete).toHaveBeenCalled());
  });

  it("does not call onSessionComplete when marking complete resolves without success", async () => {
    const onMarkComplete = vi.fn().mockResolvedValue({ success: false });
    const onSessionComplete = vi.fn();

    render(
      <CompletionSection
        slot={{ menteeMarked: false, mentorMarked: true }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={7}
        onMarkComplete={onMarkComplete}
        onSessionComplete={onSessionComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    );

    await waitFor(() => expect(onMarkComplete).toHaveBeenCalledWith(7));
    expect(onSessionComplete).not.toHaveBeenCalled();
  });

  it("handles missing onSessionComplete callback gracefully", async () => {
    const onMarkComplete = vi.fn().mockResolvedValue({ success: true });

    render(
      <CompletionSection
        slot={{ menteeMarked: false, mentorMarked: true }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={8}
        onMarkComplete={onMarkComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    );

    await waitFor(() => expect(onMarkComplete).toHaveBeenCalledWith(8));
  });

  it("disables the button while saving and shows saving state", async () => {
    const onMarkComplete = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 50),
          ),
      );
    const onSessionComplete = vi.fn();

    render(
      <CompletionSection
        slot={{ menteeMarked: false, mentorMarked: true }}
        viewerRole="mentee"
        otherName="Taylor"
        slotIndex={5}
        onMarkComplete={onMarkComplete}
        onSessionComplete={onSessionComplete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Mark Session Complete/i }),
    );

    expect(
      screen.getByRole("button", { name: /Marking Complete.../i }),
    ).toBeDisabled();
    await waitFor(() => expect(onSessionComplete).toHaveBeenCalled());
  });
});
