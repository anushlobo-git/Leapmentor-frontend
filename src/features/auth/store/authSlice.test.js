/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { describe, it, expect, vi } from "vitest";
import authReducer, {
  redirectByRole,
  registerUser,
  loginUser,
  sendOtp,
  verifyEmail,
  verifyMagicLink,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logout,
  setUser,
  clearMessages,
  selectIsAuthenticated,
  selectIsVerified,
} from "./authSlice";

// Mock mapAuthUser
vi.mock("@lib/mappers/userMapper", () => ({
  mapAuthUser: vi.fn((user) => ({ ...user, mapped: true })),
}));

describe("authSlice", () => {
  const initialState = {
    user: null,
    accessToken: null,
    loading: false,
    sending: false,
    error: null,
    successMsg: null,
    verifiedRole: null,
  };

  describe("redirectByRole", () => {
    it("should navigate to mentor dashboard when targetRole is mentor and user has mentor role", () => {
      const navigate = vi.fn();
      redirectByRole(["mentor", "mentee"], "mentor", navigate);
      expect(navigate).toHaveBeenCalledWith("/dashboard/mentor");
    });

    it("should navigate to mentee dashboard when targetRole is mentee and user has mentee role", () => {
      const navigate = vi.fn();
      redirectByRole(["mentor", "mentee"], "mentee", navigate);
      expect(navigate).toHaveBeenCalledWith("/dashboard/mentee");
    });

    it("should navigate to mentor dashboard when user has mentor role and no targetRole specified", () => {
      const navigate = vi.fn();
      redirectByRole(["mentor"], null, navigate);
      expect(navigate).toHaveBeenCalledWith("/dashboard/mentor");
    });

    it("should navigate to mentee dashboard when user has mentee role and no mentor role", () => {
      const navigate = vi.fn();
      redirectByRole(["mentee"], null, navigate);
      expect(navigate).toHaveBeenCalledWith("/dashboard/mentee");
    });

    it("should navigate to home when user has no matching roles", () => {
      const navigate = vi.fn();
      redirectByRole([], null, navigate);
      expect(navigate).toHaveBeenCalledWith("/");
    });

    it("should prioritize targetRole over default role selection", () => {
      const navigate = vi.fn();
      redirectByRole(["mentor", "mentee"], "mentee", navigate);
      expect(navigate).toHaveBeenCalledWith("/dashboard/mentee");
      expect(navigate).not.toHaveBeenCalledWith("/dashboard/mentor");
    });
  });

  describe("initial state", () => {
    it("should return the initial state", () => {
      expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("logout", () => {
    it("should clear auth state", () => {
      const state = {
        user: { name: "Test" },
        accessToken: "token123",
        loading: false,
        sending: false,
        error: "Some error",
        successMsg: "Success",
        verifiedRole: "mentor",
      };
      const action = logout();
      const newState = authReducer(state, action);

      expect(newState.user).toBeNull();
      expect(newState.accessToken).toBeNull();
      expect(newState.error).toBeNull();
      expect(newState.successMsg).toBeNull();
      expect(newState.verifiedRole).toBe("mentor");
      expect(newState.loading).toBe(false);
      expect(newState.sending).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should set user and accessToken", () => {
      const action = setUser({
        user: { name: "Test User", email: "test@example.com" },
        accessToken: "token123",
      });
      const state = authReducer(initialState, action);

      expect(state.user).toEqual({ name: "Test User", email: "test@example.com", mapped: true });
      expect(state.accessToken).toBe("token123");
    });

    it("should set user to null when payload.user is null", () => {
      const action = setUser({ user: null, accessToken: "token123" });
      const state = authReducer(initialState, action);

      expect(state.user).toBeNull();
      expect(state.accessToken).toBe("token123");
    });

    it("should set accessToken to undefined when not provided", () => {
      const action = setUser({ user: { name: "Test" } });
      const state = authReducer(initialState, action);

      expect(state.user).toEqual({ name: "Test", mapped: true });
      expect(state.accessToken).toBeUndefined();
    });
  });

  describe("clearMessages", () => {
    it("should clear error and successMsg", () => {
      const state = {
        ...initialState,
        error: "Some error",
        successMsg: "Success message",
      };
      const action = clearMessages();
      const newState = authReducer(state, action);

      expect(newState.error).toBeNull();
      expect(newState.successMsg).toBeNull();
    });

    it("should handle clearing when messages are already null", () => {
      const action = clearMessages();
      const state = authReducer(initialState, action);

      expect(state.error).toBeNull();
      expect(state.successMsg).toBeNull();
    });
  });

  describe("registerUser", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: registerUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set user/token", () => {
        const action = {
          type: registerUser.fulfilled.type,
          payload: {
            accessToken: "token123",
            user: { name: "Test User" },
          },
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.accessToken).toBe("token123");
        expect(state.user).toEqual({ name: "Test User", mapped: true });
        expect(state.successMsg).toBe("Account created! Please verify your email.");
      });

      it("should handle null user in payload", () => {
        const action = {
          type: registerUser.fulfilled.type,
          payload: { accessToken: "token123" },
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.accessToken).toBe("token123");
        expect(state.user).toBeNull();
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: registerUser.rejected.type,
          payload: "Registration failed",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Registration failed");
      });
    });
  });

  describe("loginUser", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: loginUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set user/token", () => {
        const action = {
          type: loginUser.fulfilled.type,
          payload: {
            accessToken: "token123",
            user: { name: "Test User" },
          },
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.accessToken).toBe("token123");
        expect(state.user).toEqual({ name: "Test User", mapped: true });
        expect(state.successMsg).toBe("Login successful!");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: loginUser.rejected.type,
          payload: "Login failed",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Login failed");
      });
    });
  });

  describe("sendOtp", () => {
    describe("pending state", () => {
      it("should set sending to true and clear messages", () => {
        const action = { type: sendOtp.pending.type };
        const state = authReducer(initialState, action);

        expect(state.sending).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set sending to false and set success message", () => {
        const action = { type: sendOtp.fulfilled.type };
        const state = authReducer({ ...initialState, sending: true }, action);

        expect(state.sending).toBe(false);
        expect(state.successMsg).toBe("OTP sent to your email.");
      });
    });

    describe("rejected state", () => {
      it("should set sending to false and set error", () => {
        const action = {
          type: sendOtp.rejected.type,
          payload: "Failed to send OTP",
        };
        const state = authReducer({ ...initialState, sending: true }, action);

        expect(state.sending).toBe(false);
        expect(state.error).toBe("Failed to send OTP");
      });
    });
  });

  describe("verifyEmail", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: verifyEmail.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set success message", () => {
        const action = { type: verifyEmail.fulfilled.type };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("Email verified! Redirecting to login...");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: verifyEmail.rejected.type,
          payload: "OTP verification failed",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("OTP verification failed");
      });
    });
  });

  describe("verifyMagicLink", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: verifyMagicLink.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false, success message, and verifiedRole", () => {
        const action = {
          type: verifyMagicLink.fulfilled.type,
          payload: { role: "mentor" },
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("Email verified! Redirecting to login...");
        expect(state.verifiedRole).toBe("mentor");
      });

      it("should handle missing role in payload", () => {
        const action = {
          type: verifyMagicLink.fulfilled.type,
          payload: {},
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.verifiedRole).toBeNull();
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: verifyMagicLink.rejected.type,
          payload: "Magic link verification failed",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Magic link verification failed");
      });
    });
  });

  describe("forgotPassword", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: forgotPassword.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set success message", () => {
        const action = { type: forgotPassword.fulfilled.type };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("OTP sent! Check your email.");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: forgotPassword.rejected.type,
          payload: "Failed to send OTP",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to send OTP");
      });
    });
  });

  describe("verifyResetOtp", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: verifyResetOtp.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set success message", () => {
        const action = { type: verifyResetOtp.fulfilled.type };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("OTP verified!");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: verifyResetOtp.rejected.type,
          payload: "Invalid OTP",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Invalid OTP");
      });
    });
  });

  describe("resetPassword", () => {
    describe("pending state", () => {
      it("should set loading to true and clear messages", () => {
        const action = { type: resetPassword.pending.type };
        const state = authReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.successMsg).toBeNull();
      });
    });

    describe("fulfilled state", () => {
      it("should set loading to false and set success message", () => {
        const action = { type: resetPassword.fulfilled.type };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.successMsg).toBe("Password reset! Redirecting to login...");
      });
    });

    describe("rejected state", () => {
      it("should set loading to false and set error", () => {
        const action = {
          type: resetPassword.rejected.type,
          payload: "Failed to reset password",
        };
        const state = authReducer({ ...initialState, loading: true }, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe("Failed to reset password");
      });
    });
  });

  describe("selectors", () => {
    describe("selectIsAuthenticated", () => {
      it("should return true when accessToken and user exist", () => {
        const state = {
          auth: {
            ...initialState,
            accessToken: "token123",
            user: { name: "Test" },
          },
        };
        expect(selectIsAuthenticated(state)).toBe(true);
      });

      it("should return false when accessToken is null", () => {
        const state = {
          auth: {
            ...initialState,
            user: { name: "Test" },
          },
        };
        expect(selectIsAuthenticated(state)).toBe(false);
      });

      it("should return false when user is null", () => {
        const state = {
          auth: {
            ...initialState,
            accessToken: "token123",
          },
        };
        expect(selectIsAuthenticated(state)).toBe(false);
      });

      it("should return false when both are null", () => {
        const state = { auth: initialState };
        expect(selectIsAuthenticated(state)).toBe(false);
      });
    });

    describe("selectIsVerified", () => {
      it("should return true when user.isVerified is true", () => {
        const state = {
          auth: {
            ...initialState,
            user: { isVerified: true },
          },
        };
        expect(selectIsVerified(state)).toBe(true);
      });

      it("should return false when user.isVerified is false", () => {
        const state = {
          auth: {
            ...initialState,
            user: { isVerified: false },
          },
        };
        expect(selectIsVerified(state)).toBe(false);
      });

      it("should return false when user is null", () => {
        const state = { auth: initialState };
        expect(selectIsVerified(state)).toBe(false);
      });

      it("should return false when user.isVerified is undefined", () => {
        const state = {
          auth: {
            ...initialState,
            user: { name: "Test" },
          },
        };
        expect(selectIsVerified(state)).toBe(false);
      });
    });
  });

  describe("action creators", () => {
    it("should create logout action", () => {
      const action = logout();
      expect(action.type).toBe("auth/logout");
      expect(action.payload).toBeUndefined();
    });

    it("should create setUser action", () => {
      const payload = { user: { name: "Test" }, accessToken: "token" };
      const action = setUser(payload);
      expect(action.type).toBe("auth/setUser");
      expect(action.payload).toEqual(payload);
    });

    it("should create clearMessages action", () => {
      const action = clearMessages();
      expect(action.type).toBe("auth/clearMessages");
      expect(action.payload).toBeUndefined();
    });
  });
});
