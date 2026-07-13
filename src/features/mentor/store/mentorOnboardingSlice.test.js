/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import mentorOnboardingReducer, {
  submitMentorOnboarding,
  clearMentorOnboardingMessages,
} from "./mentorOnboardingSlice";

describe("mentorOnboardingSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return initial state", () => {
      const state = mentorOnboardingReducer(undefined, { type: "@@INIT" });
      expect(state).toEqual({
        loading: false,
        error: null,
        successMsg: null,
      });
    });
  });

  describe("clearMentorOnboardingMessages", () => {
    it("should clear error and success messages", () => {
      const initialState = {
        loading: false,
        error: "Test error",
        successMsg: "Test success",
      };

      const state = mentorOnboardingReducer(
        initialState,
        clearMentorOnboardingMessages()
      );

      expect(state.error).toBeNull();
      expect(state.successMsg).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe("submitMentorOnboarding", () => {
    it("should handle pending state", () => {
      const initialState = {
        loading: false,
        error: "Previous error",
        successMsg: "Previous success",
      };

      const state = mentorOnboardingReducer(
        initialState,
        submitMentorOnboarding.pending()
      );

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.successMsg).toBeNull();
    });

    it("should handle fulfilled state", () => {
      const initialState = {
        loading: true,
        error: null,
        successMsg: null,
      };

      const state = mentorOnboardingReducer(
        initialState,
        submitMentorOnboarding.fulfilled()
      );

      expect(state.loading).toBe(false);
      expect(state.successMsg).toBe("Profile saved! Redirecting to dashboard…");
      expect(state.error).toBeNull();
    });

    it("should handle rejected state with error message", () => {
      const initialState = {
        loading: true,
        error: null,
        successMsg: null,
      };

      const errorPayload = "Submission failed";
      const state = mentorOnboardingReducer(
        initialState,
        submitMentorOnboarding.rejected(null, null, null, errorPayload)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorPayload);
      expect(state.successMsg).toBeNull();
    });

    it("should handle rejected state with null error", () => {
      const initialState = {
        loading: true,
        error: null,
        successMsg: null,
      };

      const state = mentorOnboardingReducer(
        initialState,
        submitMentorOnboarding.rejected(null, null, null, null)
      );

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMsg).toBeNull();
    });
  });
});
