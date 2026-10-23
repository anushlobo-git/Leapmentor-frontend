/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  getNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  markNotificationRead,
  deleteNotification,
} from "@features/notifications/models/notifications.api";
import { normalizeApiNotif } from "@features/notifications/models/notificationMapper";

export interface NotificationItem {
  id: string | number | null;
  type: string;
  read: boolean;
  time: string;
  accent?: boolean;
  title: string;
  senderName: string;
  body: string;
  actions: { label: string; primary: boolean }[];
  isApi?: boolean;
}

interface NotificationsState {
  items: NotificationItem[];
  /** Header badge. Kept separate from `items` because socket/push events bump it
   * before the list has been refetched. */
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  /** True when the list is sample data shown because the API failed — API calls are skipped. */
  usingSampleData: boolean;
  /** Badge was deliberately zeroed (notifications tab opened). Until a new push/socket
   * notification arrives, a list refetch must not bring the badge back. */
  badgeCleared: boolean;
  /** requestId of the latest list fetch — older/stale responses (e.g. after logout) are ignored. */
  fetchRequestId: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  status: "idle",
  usingSampleData: false,
  badgeCleared: false,
  fetchRequestId: null,
};

/** One source for both the shell's unread badge and the notifications tab. */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await getNotifications();
    return (Array.isArray(res.data.notifications) ? res.data.notifications : []).map(
      normalizeApiNotif,
    ) as NotificationItem[];
  },
);

type RootLike = { notifications: NotificationsState };
const isSample = (getState: () => unknown) =>
  (getState() as RootLike).notifications.usingSampleData;

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markRead",
  async (id: NotificationItem["id"], { getState }) => {
    if (!isSample(getState)) await markNotificationRead(id);
    return id;
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_: void, { getState }) => {
    if (!isSample(getState)) await markAllNotificationsRead();
  },
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id: NotificationItem["id"], { getState }) => {
    if (!isSample(getState)) await deleteNotification(id);
    return id;
  },
);

export const clearNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_: void, { getState }) => {
    if (!isSample(getState)) await clearAllNotifications();
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /** Socket / push notification arrived. */
    incrementUnread(state) {
      state.unreadCount += 1;
      state.badgeCleared = false; // something new arrived — the badge is meaningful again
    },
    /** Zero the header badge (opening the notifications tab). */
    clearBadge(state) {
      state.unreadCount = 0;
      state.badgeCleared = true;
    },
    /** API failed → show sample data so the tab isn't empty. */
    loadSampleData(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload;
      state.usingSampleData = true; // sample items never touch the header badge
    },
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        state.status = "loading";
        state.fetchRequestId = action.meta.requestId;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return; // stale (reset or superseded)
        state.status = "succeeded";
        state.usingSampleData = false;
        state.items = action.payload;
        // Tab-open cleared the badge on purpose; don't let the refetch resurrect it.
        if (!state.badgeCleared) {
          state.unreadCount = action.payload.filter((n) => !n.read).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.status = "failed";
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.read) {
          item.read = true;
          if (!state.usingSampleData) state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.read = true; });
        if (!state.usingSampleData) state.unreadCount = 0;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.read && !state.usingSampleData) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n.id !== action.payload);
      })
      .addCase(clearNotifications.fulfilled, (state) => {
        state.items = [];
        if (!state.usingSampleData) state.unreadCount = 0;
      });
  },
});

export const { incrementUnread, clearBadge, loadSampleData, resetNotifications } =
  notificationsSlice.actions;

export const selectNotifications = (state: RootLike) => state.notifications.items;
export const selectUnreadCount = (state: RootLike) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state: RootLike) => state.notifications.status;
export const selectUsingSampleData = (state: RootLike) => state.notifications.usingSampleData;

export default notificationsSlice.reducer;
