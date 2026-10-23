import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchWallet,
  walletSynced,
  resetWallet,
  selectWallet,
  selectWalletBalance,
  selectWalletEscrow,
  selectWalletBalanceOrNull,
} from "./walletSlice";
import * as api from "@features/mentee/models/mentee.api";

vi.mock("@features/mentee/models/mentee.api", () => ({
  getEscrowWallet: vi.fn(),
}));

vi.mock("@lib/monitoring/logger", () => ({
  default: { warn: vi.fn(), error: vi.fn() },
}));

const makeStore = () => configureStore({ reducer: { wallet: reducer } });
const st = (store) => store.getState().wallet;

/** A promise the test resolves/rejects by hand, to control response ordering. */
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("walletSlice", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts empty: zero balance, idle, nothing known yet", () => {
    const store = makeStore();
    expect(st(store)).toMatchObject({
      balance: 0,
      escrow: 0,
      status: "idle",
      loadedOnce: false,
      error: null,
    });
    expect(selectWalletBalanceOrNull(store.getState())).toBeNull();
  });

  describe("fetchWallet", () => {
    it("stores the mapped balance and escrow", async () => {
      api.getEscrowWallet.mockResolvedValue({ data: { balance: 250, escrow: 120 } });
      const store = makeStore();

      await store.dispatch(fetchWallet());

      expect(api.getEscrowWallet).toHaveBeenCalledTimes(1);
      expect(st(store)).toMatchObject({
        balance: 250,
        escrow: 120,
        status: "succeeded",
        loadedOnce: true,
        error: null,
      });
    });

    it("defaults missing / non-numeric fields to 0 (mapWallet)", async () => {
      api.getEscrowWallet.mockResolvedValue({ data: { balance: "12", escrow: null } });
      const store = makeStore();

      await store.dispatch(fetchWallet());

      expect(st(store)).toMatchObject({ balance: 0, escrow: 0, status: "succeeded" });
    });

    it("goes to loading while the request is in flight", async () => {
      const d = deferred();
      api.getEscrowWallet.mockReturnValue(d.promise);
      const store = makeStore();

      const req = store.dispatch(fetchWallet());
      expect(st(store).status).toBe("loading");

      d.resolve({ data: { balance: 5, escrow: 1 } });
      await req;
      expect(st(store).status).toBe("succeeded");
    });

    it("failure sets status failed + error, keeps the balance unknown", async () => {
      api.getEscrowWallet.mockRejectedValue({ response: { data: { message: "Wallet locked" } } });
      const store = makeStore();

      const result = await store.dispatch(fetchWallet());

      expect(fetchWallet.rejected.match(result)).toBe(true);
      expect(st(store)).toMatchObject({
        status: "failed",
        error: "Wallet locked",
        loadedOnce: false,
        balance: 0,
      });
      expect(selectWalletBalanceOrNull(store.getState())).toBeNull();
    });

    it("failure falls back to a generic message", async () => {
      api.getEscrowWallet.mockRejectedValue(new Error("boom"));
      const store = makeStore();

      await store.dispatch(fetchWallet());

      expect(st(store).error).toBe("Failed to load wallet.");
    });

    it("a failed refresh leaves the last known balance in place", async () => {
      api.getEscrowWallet.mockResolvedValueOnce({ data: { balance: 250, escrow: 120 } });
      const store = makeStore();
      await store.dispatch(fetchWallet());

      api.getEscrowWallet.mockRejectedValueOnce(new Error("down"));
      await store.dispatch(fetchWallet());

      expect(st(store)).toMatchObject({ balance: 250, escrow: 120, status: "failed", loadedOnce: true });
    });

    it("a refetch after a payment replaces the balance", async () => {
      api.getEscrowWallet.mockResolvedValueOnce({ data: { balance: 500, escrow: 0 } });
      const store = makeStore();
      await store.dispatch(fetchWallet());

      api.getEscrowWallet.mockResolvedValueOnce({ data: { balance: 380, escrow: 120 } });
      await store.dispatch(fetchWallet());

      expect(st(store)).toMatchObject({ balance: 380, escrow: 120 });
    });

    it("ignores a result that arrives after resetWallet (logout / role switch)", async () => {
      const d = deferred();
      api.getEscrowWallet.mockReturnValue(d.promise);
      const store = makeStore();

      const req = store.dispatch(fetchWallet());
      store.dispatch(resetWallet());
      d.resolve({ data: { balance: 999, escrow: 1 } });
      await req;

      expect(st(store)).toMatchObject({ balance: 0, escrow: 0, status: "idle", loadedOnce: false });
    });

    it("ignores a failure that arrives after resetWallet", async () => {
      const d = deferred();
      api.getEscrowWallet.mockReturnValue(d.promise);
      const store = makeStore();

      const req = store.dispatch(fetchWallet());
      store.dispatch(resetWallet());
      d.reject(new Error("late"));
      await req;

      expect(st(store)).toMatchObject({ status: "idle", error: null });
    });

    it("only the latest of two overlapping fetches wins", async () => {
      const older = deferred();
      const newer = deferred();
      api.getEscrowWallet.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
      const store = makeStore();

      const first = store.dispatch(fetchWallet()); // e.g. Home mount
      const second = store.dispatch(fetchWallet()); // e.g. post-payment refresh

      newer.resolve({ data: { balance: 380, escrow: 120 } });
      await second;
      older.resolve({ data: { balance: 500, escrow: 0 } }); // pre-payment response arrives late
      await first;

      expect(st(store)).toMatchObject({ balance: 380, escrow: 120, status: "succeeded" });
    });
  });

  describe("walletSynced", () => {
    it("sets the balance and marks it known, without any API call", () => {
      const store = makeStore();

      store.dispatch(walletSynced({ balance: 500 }));

      expect(api.getEscrowWallet).not.toHaveBeenCalled();
      expect(st(store)).toMatchObject({ balance: 500, escrow: 0, loadedOnce: true, status: "idle" });
      expect(selectWalletBalanceOrNull(store.getState())).toBe(500);
    });

    it("leaves escrow alone unless one is provided", () => {
      const store = makeStore();
      store.dispatch(walletSynced({ balance: 500, escrow: 40 }));

      store.dispatch(walletSynced({ balance: 480 }));
      expect(st(store)).toMatchObject({ balance: 480, escrow: 40 });

      store.dispatch(walletSynced({ balance: 470, escrow: 60 }));
      expect(st(store)).toMatchObject({ balance: 470, escrow: 60 });
    });

    it("accepts a balance of 0 as a known value", () => {
      const store = makeStore();
      store.dispatch(walletSynced({ balance: 0 }));
      expect(selectWalletBalanceOrNull(store.getState())).toBe(0);
    });
  });

  describe("resetWallet", () => {
    it("returns to the initial state", async () => {
      api.getEscrowWallet.mockResolvedValue({ data: { balance: 250, escrow: 120 } });
      const store = makeStore();
      await store.dispatch(fetchWallet());

      store.dispatch(resetWallet());

      expect(st(store)).toEqual({
        balance: 0,
        escrow: 0,
        status: "idle",
        loadedOnce: false,
        error: null,
        fetchRequestId: null,
      });
      expect(selectWalletBalanceOrNull(store.getState())).toBeNull();
    });
  });

  describe("state shape", () => {
    it("is serializable (plain values only)", async () => {
      api.getEscrowWallet.mockResolvedValue({ data: { balance: 1, escrow: 2 } });
      const store = makeStore();
      await store.dispatch(fetchWallet());

      expect(JSON.parse(JSON.stringify(st(store)))).toEqual(st(store));
    });
  });

  describe("selectors", () => {
    it("expose balance, escrow and the whole slice", () => {
      const store = makeStore();
      store.dispatch(walletSynced({ balance: 90, escrow: 10 }));
      const state = store.getState();

      expect(selectWalletBalance(state)).toBe(90);
      expect(selectWalletEscrow(state)).toBe(10);
      expect(selectWallet(state)).toBe(state.wallet); // stable reference, safe for useSelector
    });
  });
});
