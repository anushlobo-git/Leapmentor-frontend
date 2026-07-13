/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/__tests__/MentorOnboarding.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MentorOnboarding from "./MentorOnboarding";

// Mock the child component so this test stays focused on MentorOnboarding
// itself (a pure composition/wrapper component) and doesn't need to know
// about OnboardingFormShell's internals or its own dependencies.
vi.mock("@features/mentor/components/onboarding/OnboardingFormShell", () => ({
  default: (props) => <div data-testid="onboarding-form-shell" {...props} />,
}));

describe("MentorOnboarding", () => {
  it("renders without crashing", () => {
    render(<MentorOnboarding />);
    expect(screen.getByTestId("onboarding-form-shell")).toBeInTheDocument();
  });

  it("renders exactly one OnboardingFormShell instance", () => {
    render(<MentorOnboarding />);
    expect(screen.getAllByTestId("onboarding-form-shell")).toHaveLength(1);
  });

  it("does not pass any unexpected props down to OnboardingFormShell", () => {
    const { container } = render(<MentorOnboarding />);
    const shell = container.querySelector(
      '[data-testid="onboarding-form-shell"]',
    );
    // MentorOnboarding renders <OnboardingFormShell /> with no props at all.
    expect(shell.attributes.length).toBe(1); // only data-testid from the mock
  });

  it("matches its last known snapshot", () => {
    const { asFragment } = render(<MentorOnboarding />);
    expect(asFragment()).toMatchSnapshot();
  });
});
