/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axiosInstance from "@lib/axiosInstance";
import mentorOnboardingReducer, {
  submitMentorOnboarding,
  clearMentorOnboardingMessages,
} from "./mentorOnboardingSlice";

vi.mock("@lib/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

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

  describe("submitMentorOnboarding thunk", () => {
    const createStore = () =>
      configureStore({ reducer: mentorOnboardingReducer });

    it("posts the payload and defaults missing profilePictureFileName to empty string", async () => {
      axiosInstance.post.mockResolvedValue({ data: { id: 1 } });
      const store = createStore();

      await store.dispatch(submitMentorOnboarding({ name: "Ada" }));

      expect(axiosInstance.post).toHaveBeenCalledWith("/mentor-profile", {
        name: "Ada",
        profilePictureFileName: "",
      });
      expect(store.getState().loading).toBe(false);
      expect(store.getState().successMsg).toBe(
        "Profile saved! Redirecting to dashboard…",
      );
    });

    it("keeps an existing profilePictureFileName and handles undefined payload", async () => {
      axiosInstance.post.mockResolvedValue({ data: {} });
      const store = createStore();

      await store.dispatch(
        submitMentorOnboarding({ profilePictureFileName: "pic.png" }),
      );
      expect(axiosInstance.post).toHaveBeenCalledWith("/mentor-profile", {
        profilePictureFileName: "pic.png",
      });

      await store.dispatch(submitMentorOnboarding(undefined));
      expect(axiosInstance.post).toHaveBeenCalledWith("/mentor-profile", {
        profilePictureFileName: "",
      });
    });

    it("rejects with the API response message", async () => {
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Validation failed" } },
      });
      const store = createStore();

      await store.dispatch(submitMentorOnboarding({ name: "Ada" }));

      expect(store.getState().loading).toBe(false);
      expect(store.getState().error).toBe("Validation failed");
    });

    it("rejects with err.message when the response has no message", async () => {
      axiosInstance.post.mockRejectedValue({ message: "Network down" });
      const store = createStore();

      await store.dispatch(submitMentorOnboarding({ name: "Ada" }));

      expect(store.getState().error).toBe("Network down");
    });

    it("rejects with a fallback when neither response nor message exists", async () => {
      axiosInstance.post.mockRejectedValue({});
      const store = createStore();

      await store.dispatch(submitMentorOnboarding({ name: "Ada" }));

      expect(store.getState().error).toBe("Something went wrong.");
    });
  });
});
