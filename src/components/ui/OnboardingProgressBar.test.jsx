import { render, screen, within } from "@testing-library/react";
import OnboardingProgressBar from "@components/ui/OnboardingProgressBar";

describe("OnboardingProgressBar", () => {
  it("shows 0% when no fields are completed", () => {
    const form = { name: "", tags: [], description: null };
    const fields = [
      { key: "name", type: "string" },
      { key: "tags", type: "array" },
      { key: "description", type: "string" },
    ];

    const { container } = render(
      <OnboardingProgressBar form={form} fields={fields} />,
    );

    expect(within(container).getByText("0%")).toBeInTheDocument();
    expect(
      within(container).getByText("Profile Completion"),
    ).toBeInTheDocument();
    const progressFill = container.querySelector(".h-full.rounded-full");
    expect(progressFill).toHaveStyle({ width: "0%" });
    expect(progressFill?.style.background).toContain("linear-gradient");
  });

  it("calculates percent correctly for array and non-array fields", () => {
    const form = { name: "Jane", tags: ["mentor"], email: "" };
    const fields = [
      { key: "name", type: "string" },
      { key: "tags", type: "array" },
      { key: "email", type: "string" },
    ];

    const { container } = render(
      <OnboardingProgressBar form={form} fields={fields} />,
    );

    expect(screen.getByText("67%")).toBeInTheDocument();
    const progressFill = container.querySelector(".h-full.rounded-full");
    expect(progressFill).toHaveStyle({ width: "67%" });
    expect(progressFill?.style.background).toContain("139, 92, 246");
  });

  it("renders complete state when percent reaches 100", () => {
    const form = { name: "Jane", tags: ["mentor"], email: "jane@example.com" };
    const fields = [
      { key: "name", type: "string" },
      { key: "tags", type: "array" },
      { key: "email", type: "string" },
    ];

    const { container } = render(
      <OnboardingProgressBar form={form} fields={fields} />,
    );

    expect(screen.getByText("✓ Complete")).toBeInTheDocument();
    const progressFill = container.querySelector(".h-full.rounded-full");
    expect(progressFill).toHaveStyle({ width: "100%" });
    expect(progressFill?.style.background).toContain("16, 185, 129");
  });
});
