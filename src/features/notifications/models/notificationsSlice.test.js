import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  incrementUnread,
  clearBadge,
  loadSampleData,
  resetNotifications,
  selectUsingSampleData,
} from "./notificationsSlice";
import * as api from "@features/notifications/models/notifications.api";

vi.mock("@features/notifications/models/notifications.api", () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn().mockResolvedValue({}),
  markAllNotificationsRead: vi.fn().mockResolvedValue({}),
  clearAllNotifications: vi.fn().mockResolvedValue({}),
  deleteNotification: vi.fn().mockResolvedValue({}),
}));

const raw = (id, read = false) => ({ _id: id, read, type: "new_message", createdAt: new Date().toISOString() });
const setup = async (list = [raw("a"), raw("b"), raw("c", true)]) => {
  api.getNotifications.mockResolvedValue({ data: { notifications: list } });
  const store = configureStore({ reducer: { notifications: reducer } });
  await store.dispatch(fetchNotifications());
  return store;
};
const st = (store) => store.getState().notifications;

describe("notificationsSlice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetch stores normalized items and derives the unread badge", async () => {
    const store = await setup();
    expect(st(store).items).toHaveLength(3);
    expect(st(store).unreadCount).toBe(2);
    expect(st(store).status).toBe("succeeded");
  });

  it("fetch failure sets status failed and leaves data alone", async () => {
    const store = await setup();
    api.getNotifications.mockRejectedValue(new Error("down"));
    await store.dispatch(fetchNotifications());
    expect(st(store).status).toBe("failed");
    expect(st(store).unreadCount).toBe(2);
  });

  it("markRead marks the item and decrements the badge once", async () => {
    const store = await setup();
    await store.dispatch(markNotificationAsRead("a"));
    await store.dispatch(markNotificationAsRead("a")); // already read → no double decrement
    expect(api.markNotificationRead).toHaveBeenCalledWith("a");
    expect(st(store).items.find((n) => n.id === "a").read).toBe(true);
    expect(st(store).unreadCount).toBe(1);
  });

  it("does not update state when the API call fails", async () => {
    const store = await setup();
    api.markNotificationRead.mockRejectedValueOnce(new Error("nope"));
    await store.dispatch(markNotificationAsRead("a"));
    expect(st(store).unreadCount).toBe(2);
  });

  it("markAll / delete / clearAll keep the badge consistent", async () => {
    let store = await setup();
    await store.dispatch(removeNotification("a"));
    expect(st(store).items).toHaveLength(2);
    expect(st(store).unreadCount).toBe(1);
    await store.dispatch(removeNotification("c")); // read item → badge unchanged
    expect(st(store).unreadCount).toBe(1);
    await store.dispatch(markAllNotificationsAsRead());
    expect(st(store).unreadCount).toBe(0);
    expect(st(store).items.every((n) => n.read)).toBe(true);
    store = await setup();
    await store.dispatch(clearNotifications());
    expect(st(store).items).toEqual([]);
    expect(st(store).unreadCount).toBe(0);
  });

  it("socket increment / clearBadge / reset", async () => {
    const store = await setup();
    store.dispatch(incrementUnread());
    expect(st(store).unreadCount).toBe(3);
    store.dispatch(clearBadge());
    expect(st(store).unreadCount).toBe(0);
    store.dispatch(resetNotifications());
    expect(st(store).items).toEqual([]);
    expect(st(store).status).toBe("idle");
  });

  it("sample data skips the API and never touches the header badge", async () => {
    const store = configureStore({ reducer: { notifications: reducer } });
    store.dispatch(loadSampleData([{ id: 1, read: false }, { id: 2, read: false }]));
    expect(st(store).unreadCount).toBe(0);
    await store.dispatch(markNotificationAsRead(1));
    await store.dispatch(removeNotification(2));
    await store.dispatch(markAllNotificationsAsRead());
    await store.dispatch(clearNotifications());
    expect(api.markNotificationRead).not.toHaveBeenCalled();
    expect(api.deleteNotification).not.toHaveBeenCalled();
    expect(api.markAllNotificationsRead).not.toHaveBeenCalled();
    expect(api.clearAllNotifications).not.toHaveBeenCalled();
    expect(st(store).items).toEqual([]);
  });

  describe("badge stays cleared while the notifications tab is open", () => {
    it("a refetch after clearBadge does not resurrect the count", async () => {
      const store = await setup(); // 2 unread → badge 2
      store.dispatch(clearBadge()); // shell: tab opened
      await store.dispatch(fetchNotifications()); // tab's own fetch
      expect(st(store).unreadCount).toBe(0);
      expect(st(store).items.filter((n) => !n.read)).toHaveLength(2); // list itself still shows unread
    });

    it("a new socket notification makes the badge meaningful again", async () => {
      const store = await setup();
      store.dispatch(clearBadge());
      store.dispatch(incrementUnread());
      expect(st(store).unreadCount).toBe(1);
      await store.dispatch(fetchNotifications()); // now recomputed from the list (2 unread)
      expect(st(store).unreadCount).toBe(2);
    });

    it("the first fetch after clearBadge is also ignored for the badge (tab opened before shell fetch resolved)", async () => {
      api.getNotifications.mockResolvedValue({ data: { notifications: [raw("a"), raw("b")] } });
      const store = configureStore({ reducer: { notifications: reducer } });
      store.dispatch(clearBadge());
      await store.dispatch(fetchNotifications());
      expect(st(store).unreadCount).toBe(0);
    });
  });

  describe("stale responses", () => {
    it("a fetch that resolves after reset (logout) is ignored", async () => {
      let resolve;
      api.getNotifications.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
      const store = configureStore({ reducer: { notifications: reducer } });
      const pending = store.dispatch(fetchNotifications());
      store.dispatch(resetNotifications()); // logout
      resolve({ data: { notifications: [raw("old-user")] } });
      await pending;
      expect(st(store).items).toEqual([]);
      expect(st(store).unreadCount).toBe(0);
      expect(st(store).status).toBe("idle");
    });

    it("an older response can't overwrite a newer one", async () => {
      let resolveOld;
      api.getNotifications
        .mockReturnValueOnce(new Promise((r) => { resolveOld = r; }))
        .mockResolvedValueOnce({ data: { notifications: [raw("new")] } });
      const store = configureStore({ reducer: { notifications: reducer } });
      const first = store.dispatch(fetchNotifications());
      await store.dispatch(fetchNotifications());
      resolveOld({ data: { notifications: [raw("old1"), raw("old2")] } });
      await first;
      expect(st(store).items.map((n) => n.id)).toEqual(["new"]);
    });
  });

  it("selectUsingSampleData reflects sample mode", () => {
    const store = configureStore({ reducer: { notifications: reducer } });
    expect(selectUsingSampleData(store.getState())).toBe(false);
    store.dispatch(loadSampleData([]));
    expect(selectUsingSampleData(store.getState())).toBe(true);
  });
});
