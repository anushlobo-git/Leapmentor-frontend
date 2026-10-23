import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WalletStatusBadge from "./WalletStatusBadge";

describe("WalletStatusBadge", () => {
  it("should render pending status with correct styling", () => {
    render(<WalletStatusBadge status="pending" />);

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#fef3c7", color: "#92400e" });
  });

  it("should render approved status with correct styling", () => {
    render(<WalletStatusBadge status="approved" />);

    const badge = screen.getByText("Approved");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#d1fae5", color: "#065f46" });
  });

  it("should render rejected status with correct styling", () => {
    render(<WalletStatusBadge status="rejected" />);

    const badge = screen.getByText("Rejected");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#fee2e2", color: "#b91c1c" });
  });

  it("should render completed status with correct styling", () => {
    render(<WalletStatusBadge status="completed" />);

    const badge = screen.getByText("Completed");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#dbeafe", color: "#1e3a8a" });
  });

  it("should render accepted status with correct styling", () => {
    render(<WalletStatusBadge status="accepted" />);

    const badge = screen.getByText("Accepted");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#d1fae5", color: "#065f46" });
  });

  it("should render cancelled status with correct styling", () => {
    render(<WalletStatusBadge status="cancelled" />);

    const badge = screen.getByText("Cancelled");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#f1f5f9", color: "#64748b" });
  });

  it("should render paid status with correct styling", () => {
    render(<WalletStatusBadge status="paid" />);

    const badge = screen.getByText("Paid");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#d1fae5", color: "#065f46" });
  });

  it("should render unpaid status with correct styling", () => {
    render(<WalletStatusBadge status="unpaid" />);

    const badge = screen.getByText("Unpaid");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#fef3c7", color: "#92400e" });
  });

  it("should fallback to pending styling for unknown status", () => {
    render(<WalletStatusBadge status="unknown-status" />);

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ background: "#fef3c7", color: "#92400e" });
  });

  it("should fallback to pending styling when status is undefined", () => {
    render(<WalletStatusBadge status={undefined} />);

    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
  });
});

/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */
