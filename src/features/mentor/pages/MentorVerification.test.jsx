/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/pages/__tests__/MentorVerification.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MentorVerification from "./MentorVerification";

// Mock the child component so this test stays focused on MentorVerification
// itself (a pure composition/wrapper component).
vi.mock("@features/mentor/components/VerificationFormShell", () => ({
  default: (props) => <div data-testid="verification-form-shell" {...props} />,
}));

describe("MentorVerification", () => {
  it("renders without crashing", () => {
    render(<MentorVerification />);
    expect(screen.getByTestId("verification-form-shell")).toBeInTheDocument();
  });

  it("renders exactly one VerificationFormShell instance", () => {
    render(<MentorVerification />);
    expect(screen.getAllByTestId("verification-form-shell")).toHaveLength(1);
  });

  it("does not pass any unexpected props down to VerificationFormShell", () => {
    const { container } = render(<MentorVerification />);
    const shell = container.querySelector(
      '[data-testid="verification-form-shell"]',
    );
    expect(shell.attributes.length).toBe(1); // only data-testid from the mock
  });

  it("matches its last known snapshot", () => {
    const { asFragment } = render(<MentorVerification />);
    expect(asFragment()).toMatchSnapshot();
  });
});
