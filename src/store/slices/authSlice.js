// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@utils/axiosInstance";

export const redirectByRole = (roles = [], targetRole, navigate) => {
  if (targetRole === "mentor" && roles.includes("mentor")) return navigate("/dashboard/mentor");
  if (targetRole === "mentee" && roles.includes("mentee")) return navigate("/dashboard/mentee");
  if (roles.includes("mentor"))  return navigate("/dashboard/mentor");

  if (roles.includes("mentee"))  return navigate("/dashboard/mentee");
  navigate("/");
};

// ── Thunks ──────────────────────────────────────────────────
//action type prefix ,
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password, roles, termsAccepted }, { rejectWithValue }) => {
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

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/auth/login`, { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Login failed.");
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/verification/send`, { email: email.trim() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Failed to send OTP.");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, otp }, { rejectWithValue }) => {
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

export const verifyMagicLink = createAsyncThunk(
  "auth/verifyMagicLink",
  async ({ token, email }, { rejectWithValue }) => {
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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/auth/forgot-password`, { email: email.trim() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || "Failed to send OTP.");
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, otp }, { rejectWithValue }) => {
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

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
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

// ── Slice ───────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:       null,
    accessToken:null,
    loading:    false,
    sending:    false,   // for resend/send OTP actions
    error:      null,
    successMsg: null,
    verifiedRole: null,
  },
  reducers: {
    logout(state) {
      state.user       = null;
      state.accessToken      = null;
      state.error      = null;
      state.successMsg = null;
    },
    //manually sets user data and token
    setUser(state, action) {
      state.user  = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
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
        state.user       = action.payload.user  || null;
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
        state.user       = action.payload.user  || null;
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
  },
});

export const { logout, setUser, clearMessages } = authSlice.actions;
export default authSlice.reducer;