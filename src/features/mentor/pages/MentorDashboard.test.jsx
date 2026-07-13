/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MentorDashboard from "./MentorDashboard";

// Mock DashboardLayout
vi.mock("@features/mentor/components/dashboard/DashboardLayout", () => ({
  default: () => <div data-testid="dashboard-layout">Dashboard Layout</div>,
}));

describe("MentorDashboard", () => {
  it("should render DashboardLayout component", () => {
    render(<MentorDashboard />);

    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });

  it("should render without crashing", () => {
    const { container } = render(<MentorDashboard />);

    expect(container.firstChild).toBeDefined();
  });
});
