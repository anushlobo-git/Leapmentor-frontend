import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  // Array containing all supported statuses from STATUS_CONFIG
  const configuredStatuses = [
    { status: "pending", expectedLabel: "Pending" },
    { status: "accepted", expectedLabel: "Accepted" },
    { status: "ongoing", expectedLabel: "Ongoing" },
    { status: "completed", expectedLabel: "Completed" },
    { status: "rejected", expectedLabel: "Rejected" },
    { status: "referred", expectedLabel: "Referred" },
    { status: "paid", expectedLabel: "Paid" },
    { status: "unpaid", expectedLabel: "Unpaid" },
    { status: "refunded", expectedLabel: "Refunded" },
  ];

  it.each(configuredStatuses)(
    "should render the correct configured label and style mappings for status: $status",
    ({ status, expectedLabel }) => {
      render(<StatusBadge status={status} />);

      const badge = screen.getByText(expectedLabel);
      expect(badge).toBeInTheDocument();
    },
  );

  it("should evaluate the fallback evaluation branch when an unrecognized status string is specified", () => {
    const unknownStatus = "custom-arbitrary-status";
    render(<StatusBadge status={unknownStatus} />);

    // Checks that the component falls back to rendering the raw status text string
    const badge = screen.getByText(unknownStatus);
    expect(badge).toBeInTheDocument();

    // Verifies the fallback style assignments are applied correctly
    expect(badge).toHaveStyle({
      background: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
    });
  });
});
