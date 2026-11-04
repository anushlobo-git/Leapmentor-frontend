import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sharedDashboardLoader,
  shouldRevalidateSharedDashboard,
} from "./sharedDashboard.loader";
import { getConnectDetail } from "@features/shared-dashboard/models/shared-dashboard.api";

vi.mock("@features/shared-dashboard/models/shared-dashboard.api", () => ({
  getConnectDetail: vi.fn(),
}));

const args = {
  params: { connectRequestId: "c1" },
  request: new Request("http://x/shared-dashboard/c1?tab=chat"),
};
const thrown = async (p) => { try { await p; } catch (e) { return e; } return null; };

describe("sharedDashboardLoader", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("requests the connect so Axios can refresh the session before redirecting", async () => {
    getConnectDetail.mockRejectedValue({ response: { status: 401 } });
    const res = await thrown(sharedDashboardLoader(args));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "/login?returnTo=%2Fshared-dashboard%2Fc1%3Ftab%3Dchat",
    );
    expect(getConnectDetail).toHaveBeenCalledWith("c1", {
      _skipAuthRedirect: true,
    });
  });

  it("returns the connect on success", async () => {
    getConnectDetail.mockResolvedValue({ data: { connect: { _id: "c1" } } });
    expect(await sharedDashboardLoader(args)).toEqual({ connect: { _id: "c1" }, error: null });
    expect(getConnectDetail).toHaveBeenCalledWith("c1", {
      _skipAuthRedirect: true,
    });
  });

  it("returns to the requested shared-dashboard URL after an unrecoverable 401", async () => {
    getConnectDetail.mockRejectedValue({ response: { status: 401 } });
    const res = await thrown(sharedDashboardLoader(args));
    expect(res.headers.get("Location")).toContain(
      "returnTo=%2Fshared-dashboard%2Fc1%3Ftab%3Dchat",
    );
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
