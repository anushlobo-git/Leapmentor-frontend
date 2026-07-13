import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MenteeProfileTab from "./ProfileTab";
import ProfileTab from "@features/profile/components/ProfileTab";
import { menteeProfileConfig } from "@features/profile/components/profileConfig";

// Mock the external shared ProfileTab component and its specific configuration structure
vi.mock("@features/profile/components/ProfileTab", () => ({
  default: vi.fn(({ config }) => (
    <div data-testid="mock-shared-profile-tab">
      <span>Shared Profile Tab View</span>
      <span data-testid="received-config">{JSON.stringify(config)}</span>
    </div>
  )),
}));

vi.mock("@features/profile/components/profileConfig", () => ({
  menteeProfileConfig: {
    type: "mentee",
    sections: ["personal", "professional", "mentorship_preferences"],
    allowEdits: true,
  },
}));

describe("MenteeProfileTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the shared core ProfileTab view layout correctly", () => {
    render(<MenteeProfileTab />);

    const sharedTabElement = screen.getByTestId("mock-shared-profile-tab");
    expect(sharedTabElement).toBeInTheDocument();
    expect(screen.getByText("Shared Profile Tab View")).toBeInTheDocument();
  });

  it("should pass the specific menteeProfileConfig options down to the shared ProfileTab component", () => {
    render(<MenteeProfileTab />);

    expect(ProfileTab).toHaveBeenCalledTimes(1);

    // Direct inspection of the first argument (props) avoids the trailing undefined context match failure
    const firstCallProps = vi.mocked(ProfileTab).mock.calls[0][0];
    expect(firstCallProps).toEqual({ config: menteeProfileConfig });

    const receivedConfigText =
      screen.getByTestId("received-config").textContent;
    const parsedConfig = JSON.parse(receivedConfigText);

    expect(parsedConfig).toEqual({
      type: "mentee",
      sections: ["personal", "professional", "mentorship_preferences"],
      allowEdits: true,
    });
  });
});
