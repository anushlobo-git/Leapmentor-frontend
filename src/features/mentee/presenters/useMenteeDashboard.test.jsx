import { renderHook, waitFor } from "@testing-library/react";
import useMenteeDashboard from "./useMenteeDashboard";
import { getCurrentUser, getMenteeProfile } from "@features/mentee/models/mentee.api";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { mapMenteeProfile } from "@features/mentee/models/menteeMapper";

// Mock dependencies
vi.mock("@features/mentee/models/mentee.api", () => ({
  getCurrentUser: vi.fn(),
  getMenteeProfile: vi.fn(),
}));

vi.mock("@features/mentee/models/menteeMapper", () => ({
  mapMenteeProfile: vi.fn((p) => p),
}));

const mockNavigate = vi.fn();
let mockPathname = "/dashboard/mentee";
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

describe("useMenteeDashboard", () => {
  const mockUser = {
    roles: ["mentee"],
    name: "John Doe",
  };

  const mockProfile = {
    isProfileComplete: true,
    bio: "Passionate developer",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/dashboard/mentee";
    useSelector.mockReturnValue(true); // isAuthenticated = true
    getCurrentUser.mockResolvedValue({ data: mockUser });
    getMenteeProfile.mockResolvedValue({ data: mockProfile });
  });

  it("redirects to login when user is not authenticated", async () => {
    useSelector.mockReturnValueOnce(false); // isAuthenticated = false

    renderHook(() => useMenteeDashboard());

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("redirects to mentor dashboard when roles does not include mentee", async () => {
    getCurrentUser.mockResolvedValueOnce({
      data: { roles: ["mentor"] },
    });

    renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentor");
    });
  });

  it("redirects to onboarding if profile is not found (404) and not on edit page", async () => {
    getCurrentUser.mockResolvedValue({ data: mockUser });
    getMenteeProfile.mockRejectedValue({ response: { status: 404 } });

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentee");
      expect(result.current.loading).toBe(false);
    });
  });

  it("does not redirect to onboarding if profile is 404 and user is currently on edit page", async () => {
    mockPathname = "/dashboard/mentee/edit-profile";
    getCurrentUser.mockResolvedValue({ data: mockUser });
    getMenteeProfile.mockRejectedValue({ response: { status: 404 } });

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(true); // remain loading since profile check aborted
    });
  });

  it("sets error message when profile query throws an unexpected error", async () => {
    getCurrentUser.mockResolvedValue({ data: mockUser });
    getMenteeProfile.mockRejectedValue(new Error("Timeout database failure"));

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Something went wrong. Please try again.",
      );
      expect(result.current.loading).toBe(false);
    });
  });

  it("does not set error message for unauthorized error response", async () => {
    getCurrentUser.mockResolvedValue({ data: mockUser });
    getMenteeProfile.mockRejectedValue({ response: { status: 401 } });

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(result.current.error).toBe("");
    });
  });

  it("redirects to onboarding if profile is incomplete and not on edit page", async () => {
    mapMenteeProfile.mockReturnValueOnce({
      isProfileComplete: false,
    });

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/mentee");
      expect(result.current.loading).toBe(false);
    });
  });

  it("successfully loads user and profile when profile is complete", async () => {
    mapMenteeProfile.mockReturnValueOnce(mockProfile);

    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBe("");
    });
  });

  it("supports manual refetch trigger", async () => {
    mapMenteeProfile.mockReturnValue(mockProfile);
    const { result } = renderHook(() => useMenteeDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getCurrentUser.mockClear();
    result.current.refetch();

    expect(getCurrentUser).toHaveBeenCalledWith();
  });
});
