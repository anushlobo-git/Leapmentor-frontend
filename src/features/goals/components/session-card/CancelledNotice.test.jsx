import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CancelledNotice from "./CancelledNotice";

describe("CancelledNotice", () => {
  it("renders cancellation details when viewer cancelled the session", () => {
    render(
      <CancelledNotice
        slot={{
          cancelledBy: "mentee",
          cancellationReason: "Schedule conflict",
          isRescheduled: false,
        }}
        viewerRole="mentee"
        otherName="Alex"
      />,
    );

    expect(screen.getByText(/Cancelled by you/i)).toBeInTheDocument();
    expect(screen.getByText(/"Schedule conflict"/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Rescheduled to a new slot/i),
    ).not.toBeInTheDocument();
  });

  it("renders other user cancellation and rescheduled notice without reason text", () => {
    render(
      <CancelledNotice
        slot={{
          cancelledBy: "mentor",
          cancellationReason: "rescheduled",
          isRescheduled: true,
        }}
        viewerRole="mentee"
        otherName="Jordan"
      />,
    );

    expect(screen.getByText(/Cancelled by Jordan/i)).toBeInTheDocument();
    expect(screen.getByText(/Rescheduled to a new slot/i)).toBeInTheDocument();
    expect(screen.queryByText(/"/)).not.toBeInTheDocument();
  });
});
