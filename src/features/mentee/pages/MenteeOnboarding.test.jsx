import { render, screen } from "@testing-library/react";
import MenteeOnboarding from "./MenteeOnboarding";

vi.mock("@features/mentee/components/onboarding/MenteeOnboardingShell", () => ({
  default: () => (
    <div data-testid="onboarding-shell">MenteeOnboardingShell</div>
  ),
}));

describe("MenteeOnboarding", () => {
  it("renders MenteeOnboardingShell", () => {
    render(<MenteeOnboarding />);
    expect(screen.getByTestId("onboarding-shell")).toBeInTheDocument();
  });
});
