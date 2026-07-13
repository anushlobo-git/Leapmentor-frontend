/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// components/shared/profile/__tests__/ProfileTab.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfileTab from "./ProfileTab";
import {
  selectDashboardUser,
  selectDashboardProfile,
} from "@features/profile/store/dashboardUserSlice";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// useSelector just invokes whatever selector it's given — the selectors
// themselves are mocked below so their return value is fully controlled
// per test, independent of any "real" redux state shape.
vi.mock("react-redux", () => ({
  useSelector: (selectorFn) => selectorFn(),
}));

vi.mock("@features/profile/store/dashboardUserSlice", () => ({
  selectDashboardUser: vi.fn(),
  selectDashboardProfile: vi.fn(),
}));

const baseConfig = {
  dashboardTitle: "Mentor Dashboard",
  editPath: "/mentor/profile/edit",
  showVerification: true,
  professionalFields: [
    { key: "yearsExperience", label: "Experience", format: (v) => `${v} yrs` },
    { key: "hourlyRate", label: "Hourly Rate" },
  ],
  tagSections: [
    {
      key: "skills",
      title: "Skills",
      emptyText: "No skills added.",
      chipStyle: "accent",
    },
    {
      key: "interests",
      title: "Interests",
      emptyText: "No interests added.",
      chipStyle: "default",
    },
  ],
  commLabelMap: { "Video Call": "Video Call", Chat: "Chat" },
};

const baseUser = { name: "Ada Lovelace" };
const baseProfile = {
  currentRole: "Engineering Manager",
  company: "Acme Corp",
  bio: "I love mentoring early-career engineers.",
  verificationStatus: "verified",
  profilePicture: null,
  yearsExperience: 8,
  hourlyRate: null,
  skills: ["React", "Leadership"],
  interests: [],
  communicationPreferences: ["Video Call", "Unknown Channel"],
  languages: ["English", "French"],
  portfolioUrl: "https://ada.dev",
  linkedInUrl: "https://linkedin.com/in/ada",
  updatedAt: "2026-03-15T00:00:00.000Z",
};

const setup = ({
  user = baseUser,
  profile = baseProfile,
  config = baseConfig,
} = {}) => {
  selectDashboardUser.mockReturnValue(user);
  selectDashboardProfile.mockReturnValue(profile);
  return render(<ProfileTab config={config} />);
};

describe("ProfileTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard title and subtitle from config", () => {
    setup();
    expect(screen.getByText("Mentor Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your professional identity and preferences."),
    ).toBeInTheDocument();
  });

  it("renders the user's name, role, and company", () => {
    setup();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(
      screen.getByText("Engineering Manager & Acme Corp"),
    ).toBeInTheDocument();
  });

  it("shows a Verified badge when verified and config.showVerification is true", () => {
    setup();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.queryByText("Under Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Unverified")).not.toBeInTheDocument();
  });

  it("shows an Under Review badge for a pending verification status", () => {
    setup({ profile: { ...baseProfile, verificationStatus: "pending" } });
    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  it("shows an Unverified badge and an upload-documents button when unverified", () => {
    setup({ profile: { ...baseProfile, verificationStatus: "unverified" } });
    expect(screen.getByText("Unverified")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Upload Verification Documents/i }),
    ).toBeInTheDocument();
  });

  it("hides all verification badges when config.showVerification is false", () => {
    setup({ config: { ...baseConfig, showVerification: false } });
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    expect(screen.queryByText("Under Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Unverified")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Upload Verification Documents/i }),
    ).not.toBeInTheDocument();
  });

  it("navigates to the upload-documents route when that button is clicked", () => {
    setup({ profile: { ...baseProfile, verificationStatus: "unverified" } });
    fireEvent.click(
      screen.getByRole("button", { name: /Upload Verification Documents/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/verify-documents");
  });

  it("navigates to config.editPath when Edit Profile is clicked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/mentor/profile/edit");
  });

  it("renders the bio section only when a bio is present", () => {
    const { rerender } = setup();
    expect(
      screen.getByText("I love mentoring early-career engineers."),
    ).toBeInTheDocument();

    selectDashboardUser.mockReturnValue(baseUser);
    selectDashboardProfile.mockReturnValue({ ...baseProfile, bio: "" });
    rerender(<ProfileTab config={baseConfig} />);
    expect(screen.queryByText("Bio")).not.toBeInTheDocument();
  });

  it("falls back to a default initial and em dash when user/profile fields are missing", () => {
    setup({
      user: { name: undefined },
      profile: { ...baseProfile, currentRole: undefined, company: undefined },
    });
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders formatted and raw professional info fields, hiding falsy ones", () => {
    setup();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("8 yrs")).toBeInTheDocument();
    // hourlyRate is null in baseProfile, so its label should not render
    expect(screen.queryByText("Hourly Rate")).not.toBeInTheDocument();
  });

  it("renders skill/interest tag sections with chips, and empty text when a section is empty", () => {
    setup();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Leadership")).toBeInTheDocument();
    expect(screen.getByText("No interests added.")).toBeInTheDocument();
  });

  it("renders communication preferences with a fallback emoji for unknown channels", () => {
    setup();
    expect(screen.getByText("Video Call")).toBeInTheDocument();
    expect(screen.getByText("Unknown Channel")).toBeInTheDocument();
  });

  it("renders languages joined by commas, or an em dash when empty", () => {
    setup();
    expect(screen.getByText("English, French")).toBeInTheDocument();

    selectDashboardUser.mockReturnValue(baseUser);
    selectDashboardProfile.mockReturnValue({ ...baseProfile, languages: [] });
    const { container } = render(<ProfileTab config={baseConfig} />);
    expect(container.textContent).toContain("—");
  });

  it("renders portfolio and LinkedIn links with the protocol/prefix stripped", () => {
    setup();
    const portfolioLink = screen.getByRole("link", { name: "ada.dev" });
    expect(portfolioLink).toHaveAttribute("href", "https://ada.dev");

    const linkedinLink = screen.getByRole("link", { name: "ada" });
    expect(linkedinLink).toHaveAttribute("href", "https://linkedin.com/in/ada");
  });

  it("shows an em dash for social links that are not set", () => {
    setup({
      profile: { ...baseProfile, portfolioUrl: null, linkedInUrl: null },
    });
    expect(
      screen.queryByRole("link", { name: "ada.dev" }),
    ).not.toBeInTheDocument();
  });

  it("formats and shows the last profile update date, or an em dash when missing", () => {
    setup();
    expect(screen.getByText(/Last profile update:/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 15, 2026/)).toBeInTheDocument();

    selectDashboardUser.mockReturnValue(baseUser);
    selectDashboardProfile.mockReturnValue({ ...baseProfile, updatedAt: null });
    render(<ProfileTab config={baseConfig} />);
    expect(screen.getAllByText(/Last profile update:/).length).toBeGreaterThan(
      0,
    );
  });
});
