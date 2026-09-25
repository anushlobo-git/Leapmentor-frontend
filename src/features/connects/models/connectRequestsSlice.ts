/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type AsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getIncomingRequests } from "@features/mentor/models/mentor.api";
import { getMyConnectRequests, deleteConnectRequest } from "@features/mentee/models/mentee.api";
import logger from "@lib/monitoring/logger";

/**
 * Connect requests, shared by every screen that shows them:
 *  - mentor side: home tab (active sessions / pending count / badges) + requests tab
 *  - mentee side: home tab (upcoming sessions) + request history
 * Items are stored as returned by the API; screens derive what they need.
 */
type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

/** A connect request as returned by the API (only the fields every screen relies on are named). */
export interface ConnectRequest {
  _id: string;
  status: string;
  [field: string]: any;
}

type RequestPatch = Partial<Omit<ConnectRequest, "_id">>;

interface RequestList {
  items: ConnectRequest[];
  status: LoadStatus;
  /** True after the first fetch settles (success or failure) — drives "first load" spinners. */
  loadedOnce: boolean;
  error: string | null;
  /** requestId of the latest fetch — stale responses (after reset/logout, or superseded) are ignored. */
  requestId: string | null;
}

interface ConnectRequestsState {
  mentor: RequestList;
  mentee: RequestList;
}

const emptyList = (): RequestList => ({ items: [], status: "idle", loadedOnce: false, error: null, requestId: null });

const initialState: ConnectRequestsState = { mentor: emptyList(), mentee: emptyList() };

type FetchThunk = AsyncThunk<ConnectRequest[], void, { rejectValue: string }>;

export const fetchMentorRequests: FetchThunk = createAsyncThunk<
  ConnectRequest[],
  void,
  { rejectValue: string }
>(
  "connectRequests/fetchMentor",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getIncomingRequests();
      return (res.data.requests || []) as ConnectRequest[];
    } catch (err: any) {
      logger.warn("Failed to fetch incoming mentor requests", { error: err?.message });
      return rejectWithValue(err?.response?.data?.message || "Failed to load requests.");
    }
  },
);

export const fetchMenteeRequests: FetchThunk = createAsyncThunk<
  ConnectRequest[],
  void,
  { rejectValue: string }
>(
  "connectRequests/fetchMentee",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyConnectRequests();
      return (Array.isArray(res.data.requests) ? res.data.requests : []) as ConnectRequest[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to load requests.");
    }
  },
);

export const deleteMenteeRequest = createAsyncThunk<string, string>(
  "connectRequests/deleteMentee",
  async (id) => {
    await deleteConnectRequest(id);
    return id;
  },
);

const bindFetch = (
  builder: ActionReducerMapBuilder<ConnectRequestsState>,
  thunk: FetchThunk,
  key: "mentor" | "mentee",
) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state[key].status = "loading";
      state[key].error = null;
      state[key].requestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return; // stale
      state[key].status = "succeeded";
      state[key].loadedOnce = true;
      state[key].items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return; // stale
      state[key].status = "failed";
      state[key].loadedOnce = true;
      state[key].error = action.payload ?? "Failed to load requests.";
    });
};

const patchIn = (list: RequestList, id: string, patch: RequestPatch) => {
  const item = list.items.find((r) => r._id === id);
  if (item) Object.assign(item, patch);
};

const connectRequestsSlice = createSlice({
  name: "connectRequests",
  initialState,
  reducers: {
    /** Optimistic in-place update after the mentor responds to a request. */
    patchMentorRequest(state, action: PayloadAction<{ id: string; patch: RequestPatch }>) {
      patchIn(state.mentor, action.payload.id, action.payload.patch);
    },
    patchMenteeRequest(state, action: PayloadAction<{ id: string; patch: RequestPatch }>) {
      patchIn(state.mentee, action.payload.id, action.payload.patch);
    },
    resetConnectRequests: () => initialState,
  },
  extraReducers: (builder) => {
    bindFetch(builder, fetchMentorRequests, "mentor");
    bindFetch(builder, fetchMenteeRequests, "mentee");
    builder.addCase(deleteMenteeRequest.fulfilled, (state, action) => {
      state.mentee.items = state.mentee.items.filter((r) => r._id !== action.payload);
    });
  },
});

export const { patchMentorRequest, patchMenteeRequest, resetConnectRequests } =
  connectRequestsSlice.actions;

type RootLike = { connectRequests: ConnectRequestsState };
export const selectMentorRequestList = (state: RootLike) => state.connectRequests.mentor;
export const selectMenteeRequestList = (state: RootLike) => state.connectRequests.mentee;

export default connectRequestsSlice.reducer;
