import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sharedDashboardLoader,
  shouldRevalidateSharedDashboard,
} from "./sharedDashboard.loader";
import { getConnectDetail } from "@features/shared-dashboard/models/shared-dashboard.api";

const mockState = { auth: {} };
vi.mock("@store/index", () => ({ default: { getState: () => mockState } }));
vi.mock("@features/auth/models/authSlice", () => ({
  selectIsAuthenticated: (s) => Boolean(s.auth.ok),
}));
vi.mock("@features/shared-dashboard/models/shared-dashboard.api", () => ({
  getConnectDetail: vi.fn(),
}));

const args = { params: { connectRequestId: "c1" }, request: new Request("http://x/") };
const thrown = async (p) => { try { await p; } catch (e) { return e; } return null; };

describe("sharedDashboardLoader", () => {
  beforeEach(() => { vi.clearAllMocks(); mockState.auth = { ok: true }; });

  it("redirects to /login without fetching when unauthenticated", async () => {
    mockState.auth = { ok: false };
    const res = await thrown(sharedDashboardLoader(args));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/login");
    expect(getConnectDetail).not.toHaveBeenCalled();
  });

  it("returns the connect on success", async () => {
    getConnectDetail.mockResolvedValue({ data: { connect: { _id: "c1" } } });
    expect(await sharedDashboardLoader(args)).toEqual({ connect: { _id: "c1" }, error: null });
    expect(getConnectDetail).toHaveBeenCalledWith("c1");
  });

  it("redirects to /login on 401", async () => {
    getConnectDetail.mockRejectedValue({ response: { status: 401 } });
    const res = await thrown(sharedDashboardLoader(args));
    expect(res.headers.get("Location")).toBe("/login");
  });

  it("throws a 403 Response on forbidden", async () => {
    getConnectDetail.mockRejectedValue({ response: { status: 403 } });
    const res = await thrown(sharedDashboardLoader(args));
    expect(res.status).toBe(403);
  });

  it("returns the API message for other failures, with a fallback", async () => {
    getConnectDetail.mockRejectedValueOnce({ response: { status: 500, data: { message: "boom" } } });
    expect(await sharedDashboardLoader(args)).toEqual({ connect: null, error: "boom" });
    getConnectDetail.mockRejectedValueOnce(new Error("net"));
    expect((await sharedDashboardLoader(args)).error).toBe("Failed to load session.");
  });
});

describe("shouldRevalidateSharedDashboard", () => {
  it("only revalidates when the connect id changes", () => {
    const f = (a, b) => shouldRevalidateSharedDashboard({ currentParams: { connectRequestId: a }, nextParams: { connectRequestId: b } });
    expect(f("a", "a")).toBe(false);
    expect(f("a", "b")).toBe(true);
  });
});
