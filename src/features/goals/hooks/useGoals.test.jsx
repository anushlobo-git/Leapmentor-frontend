import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useGoals from "./useGoals";
import axiosInstance from "@lib/axiosInstance";
import logger from "@lib/logger";

// ── Shared Mutable Context References for Sockets ───────
let capturedSocketInitializer = null;

// ── Mock Framework Hooks & Stores ────────────────────────
const mockShowToast = vi.fn();
vi.mock("@app/providers/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("@lib/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@lib/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Intercept hook setup logic to extract internal socket event handlers programmatic
vi.mock("@lib/hooks/useSocketEvent", () => ({
  default: vi.fn((initializer) => {
    capturedSocketInitializer = initializer;
  }),
}));

vi.mock("@features/goals/mappers/goalsMapper", () => ({
  mapGoal: vi.fn((g) => g),
  mapMilestone: vi.fn((m) => m),
}));

describe("useGoals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSocketInitializer = null;

    // Provide a baseline default fallback mock resolution to prevent leaking unhandled promises
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: { goal: null, milestones: [] },
    });
  });

  // ── Fetching Data Logic Branches ─────────────────────────
  it("should short-circuit and remain idle if connectRequestId parameter is missing", async () => {
    const { result } = renderHook(() => useGoals(null));

    await act(async () => {});
    expect(result.current.loading).toBe(true);
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("should populate goal and milestone states successfully on a valid fetch", async () => {
    const mockData = {
      goal: { _id: "g1", title: "Target Goal" },
      milestones: [{ _id: "m1", title: "Task 1" }],
    };
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useGoals("conn_123"));
    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.goal).toEqual(mockData.goal);
    expect(result.current.milestones).toEqual(mockData.milestones);
  });

  it("should catch fetch errors, update error status state, and record warning trace logs", async () => {
    const networkError = new Error("Network Timeout");
    vi.mocked(axiosInstance.get).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useGoals("conn_123"));

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network Timeout");
    expect(logger.warn).toHaveBeenCalledWith("Failed to fetch goal details", {
      connectRequestId: "conn_123",
      error: "Network Timeout",
    });
  });

  // ── Create and Update Goal Action Branches ───────────────
  it("should process createGoal actions successfully and clear milestones array state", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const newGoal = { _id: "g2", title: "New Goal Title" };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: { goal: newGoal },
    });

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.createGoal({
        title: "New Goal Title",
      });
    });

    expect(actionResponse).toEqual({ success: true });
    expect(result.current.goal).toEqual(newGoal);
    expect(result.current.milestones).toEqual([]);
  });

  it("should handle createGoal error responses safely and parse custom error payloads", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const serverError = {
      response: { data: { message: "Validation failure details." } },
    };
    vi.mocked(axiosInstance.post).mockRejectedValueOnce(serverError);

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.createGoal({ title: "" });
    });

    expect(actionResponse).toEqual({
      success: false,
      error: "Validation failure details.",
    });
    expect(result.current.error).toBe("Validation failure details.");
  });

  it("should process updateGoal actions successfully and modify active goal parameters", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const updatedGoal = { _id: "g1", title: "Updated Goal Title" };
    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { goal: updatedGoal },
    });

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.updateGoal("g1", {
        title: "Updated Goal Title",
      });
    });

    expect(actionResponse).toEqual({ success: true });
    expect(result.current.goal).toEqual(updatedGoal);
  });

  it("should fail updateGoal operations and report standard error string payloads if request rejects", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.patch).mockRejectedValueOnce(
      new Error("Patch Failed"),
    );

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.updateGoal("g1", {
        title: "Bad Title",
      });
    });

    expect(actionResponse).toEqual({ success: false, error: "Patch Failed" });
    expect(result.current.error).toBe("Patch Failed");
  });

  // ── Milestone Mutations Branches (Add, Toggle, Delete) ──
  it("should process addMilestone actions and append newly mapped milestones into state arrays", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const addedMilestone = { _id: "m2", title: "New Task Item" };
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: { milestone: addedMilestone },
    });

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.addMilestone("g1", {
        title: "New Task Item",
      });
    });

    expect(actionResponse).toEqual({ success: true });
    expect(result.current.milestones).toContainEqual(addedMilestone);
  });

  it("should fail addMilestone actions and update hook errors states when server throws error exceptions", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.post).mockRejectedValueOnce(
      new Error("Post Rejected"),
    );

    let actionResponse;
    await act(async () => {
      actionResponse = await result.current.addMilestone("g1", {
        title: "Faulty Task",
      });
    });

    expect(actionResponse).toEqual({ success: false, error: "Post Rejected" });
    expect(result.current.error).toBe("Post Rejected");
  });

  it("should support optimistic toggling paths and handle successful patch verification matching from servers", async () => {
    const originalMilestones = [
      { _id: "m1", title: "Task 1", isCompleted: false },
    ];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: originalMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const updatedMilestone = { _id: "m1", title: "Task 1", isCompleted: true };
    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { milestone: updatedMilestone },
    });

    await act(async () => {
      result.current.toggleMilestone("m1", true);
    });

    expect(result.current.milestones[0].isCompleted).toBe(true);
  });

  it("should safely revert optimistic milestone toggle values if server returns response updates that fail", async () => {
    const originalMilestones = [
      { _id: "m1", title: "Task 1", isCompleted: false },
    ];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: originalMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.patch).mockRejectedValueOnce(
      new Error("Toggle Server Crash"),
    );

    await act(async () => {
      result.current.toggleMilestone("m1", true);
    });

    expect(result.current.milestones[0].isCompleted).toBe(false);
    expect(result.current.error).toBe("Toggle Server Crash");
  });

  it("should support optimistic delete workflows when server returning validation checks pass with ok codes", async () => {
    const initialMilestones = [{ _id: "m1", title: "Delete Target" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: initialMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({ ok: true });

    let response;
    await act(async () => {
      response = await result.current.deleteMilestone("m1");
    });

    expect(response).toEqual({ success: true });
    expect(result.current.milestones).toHaveLength(0);
  });

  it("should restore previous milestone listings if delete returns false ok codes with custom messages", async () => {
    const initialMilestones = [{ _id: "m1", title: "Delete Target" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: initialMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    // Create a controllable deferred promise to decouple scheduling from the batch loop execution context
    let deferredResolve;
    const deferredPromise = new Promise((resolve) => {
      deferredResolve = resolve;
    });
    vi.mocked(axiosInstance.delete).mockReturnValueOnce(deferredPromise);

    let p;
    await act(async () => {
      p = result.current.deleteMilestone("m1");
    });

    // Yield control to let React flush the functional updater and populate the internal closure safely
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const errorMockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "Delete Access Refused" }),
    };

    await act(async () => {
      deferredResolve(errorMockResponse);
      await p;
    });

    expect(result.current.error).toBe("Delete Access Refused");
    expect(result.current.milestones).toHaveLength(1);
  });

  it("should fallback to standard error strings inside delete paths if json resolution maps reject empty", async () => {
    const initialMilestones = [{ _id: "m1", title: "Delete Target" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: initialMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    let deferredResolve;
    const deferredPromise = new Promise((resolve) => {
      deferredResolve = resolve;
    });
    vi.mocked(axiosInstance.delete).mockReturnValueOnce(deferredPromise);

    let p;
    await act(async () => {
      p = result.current.deleteMilestone("m1");
    });

    // Let React run the synchronous functional updater first
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const rawRejectResponse = {
      ok: false,
      json: vi.fn().mockRejectedValue(new Error("Parsing Failed")),
    };

    await act(async () => {
      deferredResolve(rawRejectResponse);
      await p;
    });

    expect(result.current.error).toBe("Failed to delete milestone");
    expect(result.current.milestones).toHaveLength(1);
  });

  // ── Sockets Real-Time Initialization and Event Channels ──
  it("should exit socket configuration paths early if initialization IDs evaluate to null", async () => {
    renderHook(() => useGoals(null));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();
    expect(setupConfig).toBeNull();
  });

  it("should join room structures and fire trace metrics on standard connect hooks", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();
    const mockSocket = { emit: vi.fn() };

    act(() => {
      setupConfig.onConnect(mockSocket);
    });

    expect(logger.info).toHaveBeenCalledWith(
      "Goal socket connected, joining room",
      { connectRequestId: "conn_123" },
    );
    expect(mockSocket.emit).toHaveBeenCalledWith("join_room", {
      connectRequestId: "conn_123",
    });
  });

  it("should handle external goal_created events and launch notifications cards cleanly", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.goal_created({
        goal: { _id: "g9", title: "Socket Goal Entry" },
      });
    });

    expect(result.current.goal).toEqual({
      _id: "g9",
      title: "Socket Goal Entry",
    });
    expect(mockShowToast).toHaveBeenCalledWith({
      type: "success",
      title: "Goal Set!",
      message: '"Socket Goal Entry"',
    });
  });

  it("should intercept and skip own actions inside socket streams via internal counter refs", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: { goal: { title: "Self Form" } },
    });

    await act(async () => {
      await result.current.createGoal({ title: "Self Form" });
    });

    act(() => {
      setupConfig.events.goal_created({ goal: { title: "Self Form" } });
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("should handle goal_updated socket events and launch update notifications safely", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.goal_updated({
        goal: { _id: "g1", title: "Refreshed Goal" },
      });
    });

    expect(result.current.goal.title).toBe("Refreshed Goal");
    expect(mockShowToast).toHaveBeenCalledWith({
      type: "info",
      title: "Goal Updated",
      message: '"Refreshed Goal"',
    });
  });

  it("should intercept own goal updates and bypass secondary notifications calls inside the hook", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { goal: { title: "Own Mod" } },
    });
    await act(async () => {
      await result.current.updateGoal("g1", { title: "Own Mod" });
    });

    act(() => {
      setupConfig.events.goal_updated({ goal: { title: "Own Mod" } });
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("should handle milestone_added socket stream signals and push targets directly to state lists", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.milestone_added({
        milestone: { _id: "m9", title: "External Task" },
      });
    });

    expect(result.current.milestones).toContainEqual({
      _id: "m9",
      title: "External Task",
    });
  });

  it("should skip own milestone creations inside socket listener feedback paths", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: [] },
    });
    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: { milestone: { _id: "m2" } },
    });
    await act(async () => {
      await result.current.addMilestone("g1", { title: "Own Task" });
    });

    mockShowToast.mockClear();
    act(() => {
      setupConfig.events.milestone_added({ milestone: { _id: "m2" } });
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("should handle external milestone_updated operations and show complete status confirmations", async () => {
    const baselineMilestones = [
      { _id: "m1", title: "Target Task", isCompleted: false },
    ];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: baselineMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.milestone_updated({
        milestone: { _id: "m1", title: "Target Task", isCompleted: true },
      });
    });

    expect(result.current.milestones[0].isCompleted).toBe(true);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("should handle external milestone reopening streams correctly and show warning text variants", async () => {
    const baselineMilestones = [
      { _id: "m1", title: "Target Task", isCompleted: true },
    ];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: baselineMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.milestone_updated({
        milestone: { _id: "m1", title: "Target Task", isCompleted: false },
      });
    });

    expect(result.current.milestones[0].isCompleted).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
    );
  });

  it("should bypass milestone updates feedback loops if action identifiers match internal toggling registries", async () => {
    const baselineMilestones = [
      { _id: "m1", title: "Target", isCompleted: false },
    ];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: baselineMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { milestone: { _id: "m1", isCompleted: true } },
    });
    await act(async () => {
      result.current.toggleMilestone("m1", true);
    });

    mockShowToast.mockClear();
    const setupConfig = capturedSocketInitializer();

    act(() => {
      setupConfig.events.milestone_updated({
        milestone: { _id: "m1", isCompleted: true },
      });
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("should handle external milestone_deleted socket actions and drop targets from active states", async () => {
    const baselineMilestones = [{ _id: "m1", title: "Drop Item" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: baselineMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    const setupConfig = capturedSocketInitializer();
    act(() => {
      setupConfig.events.milestone_deleted({ milestoneId: "m1" });
    });

    expect(result.current.milestones).toHaveLength(0);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
    );
  });

  it("should bypass milestone delete events if operations originate from internal hook executions", async () => {
    const baselineMilestones = [{ _id: "m1", title: "Drop Item" }];
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: { goal: null, milestones: baselineMilestones },
    });

    const { result } = renderHook(() => useGoals("conn_123"));
    await act(async () => {});

    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({ ok: true });
    await act(async () => {
      await result.current.deleteMilestone("m1");
    });

    mockShowToast.mockClear();
    const setupConfig = capturedSocketInitializer();
    act(() => {
      setupConfig.events.milestone_deleted({ milestoneId: "m1" });
    });

    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
