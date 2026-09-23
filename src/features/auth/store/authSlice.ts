/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@lib/axiosInstance";
import { mapAuthUser } from "@lib/mappers/userMapper";
import type { RootState } from "@store/index";

export const redirectByRole = (
  roles: string[],
  targetRole: string,
  navigate: (path: string) => unknown,
) => {
  if (targetRole === "mentor" && roles.includes("mentor")) return navigate("/dashboard/mentor");
  if (targetRole === "mentee" && roles.includes("mentee")) return navigate("/dashboard/mentee");
  if (roles.includes("mentor")) return navigate("/dashboard/mentor");

  if (roles.includes("mentee")) return navigate("/dashboard/mentee");
  navigate("/");
};

// ── Thunks ──────────────────────────────────────────────────
//action type prefix ,
/**
 * Registers a new user account.
 * @param {{ name: string, email: string, password: string, roles: string[], termsAccepted: boolean }} payload - Registration payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { name, email, password, roles, termsAccepted }: {
      name: string; email: string; password: string; roles: string[]; termsAccepted: boolean;
    },
    { rejectWithValue }: any,
  ) => {
    try {
      const res = await axiosInstance.post(`/auth/register`, {
        name, email, password, roles, termsAccepted },
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Registration failed.");
    }
  }
);

/**
 * Authenticates a user and returns access/session data.
 * @param {{ email: string, password: string }} payload - Login payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.post(`/auth/login`, { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Login failed.");
    }
  }
);

/**
 * Requests that the backend send an OTP to the provided email address.
 * @param {{ email: string }} payload - OTP request payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ email }: { email: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.post(`/verification/send`, { email: email.trim() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Failed to send OTP.");
    }
  }
);

/**
 * Verifies a registration email via OTP.
 * @param {{ email: string, otp: string }} payload - Verification payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.post(`/verification/verify-otp`, {
        email: email.trim(),
        otp,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "OTP verification failed.");
    }
  }
);

/**
 * Verifies email ownership via magic-link token.
 * @param {{ token: string, email: string }} payload - Magic-link verification payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const verifyMagicLink = createAsyncThunk(
  "auth/verifyMagicLink",
  async ({ token, email }: { token: string; email: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.get(
        `/verification/verify/${token}?email=${encodeURIComponent(email)}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Magic link verification failed.");
    }
  }
);

/**
 * Starts the password-reset flow by sending a reset OTP.
 * @param {{ email: string }} payload - Password reset request payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.post(`/auth/forgot-password`, { email: email.trim() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Failed to send OTP.");
    }
  }
);

/**
 * Verifies the OTP entered during password reset.
 * @param {{ email: string, otp: string }} payload - Reset OTP payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.post(`/auth/verify-reset-otp`, {
        email: email.trim(),
        otp,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Invalid OTP.");
    }
  }
);

/**
 * Submits the new password after OTP verification.
 * @param {{ email: string, otp: string, newPassword: string }} payload - Reset password payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, otp, newPassword }: { email: string; otp: string; newPassword: string },
    { rejectWithValue }: any,
  ) => {
    try {
      const res = await axiosInstance.post(`/auth/reset-password`, {
        email: email.trim(),
        otp,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Failed to reset password.");
    }
  }
);

interface AuthState {
  user: ReturnType<typeof mapAuthUser> | Record<string, any> | null;
  accessToken: string | null;
  role: "admin" | null;
  adminBootstrapping: boolean;
  loading: boolean;
  sending: boolean;
  error: string | null | unknown;
  successMsg: string | null;
  verifiedRole: string | null;
}

/**
 * Bootstraps an admin session on mount by probing the HttpOnly admin cookie.
 * Unlike mentor/mentee sessions, the admin backend never returns an access
 * token to the client — the cookie itself is the session — so this thunk
 * only needs to know whether `/admin/auth/me` resolves.
 * @returns {Promise<any>} The admin object from the backend, or null.
 */
export const bootstrapAdminSession = createAsyncThunk(
  "auth/bootstrapAdminSession",
  async (_: void, { rejectWithValue }: any) => {
    try {
      const res = await axiosInstance.get("/admin/auth/me", {
        _skipAuthRedirect: true,
      } as any);
      return res.data?.admin ?? null;
    } catch {
      return rejectWithValue(null);
    }
  }
);

// ── Slice ───────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:       null,
    accessToken:null,
    role:       null,
    adminBootstrapping: true,
    loading:    false,
    sending:    false,   // for resend/send OTP actions
    error:      null,
    successMsg: null,
    verifiedRole: null,
  } as AuthState,
  reducers: {
    /**
     * Clears client-side auth state without calling the backend.
     * @param {Object} state - Slice state.
     * @returns {void}
     */
    logout(state) {
      state.user       = null;
      state.accessToken      = null;
      state.role        = null;
      state.error      = null;
      state.successMsg = null;
    },
    //manually sets user data and token
    /**
     * Stores the authenticated user and access token in Redux.
     * @param {Object} state - Slice state.
     * @param {{ payload: { user?: Object, accessToken?: string } }} action - Login payload.
     * @returns {void}
     */
    setUser(state, action: { payload: { user?: Record<string, any>; accessToken?: string } }) {
      state.user  = action.payload.user ? mapAuthUser(action.payload.user) : null;
      state.accessToken = action.payload.accessToken;
    },
    /**
     * Stores an authenticated admin session. Admins have no access token —
     * their session lives entirely in the HttpOnly admin cookie — so this
     * only needs to record the admin object and flip the role marker.
     * @param {Object} state - Slice state.
     * @param {{ payload: Record<string, any> | null }} action - Admin payload.
     * @returns {void}
     */
    setAdminSession(state, action: { payload: Record<string, any> | null }) {
      state.user  = action.payload;
      state.role  = action.payload ? "admin" : null;
      state.adminBootstrapping = false;
    },
    /**
     * Clears transient auth feedback messages.
     * @param {Object} state - Slice state.
     * @returns {void}
     */
    clearMessages(state) {
      state.error      = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading    = false;
        state.accessToken  = action.payload.accessToken || null;
        state.user       = action.payload.user ? mapAuthUser(action.payload.user) : null;
        state.successMsg = "Account created! Please verify your email.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading    = false;
        state.accessToken = action.payload.accessToken || null;
        state.user       = action.payload.user ? mapAuthUser(action.payload.user) : null;
        state.successMsg = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Send OTP ──
    builder
      .addCase(sendOtp.pending, (state) => {
        state.sending    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.sending    = false;
        state.successMsg = "OTP sent to your email.";
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.sending = false;
        state.error   = action.payload;
      });

    // ── Verify Email (OTP) ──
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading    = false;
        state.successMsg = "Email verified! Redirecting to login...";
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Verify Magic Link ──
    builder
      .addCase(verifyMagicLink.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(verifyMagicLink.fulfilled, (state, action) => {
  state.loading        = false;
  state.successMsg     = "Email verified! Redirecting to login...";
  state.verifiedRole   = action.payload?.role || null;
})
      .addCase(verifyMagicLink.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Forgot Password ──
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading    = false;
        state.successMsg = "OTP sent! Check your email.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Verify Reset OTP ──
    builder
      .addCase(verifyResetOtp.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.loading    = false;
        state.successMsg = "OTP verified!";
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Reset Password ──
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading    = true;
        state.error      = null;
        state.successMsg = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading    = false;
        state.successMsg = "Password reset! Redirecting to login...";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Bootstrap Admin Session ──
    builder
      .addCase(bootstrapAdminSession.pending, (state) => {
        state.adminBootstrapping = true;
      })
      .addCase(bootstrapAdminSession.fulfilled, (state, action) => {
        state.adminBootstrapping = false;
        state.user = action.payload;
        state.role = action.payload ? "admin" : null;
      })
      .addCase(bootstrapAdminSession.rejected, (state) => {
        state.adminBootstrapping = false;
        if (state.role === "admin") {
          state.user = null;
          state.role = null;
        }
      });
  },
});

/**
 * True once the current session is fully authenticated, regardless of role.
 * Mentor/mentee sessions need both a Redux access token and a user object
 * (the token proves the bearer session; the cookie alone isn't enough).
 * Admin sessions carry no access token by design — the HttpOnly admin
 * cookie is themselves the session — so presence of an admin user is enough.
 */
export const selectIsAuthenticated = (state: RootState) => {
  const { user, accessToken, role } = state.auth;
  if (!user) return false;
  return role === "admin" ? true : Boolean(accessToken);
};

export const selectIsVerified = (state: RootState) => state.auth.user?.isVerified === true;

export const selectRole = (state: RootState) => state.auth.role;

export const { logout, setUser, setAdminSession, clearMessages } = authSlice.actions;

export default authSlice.reducer;
