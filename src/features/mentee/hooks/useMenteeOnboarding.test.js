import { renderHook, act } from "@testing-library/react";
import useMenteeOnboarding from "./useMenteeOnboarding";
import {useSelector } from "react-redux";
import {
  submitMenteeOnboarding,
  clearOnboardingMessages,
} from "@features/mentee/store/menteeOnboardingSlice";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock redux
const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}));

vi.mock("@features/mentee/store/menteeOnboardingSlice", () => ({
  submitMenteeOnboarding: vi.fn((payload) => ({ type: "SUBMIT", payload })),
  clearOnboardingMessages: vi.fn(() => ({ type: "CLEAR" })),
}));

describe("useMenteeOnboarding hook", () => {
  const mockReduxState = {
    loading: false,
    error: null,
    successMsg: null,
  };

  const initialForm = {
    profilePicture: "",
    profilePictureFileName: "",
    bio: "",
    currentRole: "QA",
    company: "Leap",
    industry: "Tech",
    yearsOfExperience: "1-3 Years",
    interestedFields: ["QA"],
    skills: ["Testing"],
    communicationPreferences: ["Chat"],
    languages: ["English"],
    linkedInUrl: "https://linkedin.com",
    portfolioUrl: "https://portfolio.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({ menteeOnboarding: { ...mockReduxState } }),
    );
    sessionStorage.clear();
  });

  it("loads form from sessionStorage if it exists", () => {
    sessionStorage.setItem("menteeOnboardingForm", JSON.stringify(initialForm));

    const { result } = renderHook(() => useMenteeOnboarding());
    expect(result.current.form.currentRole).toBe("QA");
  });

  it("handles catch block error when parsing sessionStorage", () => {
    sessionStorage.setItem("menteeOnboardingForm", "invalid-json{");

    const { result } = renderHook(() => useMenteeOnboarding());
    expect(result.current.form.currentRole).toBe(""); // fallback
  });

  it("saves form state to sessionStorage when form changes", () => {
    const { result } = renderHook(() => useMenteeOnboarding());

    act(() => {
      result.current.handleChange({
        target: { name: "company", value: "Google" },
      });
    });

    const saved = JSON.parse(sessionStorage.getItem("menteeOnboardingForm"));
    expect(saved.company).toBe("Google");
  });

  it("updates error state message when redux error occurs", () => {
    useSelector.mockReturnValueOnce({
      loading: false,
      error: "API connection rejected",
      successMsg: null,
    });

    const { result } = renderHook(() => useMenteeOnboarding());

    expect(result.current.msg).toEqual({
      type: "error",
      text: "API connection rejected",
    });
  });

  it("handles successful onboarding flow and schedules navigation", () => {
    vi.useFakeTimers();
    let successMsg = null;
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({
        menteeOnboarding: {
          loading: false,
          error: null,
          successMsg,
        },
      }),
    );
    mockDispatch.mockImplementation((action) => {
      if (action.type === "CLEAR") {
        successMsg = null;
      }
    });

    sessionStorage.setItem("menteeOnboardingForm", JSON.stringify(initialForm));

    const { result, rerender } = renderHook(() => useMenteeOnboarding());

    // Trigger state success after mount
    successMsg = "Profile created!";
    rerender();

    // Flush all pending effects and state updates synchronously
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(result.current.redirecting).toBe(true);
    expect(sessionStorage.getItem("menteeOnboardingForm")).toBeNull();
    expect(mockDispatch).toHaveBeenCalledWith(clearOnboardingMessages());

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/mentee");
    vi.useRealTimers();
  });

  it("clears onboarding messages on unmount", () => {
    const { unmount } = renderHook(() => useMenteeOnboarding());
    unmount();

    expect(mockDispatch).toHaveBeenCalledWith(clearOnboardingMessages());
  });

  it("validates empty required fields on submit", () => {
    const { result } = renderHook(() => useMenteeOnboarding());
    const preventDefault = vi.fn();

    // Role
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Current Role is required.");

    // Experience
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "Dev" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Years of Experience is required.");

    // Industry
    act(() => {
      result.current.handleChange({
        target: { name: "yearsOfExperience", value: "1-3" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Industry is required.");

    // Fields
    act(() => {
      result.current.handleChange({
        target: { name: "industry", value: "Tech" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please add at least one Field of Interest.",
    );

    // Skills
    act(() => {
      result.current.handleChange({
        target: { name: "interestedFields", value: ["Web"] },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please add at least one Skill of Interest.",
    );
  });

  it("validates numeric patterns and URL constraints", () => {
    const { result } = renderHook(() => useMenteeOnboarding());
    const preventDefault = vi.fn();

    // Populate missing fields to pass preceding checks
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "123" },
      });
      result.current.handleChange({
        target: { name: "yearsOfExperience", value: "3-5" },
      });
      result.current.handleChange({
        target: { name: "industry", value: "Tech" },
      });
      result.current.handleChange({
        target: { name: "interestedFields", value: ["Web"] },
      });
      result.current.handleChange({
        target: { name: "skills", value: ["HTML"] },
      });
    });

    // Role is number
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Current Role cannot be a number.");

    // Company is number
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "Dev" },
      });
      result.current.handleChange({
        target: { name: "company", value: "456" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe("Company name cannot be a number.");

    // LinkedIn URL invalid
    act(() => {
      result.current.handleChange({
        target: { name: "company", value: "Google" },
      });
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "badlink" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).",
    );

    // Portfolio URL invalid
    act(() => {
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "https://linkedin.com/in/test" },
      });
      result.current.handleChange({
        target: { name: "portfolioUrl", value: "badlink" },
      });
    });
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });
    expect(result.current.msg.text).toBe(
      "Please enter a valid Portfolio URL (e.g. https://yoursite.com).",
    );
  });

  it("dispatches submitMenteeOnboarding on successful validations", () => {
    sessionStorage.setItem("menteeOnboardingForm", JSON.stringify(initialForm));
    const { result } = renderHook(() => useMenteeOnboarding());
    const preventDefault = vi.fn();

    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      submitMenteeOnboarding(expect.objectContaining({ currentRole: "QA" })),
    );
  });

  it("submits onboarding successfully when LinkedIn and Portfolio URLs are empty", () => {
    const { result } = renderHook(() => useMenteeOnboarding());

    // Populate required fields but leave URLs empty
    act(() => {
      result.current.handleChange({
        target: { name: "currentRole", value: "QA" },
      });
      result.current.handleChange({
        target: { name: "yearsOfExperience", value: "1-3" },
      });
      result.current.handleChange({
        target: { name: "industry", value: "Tech" },
      });
      result.current.handleChange({
        target: { name: "interestedFields", value: ["Web"] },
      });
      result.current.handleChange({
        target: { name: "skills", value: ["Testing"] },
      });
      result.current.handleChange({
        target: { name: "linkedInUrl", value: "" },
      });
      result.current.handleChange({
        target: { name: "portfolioUrl", value: "" },
      });
    });

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit({ preventDefault });
    });

    expect(mockDispatch).toHaveBeenCalled();
  });
});
