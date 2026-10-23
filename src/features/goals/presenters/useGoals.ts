/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useGoals.js
import { useToast } from "@app/providers/ToastContext";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchGoalRequest,
  createGoalRequest,
  updateGoalRequest,
  addMilestoneRequest,
  toggleMilestoneRequest,
  deleteMilestoneRequest,
} from "@features/goals/models/goals.api";
import logger from "@lib/monitoring/logger";
import useSocketEvent from "@lib/hooks/useSocketEvent";
import {
  mapGoal,
  mapMilestone,
} from "@features/goals/models/goalsMapper";
import type {
  Goal,
  Milestone,
} from "@features/goals/models/goalsMapper";
import type { Socket } from "socket.io-client";

// ── Pure Module-Level Helpers to Eliminate Deep Function Nesting (S2004) ──
const updateMilestoneInList = (mappedMilestone: Milestone) =>
  (prev: Milestone[]): Milestone[] =>
    prev.map((m) => (m._id === mappedMilestone._id ? mappedMilestone : m));

const removeMilestoneFromList = (milestoneId: string) =>
  (prev: Milestone[]): Milestone[] =>
    prev.filter((m) => m._id !== milestoneId);

/**
 * The fetch-style response shape the delete-milestone branch below expects.
 * (See the NOTE in deleteMilestone: the real call returns a raw Axios
 * response, so `ok`/`json` are absent at runtime — kept optional here to
 * type the pre-existing, intentionally-unchanged branch.)
 */
interface FetchLikeResponse {
  ok?: boolean;
  json?: () => Promise<{ message?: string }>;
}

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

type RawGoalInput = NonNullable<Parameters<typeof mapGoal>[0]>;
type RawMilestoneInput = NonNullable<Parameters<typeof mapMilestone>[0]>;

interface GoalEvent {
  goal: RawGoalInput;
}

interface MilestoneAddedEvent {
  milestone: RawMilestoneInput;
}

interface MilestoneUpdatedEvent {
  milestone: RawMilestoneInput & { _id: string };
}

interface MilestoneDeletedEvent {
  milestoneId: string;
}

interface GoalFields {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface GoalUpdateFields extends Partial<GoalFields> {
  status?: string;
}

interface AddMilestoneFields {
  title: string;
  dueDate?: string;
}

const getErrorMessage = (err: unknown): string | undefined => {
  const error = err as ApiError;
  return error.response?.data?.message ?? error.message;
};

/**
 * Custom hook for goals.
 * @returns {Object} Hook state and handlers for the caller.
 */
const useGoals = (connectRequestId: string | null) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pendingOwnMilestoneAdd = useRef(0);
  const pendingOwnMilestoneToggle = useRef<Set<string>>(new Set());
  const pendingOwnMilestoneDelete = useRef<Set<string>>(new Set());
  const pendingOwnGoalCreate = useRef(0);
  const pendingOwnGoalUpdate = useRef(0);

  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // ── Fetch goal + milestones ───────────────────────────────
  const fetchGoal = useCallback(async () => {
    if (!connectRequestId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchGoalRequest(connectRequestId);
      setGoal(mapGoal(data.goal));
      setMilestones(
        Array.isArray(data.milestones) ? data.milestones.map(mapMilestone) : [],
      );
    } catch (err) {
      logger.warn("Failed to fetch goal details", {
        connectRequestId,
        error: getErrorMessage(err),
      });
      setError(getErrorMessage(err) ?? "Failed to fetch goal details");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  // ── Socket: join room + listen for real-time goal events ──
  useSocketEvent(
    () => {
      if (!connectRequestId) return null;

      const handleGoalCreated = ({ goal }: GoalEvent) => {
        if (pendingOwnGoalCreate.current > 0) {
          pendingOwnGoalCreate.current -= 1;
          return;
        }
        const mappedGoal = mapGoal(goal)!;
        setGoal(mappedGoal);
        setMilestones([]);
        showToastRef.current({
          type: "success",
          title: "Goal Set!",
          message: `"${mappedGoal.title}"`,
        });
      };

      const handleGoalUpdated = ({ goal }: GoalEvent) => {
        if (pendingOwnGoalUpdate.current > 0) {
          pendingOwnGoalUpdate.current -= 1;
          return;
        }
        const mappedGoal = mapGoal(goal)!;
        setGoal(mappedGoal);
        showToastRef.current({
          type: "info",
          title: "Goal Updated",
          message: `"${mappedGoal.title}"`,
        });
      };

      const handleMilestoneAdded = ({ milestone }: MilestoneAddedEvent) => {
        if (pendingOwnMilestoneAdd.current > 0) {
          pendingOwnMilestoneAdd.current -= 1;
          return;
        }
        const mappedMilestone = mapMilestone(milestone)!;
        setMilestones((prev) => [...prev, mappedMilestone]);
        showToastRef.current({
          type: "info",
          title: "Milestone Added",
          message: `"${mappedMilestone.title}"`,
        });
      };

      const handleMilestoneUpdated = ({ milestone }: MilestoneUpdatedEvent) => {
        if (pendingOwnMilestoneToggle.current.has(milestone._id)) {
          pendingOwnMilestoneToggle.current.delete(milestone._id);
          return;
        }
        const mappedMilestone = mapMilestone(milestone)!;
        // S2004 Fixed: Using pure lifted updater to prevent deep function nesting
        setMilestones(updateMilestoneInList(mappedMilestone));
        showToastRef.current({
          type: mappedMilestone.isCompleted ? "success" : "warning",
          title: mappedMilestone.isCompleted
            ? "Milestone Completed!"
            : "Milestone Reopened",
          message: `"${mappedMilestone.title}"`,
        });
      };

      const handleMilestoneDeleted = ({ milestoneId }: MilestoneDeletedEvent) => {
        if (pendingOwnMilestoneDelete.current.has(milestoneId)) {
          pendingOwnMilestoneDelete.current.delete(milestoneId);
          return;
        }
        // S2004 Fixed: Using pure lifted filter to prevent deep function nesting
        setMilestones(removeMilestoneFromList(milestoneId));
        showToastRef.current({
          type: "warning",
          title: "Milestone Removed",
          message: "A milestone was deleted",
        });
      };

      return {
        onConnect: (socket: Socket) => {
          logger.info("Goal socket connected, joining room", {
            connectRequestId,
          });
          socket.emit("join_room", { connectRequestId });
        },
        events: {
          goal_created: handleGoalCreated,
          goal_updated: handleGoalUpdated,
          milestone_added: handleMilestoneAdded,
          milestone_updated: handleMilestoneUpdated,
          milestone_deleted: handleMilestoneDeleted,
        },
      };
    },
    [connectRequestId],
    "Goal socket",
  );

  // ── Create goal ───────────────────────────────────────────
  const createGoal = useCallback(
    async ({ title, description, startDate, endDate }: GoalFields) => {
      setSaving(true);
      setError(null);
      pendingOwnGoalCreate.current += 1;
      try {
        const { data } = await createGoalRequest({
          connectRequestId: connectRequestId as string,
          title,
          description,
          startDate,
          endDate,
        });
        setGoal(mapGoal(data.goal));
        setMilestones([]);
        return { success: true };
      } catch (err) {
        const message =
          getErrorMessage(err) ?? "Failed to create goal";
        setError(message);
        return { success: false, error: message };
      } finally {
        setSaving(false);
      }
    },
    [connectRequestId],
  );

  // ── Update goal ───────────────────────────────────────────
  const updateGoal = useCallback(
    async (goalId: string, fields: GoalUpdateFields) => {
      setSaving(true);
      setError(null);
      pendingOwnGoalUpdate.current += 1;
      try {
        const { data } = await updateGoalRequest(goalId, fields);
        setGoal(mapGoal(data.goal));
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err) ?? "Failed to update goal";
        setError(message);
        return { success: false, error: message };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // ── Add milestone ─────────────────────────────────────────
  const addMilestone = useCallback(
    async (goalId: string, { title, dueDate }: AddMilestoneFields) => {
      setSaving(true);
      setError(null);
      pendingOwnMilestoneAdd.current += 1;
      try {
        const { data } = await addMilestoneRequest(goalId, {
          title,
          dueDate,
        });
        setMilestones((prev) => [...prev, mapMilestone(data.milestone)!]);
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err) ?? "Failed to add milestone";
        setError(message);
        return { success: false, error: message };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // ── Toggle milestone (optimistic) ─────────────────────────
  const toggleMilestone = useCallback(
    async (milestoneId: string, isCompleted: boolean) => {
      pendingOwnMilestoneToggle.current.add(milestoneId);
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestoneId ? { ...m, isCompleted } : m)),
      );
      try {
        const { data } = await toggleMilestoneRequest(milestoneId, isCompleted);
        setMilestones((prev) =>
          prev.map((m) =>
            m._id === milestoneId ? mapMilestone(data.milestone)! : m,
          ),
        );
      } catch (err) {
        pendingOwnMilestoneToggle.current.delete(milestoneId);
        setMilestones((prev) =>
          prev.map((m) =>
            m._id === milestoneId ? { ...m, isCompleted: !isCompleted } : m,
          ),
        );
        setError(getErrorMessage(err) ?? "Failed to update milestone");
      }
    },
    [],
  );

  // ── Delete milestone (optimistic) ─────────────────────────
  const deleteMilestone = useCallback(async (milestoneId: string) => {
    pendingOwnMilestoneDelete.current.add(milestoneId);
    let prevMilestones!: Milestone[];
    setMilestones((prev) => {
      prevMilestones = prev;
      return prev.filter((m) => m._id !== milestoneId);
    });
    try {
      // NOTE (found during TS migration, left unchanged to preserve existing
      // behavior): deleteMilestoneRequest() returns a raw Axios response,
      // which never has `.ok`/`.json()` (those are fetch-API members). This branch
      // is effectively always truthy today, so failures are misreported.
      // Flagging for a follow-up fix rather than changing behavior here.
      const res = (await deleteMilestoneRequest(milestoneId)) as unknown as FetchLikeResponse;
      if (!res.ok) {
        const data: { message?: string } = await res.json!().catch(() => ({}));
        throw new Error(data.message || "Failed to delete milestone");
      }
      return { success: true };
    } catch (err) {
      pendingOwnMilestoneDelete.current.delete(milestoneId);
      setMilestones(prevMilestones);
      const message = getErrorMessage(err) ?? "Failed to delete milestone";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    goal,
    milestones,
    loading,
    error,
    saving,
    createGoal,
    updateGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    refetch: fetchGoal,
  };
};

export default useGoals;
