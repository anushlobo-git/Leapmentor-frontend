/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getEscrowWallet } from "@features/mentee/models/mentee.api";
import { mapWallet } from "@features/profile/models/settingsMapper";
import logger from "@lib/monitoring/logger";

/**
 * The mentee's token wallet — one copy for every screen that shows it:
 *  - Home tab (LeapPointsPanel) and Settings read `balance` / `escrow`
 *  - the escrow payment modals read the balance and refresh it after paying
 * Mentee-only: never fetched for mentors.
 */
type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface WalletState {
  balance: number;
  escrow: number;
  status: LoadStatus;
  /** True once a real balance is known (successful fetch, or `walletSynced`). Stays false when the
   * first fetch fails, so consumers can keep treating the balance as "unknown" (`null`). */
  loadedOnce: boolean;
  error: string | null;
  /** requestId of the latest fetch — stale responses (after reset/logout, or superseded) are ignored. */
  fetchRequestId: string | null;
}

const initialState: WalletState = {
  balance: 0,
  escrow: 0,
  status: "idle",
  loadedOnce: false,
  error: null,
  fetchRequestId: null,
};

/** Loads `/escrow/wallet`. Call again after a payment so every screen shows the new balance. */
/**createAsyncThunk<
  SUCCESS_RESULT,       // 1. fulfilled payload
  ARGUMENT,             // 2. argument given to fetchWallet(...)
  THUNK_API_OPTIONS     // 3. rejectWithValue type, etc.
> */
export const fetchWallet = createAsyncThunk<
  { balance: number; escrow: number },
  void,
  { rejectValue: string }
>("wallet/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await getEscrowWallet();
    return mapWallet(res.data);
  } catch (err) {
    logger.warn("Failed to fetch wallet", { error: err?.message });
    return rejectWithValue(err?.response?.data?.message || "Failed to load wallet.");
  }
});

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    /** Another response already carried fresh wallet data (e.g. `getEscrowStatus().wallet.balance`). */
    walletSynced(state, action: PayloadAction<{ balance: number; escrow?: number }>) {
      state.balance = action.payload.balance;
      if (typeof action.payload.escrow === "number") state.escrow = action.payload.escrow;
      state.loadedOnce = true;
    },
    resetWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.fetchRequestId = action.meta.requestId;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return; // stale
        state.status = "succeeded";
        state.loadedOnce = true;
        state.balance = action.payload.balance;
        state.escrow = action.payload.escrow;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return; // stale
        state.status = "failed";
        state.error = action.payload ?? "Failed to load wallet.";
      });
  },
});

export const { walletSynced, resetWallet } = walletSlice.actions;

type RootLike = { wallet: WalletState };

export const selectWallet = (state: RootLike) => state.wallet;
export const selectWalletBalance = (state: RootLike) => state.wallet.balance;
export const selectWalletEscrow = (state: RootLike) => state.wallet.escrow;
/** Balance, or `null` until one is actually known — what the payment UIs render as "—". */
export const selectWalletBalanceOrNull = (state: RootLike): number | null =>
  state.wallet.loadedOnce ? state.wallet.balance : null;

export default walletSlice.reducer;
