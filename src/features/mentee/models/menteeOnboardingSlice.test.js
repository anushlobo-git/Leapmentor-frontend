/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import axiosInstance from "@lib/http/axiosInstance";
import menteeOnboardingReducer, {
  submitMenteeOnboarding,
  clearOnboardingMessages,
} from "./menteeOnboardingSlice";

vi.mock("@lib/http/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("menteeOnboardingSlice", () => {
  const initialState = {
    loading: false,
    error: null,
    successMsg: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return the initial state", () => {
      expect(menteeOnboardingReducer(undefined, { type: "unknown" })).toEqual(
        initialState
      );
    });
  });

  describe("clearOnboardingMessages", () => {
    it("should clear error and successMsg", () => {
      const state = {
        loading: false,
        error: "Some error",
        successMsg: "Success message",
      };
      const action = clearOnboardingMessages();
      const newState = menteeOnboardingReducer(state, action);

      expect(newState.error).toBeNull();
      expect(newState.successMsg).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it("should handle clearing when messages are already null", () => {
      const state = { ...initialState };
      const action = clearOnboardingMessages();
      const newState = menteeOnboardingReducer(state, action);

      expect(newState.error).toBeNull();
      expect(newState.successMsg).toBeNull();
    });
  });

  describe("submitMenteeOnboarding", () => {
    describe("pending state", () => {
      it("should set loading to true and clear error", () => {
        const action = { type: submitMenteeOnboarding.pending.type };
        const state = menteeOnboardingReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });

      it("should clear existing error when pending", () => {
        const state = {
          loading: false,
          error: "Previous error",
          successMsg: null,
        };
        const action = { type: submitMenteeOnboarding.pending.type };
        const newState = menteeOnboardingReducer(state, action);

        expect(newState.loading).toBe(true);
        expect(newState.error).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set success message", () => {
        const action = {
          type: submitMenteeOnboarding.fulfilled.type,
          payload: { message: "Profile created successfully" },
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: null, successMsg: null },
          action
        );

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("Profile created successfully");
        expect(state.error).toBeNull();
      });

      it("should use default success message when payload has no message", () => {
        const action = {
          type: submitMenteeOnboarding.fulfilled.type,
          payload: {},
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: null, successMsg: null },
          action
        );

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("Onboarding complete!");
      });

      it("should use default success message when payload is undefined", () => {
        const action = {
          type: submitMenteeOnboarding.fulfilled.type,
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: null, successMsg: null },
          action
        );

        expect(state.successMsg).toBe("Onboarding complete!");
      });

      it("should keep error when fulfilled (slice doesn't clear it)", () => {
        const action = {
          type: submitMenteeOnboarding.fulfilled.type,
          payload: { message: "Success" },
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: "Previous error", successMsg: null },
          action
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Previous error");
        expect(state.successMsg).toBe("Success");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: submitMenteeOnboarding.rejected.type,
          payload: "Submission failed",
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: null, successMsg: null },
          action
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Submission failed");
        expect(state.successMsg).toBeNull();
      });

      it("should keep success message when rejected (slice doesn't clear it)", () => {
        const action = {
          type: submitMenteeOnboarding.rejected.type,
          payload: "Error occurred",
        };
        const state = menteeOnboardingReducer(
          { loading: true, error: null, successMsg: "Previous success" },
          action
        );

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Error occurred");
        expect(state.successMsg).toBe("Previous success");
      });
    });

    describe("async thunk behavior", () => {
      const createStore = () =>
        configureStore({ reducer: menteeOnboardingReducer });

      it("posts the payload and defaults missing profilePictureFileName to empty string", async () => {
        axiosInstance.post.mockResolvedValue({
          data: { message: "Profile created" },
        });
        const store = createStore();

        await store.dispatch(submitMenteeOnboarding({ name: "Ada" }));

        expect(axiosInstance.post).toHaveBeenCalledWith("/mentee-profile", {
          name: "Ada",
          profilePictureFileName: "",
        });
        expect(store.getState().loading).toBe(false);
        expect(store.getState().successMsg).toBe("Profile created");
      });

      it("keeps an existing profilePictureFileName and handles undefined payload", async () => {
        axiosInstance.post.mockResolvedValue({ data: {} });
        const store = createStore();

        await store.dispatch(
          submitMenteeOnboarding({ profilePictureFileName: "pic.png" }),
        );
        expect(axiosInstance.post).toHaveBeenCalledWith("/mentee-profile", {
          profilePictureFileName: "pic.png",
        });

        axiosInstance.post.mockResolvedValue({ data: { message: "ok" } });
        await store.dispatch(submitMenteeOnboarding(undefined));
        expect(axiosInstance.post).toHaveBeenCalledWith("/mentee-profile", {
          profilePictureFileName: "",
        });
      });

      it("rejects with the API response message", async () => {
        axiosInstance.post.mockRejectedValue({
          response: { data: { message: "Validation failed" } },
        });
        const store = createStore();

        await store.dispatch(submitMenteeOnboarding({ name: "Ada" }));

        expect(store.getState().loading).toBe(false);
        expect(store.getState().error).toBe("Validation failed");
      });

      it("rejects with err.message when the response has no message", async () => {
        axiosInstance.post.mockRejectedValue({ message: "Network down" });
        const store = createStore();

        await store.dispatch(submitMenteeOnboarding({ name: "Ada" }));

        expect(store.getState().error).toBe("Network down");
      });

      it("rejects with undefined when neither response nor message exists", async () => {
        axiosInstance.post.mockRejectedValue({});
        const store = createStore();

        await store.dispatch(submitMenteeOnboarding({ name: "Ada" }));

        expect(store.getState().error).toBeUndefined();
      });
    });
  });

  describe("action creators", () => {
    it("should create clearOnboardingMessages action", () => {
      const action = clearOnboardingMessages();

      expect(action.type).toBe("menteeOnboarding/clearOnboardingMessages");
      expect(action.payload).toBeUndefined();
    });
  });
});
