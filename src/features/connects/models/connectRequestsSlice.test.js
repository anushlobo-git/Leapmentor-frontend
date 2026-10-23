import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchMentorRequests,
  fetchMenteeRequests,
  deleteMenteeRequest,
  patchMentorRequest,
  patchMenteeRequest,
  resetConnectRequests,
  selectMentorRequestList,
  selectMenteeRequestList,
} from "./connectRequestsSlice";
import { getIncomingRequests } from "@features/mentor/models/mentor.api";
import { getMyConnectRequests, deleteConnectRequest } from "@features/mentee/models/mentee.api";

vi.mock("@features/mentor/models/mentor.api", () => ({ getIncomingRequests: vi.fn() }));
vi.mock("@features/mentee/models/mentee.api", () => ({
  getMyConnectRequests: vi.fn(),
  deleteConnectRequest: vi.fn(),
}));
vi.mock("@lib/monitoring/logger", () => ({ default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const makeStore = () => configureStore({ reducer: { connectRequests: reducer } });

describe("connectRequestsSlice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks mentor loading → success with loadedOnce", async () => {
    getIncomingRequests.mockResolvedValue({ data: { requests: [{ _id: "1", status: "pending" }] } });
    const store = makeStore();
    const p = store.dispatch(fetchMentorRequests());
    expect(selectMentorRequestList(store.getState()).status).toBe("loading");
    await p;
    const list = selectMentorRequestList(store.getState());
    expect(list).toMatchObject({ status: "succeeded", loadedOnce: true, error: null });
    expect(list.items).toHaveLength(1);
  });

  it("falls back to [] when the API omits requests", async () => {
    getIncomingRequests.mockResolvedValue({ data: {} });
    const store = makeStore();
    await store.dispatch(fetchMentorRequests());
    expect(selectMentorRequestList(store.getState()).items).toEqual([]);
  });

  it("stores the API message on failure, with a generic fallback", async () => {
    const store = makeStore();
    getIncomingRequests.mockRejectedValueOnce({ response: { data: { message: "nope" } } });
    await store.dispatch(fetchMentorRequests());
    expect(selectMentorRequestList(store.getState())).toMatchObject({ status: "failed", loadedOnce: true, error: "nope" });
    getMyConnectRequests.mockRejectedValueOnce(new Error("x"));
    await store.dispatch(fetchMenteeRequests());
    expect(selectMenteeRequestList(store.getState()).error).toBe("Failed to load requests.");
  });

  it("clears the error on the next attempt and keeps old items while refetching", async () => {
    const store = makeStore();
    getMyConnectRequests.mockResolvedValueOnce({ data: { requests: [{ _id: "1", status: "pending" }] } });
    await store.dispatch(fetchMenteeRequests());
    getMyConnectRequests.mockRejectedValueOnce(new Error("x"));
    await store.dispatch(fetchMenteeRequests());
    getMyConnectRequests.mockReturnValueOnce(new Promise(() => {}));
    store.dispatch(fetchMenteeRequests());
    const list = selectMenteeRequestList(store.getState());
    expect(list.error).toBeNull();
    expect(list.items).toHaveLength(1);
  });

  it("mentor and mentee lists are independent", async () => {
    getIncomingRequests.mockResolvedValue({ data: { requests: [{ _id: "m" }] } });
    const store = makeStore();
    await store.dispatch(fetchMentorRequests());
    expect(selectMenteeRequestList(store.getState()).items).toEqual([]);
    expect(selectMenteeRequestList(store.getState()).loadedOnce).toBe(false);
  });

  it("patches a request in place (mentor and mentee)", async () => {
    getIncomingRequests.mockResolvedValue({ data: { requests: [{ _id: "1", status: "pending" }] } });
    getMyConnectRequests.mockResolvedValue({ data: { requests: [{ _id: "2", status: "pending" }] } });
    const store = makeStore();
    await store.dispatch(fetchMentorRequests());
    await store.dispatch(fetchMenteeRequests());
    store.dispatch(patchMentorRequest({ id: "1", patch: { status: "accepted" } }));
    store.dispatch(patchMenteeRequest({ id: "2", patch: { status: "ongoing" } }));
    store.dispatch(patchMentorRequest({ id: "missing", patch: { status: "x" } })); // no-op
    expect(selectMentorRequestList(store.getState()).items[0].status).toBe("accepted");
    expect(selectMenteeRequestList(store.getState()).items[0].status).toBe("ongoing");
  });

  it("deleteMenteeRequest removes the item only after the API succeeds", async () => {
    getMyConnectRequests.mockResolvedValue({ data: { requests: [{ _id: "1" }, { _id: "2" }] } });
    const store = makeStore();
    await store.dispatch(fetchMenteeRequests());
    deleteConnectRequest.mockRejectedValueOnce(new Error("no"));
    await store.dispatch(deleteMenteeRequest("1"));
    expect(selectMenteeRequestList(store.getState()).items).toHaveLength(2);
    deleteConnectRequest.mockResolvedValueOnce({});
    await store.dispatch(deleteMenteeRequest("1"));
    expect(selectMenteeRequestList(store.getState()).items.map((r) => r._id)).toEqual(["2"]);
  });

  it("reset returns to the initial state", async () => {
    getIncomingRequests.mockResolvedValue({ data: { requests: [{ _id: "1" }] } });
    const store = makeStore();
    await store.dispatch(fetchMentorRequests());
    store.dispatch(resetConnectRequests());
    expect(selectMentorRequestList(store.getState())).toMatchObject({ items: [], status: "idle", loadedOnce: false });
  });

  it("ignores a fetch that resolves after reset (logout)", async () => {
    let resolve;
    getIncomingRequests.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
    const store = makeStore();
    const pending = store.dispatch(fetchMentorRequests());
    store.dispatch(resetConnectRequests());
    resolve({ data: { requests: [{ _id: "old-user" }] } });
    await pending;
    expect(selectMentorRequestList(store.getState())).toMatchObject({ items: [], status: "idle", loadedOnce: false });
  });

  it("ignores a stale failure after reset too", async () => {
    let reject;
    getMyConnectRequests.mockReturnValueOnce(new Promise((_, r) => { reject = r; }));
    const store = makeStore();
    const pending = store.dispatch(fetchMenteeRequests());
    store.dispatch(resetConnectRequests());
    reject(new Error("late"));
    await pending;
    expect(selectMenteeRequestList(store.getState())).toMatchObject({ status: "idle", error: null });
  });

  it("an older response can't overwrite a newer one", async () => {
    let resolveOld;
    getIncomingRequests
      .mockReturnValueOnce(new Promise((r) => { resolveOld = r; }))
      .mockResolvedValueOnce({ data: { requests: [{ _id: "new" }] } });
    const store = makeStore();
    const first = store.dispatch(fetchMentorRequests());
    await store.dispatch(fetchMentorRequests());
    resolveOld({ data: { requests: [{ _id: "old" }] } });
    await first;
    expect(selectMentorRequestList(store.getState()).items.map((r) => r._id)).toEqual(["new"]);
  });
});
