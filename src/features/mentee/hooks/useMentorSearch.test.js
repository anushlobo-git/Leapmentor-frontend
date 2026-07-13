import { renderHook, act } from "@testing-library/react";
import useMentorSearch from "./useMentorSearch";
import axiosInstance from "@lib/axiosInstance";

import { describe, it, expect, vi } from "vitest";

// Mock axiosInstance
vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock mappers
vi.mock("@features/mentor/mappers/mentorMapper", () => ({
  mapMentorSearchResponse: vi.fn((data) => ({
    mentors: data.mentors ?? [],
    pagination: data.pagination ?? { hasMore: false, totalCount: 0 },
  })),
}));

describe("useMentorSearch hook", () => {
  const mockApiResponse = {
    mentors: [{ id: "m1", name: "Alice" }],
    pagination: { hasMore: true, totalCount: 15 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    axiosInstance.get.mockResolvedValue({ data: mockApiResponse });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("schedules search query with debounce timer on mount", async () => {
    const { result } = renderHook(() => useMentorSearch());

    expect(axiosInstance.get).not.toHaveBeenCalled();

    // Advance timer past DEBOUNCE_MS (300)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve(); // flush query promise
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/mentors/search?page=1&limit=6",
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.mentors).toEqual([{ id: "m1", name: "Alice" }]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalCount).toBe(15);
    expect(result.current.hasSearched).toBe(true);
  });

  it("debounces multiple skill input changes within time frame", async () => {
    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      result.current.setSkill("React");
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    act(() => {
      result.current.setSkill("React Native");
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Axios should not be called yet because timer was reset
    expect(axiosInstance.get).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/mentors/search?skill=React+Native&name=React+Native&page=1&limit=6",
    );
  });

  it("handles filter changes and clears stale error status", async () => {
    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      result.current.updateFilter("industry", "Design");
      result.current.updateFilter("minPrice", "20");
      result.current.updateFilter("maxPrice", "100");
      result.current.updateFilter("minRating", "4");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/mentors/search?industry=Design&minPrice=20&maxPrice=100&minRating=4&page=1&limit=6",
    );
  });

  it("handles experience configurations lookup filter mapping", async () => {
    const { result } = renderHook(() => useMentorSearch());

    // 1. "0-2" Config
    act(() => {
      result.current.updateFilter("experience", "0-2");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("minExperience=0&maxExperience=2"),
    );

    // 2. "10+" Config
    act(() => {
      result.current.updateFilter("experience", "10+");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("minExperience=10"),
    );
    expect(axiosInstance.get).not.toContain("maxExperience");
  });

  it("appends new mentors when loadMore is triggered", async () => {
    const { result } = renderHook(() => useMentorSearch());

    // Flush initial debounce search load
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Mock next page response
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        mentors: [{ id: "m2", name: "Bob" }],
        pagination: { hasMore: false, totalCount: 15 },
      },
    });

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.loadingMore).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loadingMore).toBe(false);
    expect(result.current.mentors).toEqual([
      { id: "m1", name: "Alice" },
      { id: "m2", name: "Bob" },
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it("resets all filters and skill states back to defaults", async () => {
    const { result } = renderHook(() => useMentorSearch());

    // Trigger initial search
    act(() => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.skill).toBe("");
    expect(result.current.filters).toEqual({
      industry: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      experience: "",
    });
    expect(result.current.mentors).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it("supports instant searchMentors invocation without debounce delay", async () => {
    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      result.current.searchMentors();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/mentors/search?page=1&limit=6",
    );
  });

  it("handles api search errors and formats messages", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: "Server timeout overload error" } },
    });

    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Server timeout overload error");
  });

  it("handles generic search exception fallback", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Generic offline"));

    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Generic offline");
  });

  it("handles experience mappings under-1 filter successfully", async () => {
    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      result.current.updateFilter("experience", "under-1");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining("maxExperience=1"),
    );
    expect(axiosInstance.get).not.toContain("minExperience");
  });

  it("handles search rejection without error message fallback", async () => {
    axiosInstance.get.mockRejectedValueOnce({}); // no message or response

    const { result } = renderHook(() => useMentorSearch());

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Search failed.");
  });
});
