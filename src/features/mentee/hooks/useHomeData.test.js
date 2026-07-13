import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useHomeData,
  getInitials,
  getAvatarColor,
  calculateProfileCompletion,
} from "./useHomeData";
import {
  searchMentorsBySkill,
  getMyConnectRequests,
  getEscrowWallet,
} from "@features/mentee/api/mentee.api";
import { mapMentorProfile } from "@features/mentor/mappers/mentorMapper";
import logger from "@lib/logger";


// Mock API layer
vi.mock("@features/mentee/api/mentee.api", () => ({
  searchMentorsBySkill: vi.fn(),
  getMyConnectRequests: vi.fn(),
  getEscrowWallet: vi.fn(),
}));

vi.mock("@features/mentor/mappers/mentorMapper", () => ({
  mapMentorProfile: vi.fn((m) => m),
}));

vi.mock("@lib/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useHomeData & helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useHomeData", () => {
    const mockProfile = {
      skills: ["React"],
      interestedFields: ["Software Engineering"],
    };

    it("does not fetch anything when profile is null", () => {
      const { result } = renderHook(() => useHomeData(null));

      expect(result.current.loading).toBe(true);
      expect(searchMentorsBySkill).not.toHaveBeenCalled();
    });

    it("fetches home tab data and sorts sessions correctly", async () => {
      searchMentorsBySkill.mockResolvedValueOnce({
        data: { mentors: [{ id: "m1", name: "Alice" }] },
      });
      getMyConnectRequests.mockResolvedValueOnce({
        data: {
          requests: [
            { _id: "r1", status: "accepted" },
            { _id: "r2", status: "ongoing" },
            { _id: "r3", status: "pending" }, // should be filtered out
            { _id: "r4", status: "accepted" }, // same status to hit return 0 branch
          ],
        },
      });
      getEscrowWallet.mockResolvedValueOnce({
        data: { balance: 250, escrow: 120 },
      });

      const { result } = renderHook(() => useHomeData(mockProfile));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchMentorsBySkill).toHaveBeenCalledWith("React", 4);
      expect(mapMentorProfile).toHaveBeenCalled();
      expect(result.current.mentors).toEqual([{ id: "m1", name: "Alice" }]);

      // Ongoing requests must sort before accepted requests
      expect(result.current.sessions).toHaveLength(3);
      expect(result.current.sessions[0]._id).toBe("r2"); // ongoing
      expect(result.current.sessions[1]._id).toBe("r1"); // accepted
      expect(result.current.sessions[2]._id).toBe("r4"); // accepted

      expect(result.current.balance).toBe(250);
      expect(result.current.escrow).toBe(120);
    });

    it("handles fallback to interestedFields when skills array is missing", async () => {
      searchMentorsBySkill.mockResolvedValueOnce({ data: {} });
      getMyConnectRequests.mockResolvedValueOnce({ data: {} });
      getEscrowWallet.mockResolvedValueOnce({ data: {} }); // no balance / escrow

      const profileNoSkills = {
        interestedFields: ["UX Design"],
      };

      const { result } = renderHook(() => useHomeData(profileNoSkills));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchMentorsBySkill).toHaveBeenCalledWith("UX Design", 4);
      expect(result.current.balance).toBe(0);
      expect(result.current.escrow).toBe(0);
    });

    it("handles empty/missing profile search terms correctly", async () => {
      searchMentorsBySkill.mockResolvedValueOnce({ data: { mentors: [] } });
      getMyConnectRequests.mockResolvedValueOnce({ data: { requests: [] } });
      getEscrowWallet.mockResolvedValueOnce({ data: {} });

      const sparseProfile = {};

      const { result } = renderHook(() => useHomeData(sparseProfile));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchMentorsBySkill).toHaveBeenCalledWith("", 4);
    });

    it("logs error and completes loading when api calls fail", async () => {
      searchMentorsBySkill.mockRejectedValueOnce(new Error("Database offline"));

      const { result } = renderHook(() => useHomeData(mockProfile));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(logger.error).toHaveBeenCalledWith(
        "HomeTab data fetch error:",
        expect.objectContaining({ error: "Database offline" }),
      );
    });
  });

  describe("getInitials helper", () => {
    it("returns empty string for empty input", () => {
      expect(getInitials("")).toBe("");
    });

    it("returns formatted initials", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("single")).toBe("S");
      expect(getInitials("John Middlename Doe")).toBe("JM");
    });
  });

  describe("getAvatarColor helper", () => {
    it("returns correct color classes", () => {
      expect(getAvatarColor("Alice")).toBeDefined();
      expect(getAvatarColor("Bob")).toBeDefined();
    });
  });

  describe("calculateProfileCompletion helper", () => {
    it("returns 0 if profile is falsy", () => {
      expect(calculateProfileCompletion(null)).toBe(0);
      expect(calculateProfileCompletion(undefined)).toBe(0);
    });

    it("calculates percentage accurately", () => {
      const fullProfile = {
        profilePicture: "url",
        bio: "Bio description",
        currentRole: "Engineer",
        company: "Google",
        industry: "Tech",
        yearsOfExperience: "1",
        communicationPreferences: ["Chat"],
        languages: ["English"],
        linkedInUrl: "url",
        portfolioUrl: "url",
      };
      expect(calculateProfileCompletion(fullProfile)).toBe(100);

      const halfProfile = {
        profilePicture: "url",
        bio: "Bio",
        currentRole: "Engineer",
        company: "Google",
        industry: "Tech",
        yearsOfExperience: "",
        communicationPreferences: [],
        languages: [],
        linkedInUrl: "",
        portfolioUrl: "",
      };
      expect(calculateProfileCompletion(halfProfile)).toBe(50);
    });
  });
});
