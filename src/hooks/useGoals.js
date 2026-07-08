/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useGoals.js
import { useToast } from "../context/ToastContext";
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import logger from "../utils/logger";
import { mapGoal, mapMilestone } from "@mappers/goalsMapper";
/**
 * Custom hook for goals.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useGoals = (connectRequestId) => {
  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);


  const pendingOwnMilestoneAdd = useRef(0);
  const pendingOwnMilestoneToggle = useRef(new Set());
  const pendingOwnMilestoneDelete = useRef(new Set());
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
      const { data } = await axiosInstance.get(`/goals/${connectRequestId}`);
      setGoal(mapGoal(data.goal));
      setMilestones(Array.isArray(data.milestones) ? data.milestones.map(mapMilestone) : []);
    } catch (err) {
      logger.warn("Failed to fetch goal details", { connectRequestId, error: err?.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  // ── Socket: join room + listen for real-time goal events ──
  // In useGoals.js — REPLACE the entire socket useEffect with this:
  useEffect(() => {
    if (!connectRequestId) return;

    const handleGoalCreated = ({ goal }) => {
      if (pendingOwnGoalCreate.current > 0) {
        pendingOwnGoalCreate.current -= 1;
        return;
      }
      const mappedGoal = mapGoal(goal);
      setGoal(mappedGoal);
      setMilestones([]);
      showToastRef.current({
        type: "success",
        title: "Goal Set!",
        message: `"${mappedGoal.title}"`,
      });
    };

    const handleGoalUpdated = ({ goal }) => {
      if (pendingOwnGoalUpdate.current > 0) {
        pendingOwnGoalUpdate.current -= 1;
        return;
      }
      const mappedGoal = mapGoal(goal);
      setGoal(mappedGoal);
      showToastRef.current({
        type: "info",
        title: "Goal Updated",
        message: `"${mappedGoal.title}"`,
      });
    };

    const handleMilestoneAdded = ({ milestone }) => {
      if (pendingOwnMilestoneAdd.current > 0) {
        pendingOwnMilestoneAdd.current -= 1;
        return;
      }
      const mappedMilestone = mapMilestone(milestone);
      setMilestones((prev) => [...prev, mappedMilestone]);
      showToastRef.current({
        type: "info",
        title: "Milestone Added",
        message: `"${mappedMilestone.title}"`,
      });
    };

    const handleMilestoneUpdated = ({ milestone }) => {
      if (pendingOwnMilestoneToggle.current.has(milestone._id)) {
        pendingOwnMilestoneToggle.current.delete(milestone._id);
        return;
      }
      const mappedMilestone = mapMilestone(milestone);
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestone._id ? mappedMilestone : m)),
      );
      showToastRef.current({
        type: mappedMilestone.isCompleted ? "success" : "warning",
        title: mappedMilestone.isCompleted
          ? "Milestone Completed!"
          : "Milestone Reopened",
        message: `"${mappedMilestone.title}"`,
      });
    };

    const handleMilestoneDeleted = ({ milestoneId }) => {
      if (pendingOwnMilestoneDelete.current.has(milestoneId)) {
        pendingOwnMilestoneDelete.current.delete(milestoneId);
        return;
      }
      setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
      showToastRef.current({
        type: "warning",
        title: "Milestone Removed",
        message: "A milestone was deleted",
      });
    };

    // ✅ Use shared socket, wait for it
    const waitForSocket = setInterval(() => {
      if (globalThis.__leapSocket?.connected) {
        clearInterval(waitForSocket);
        logger.info("Goal socket connected, joining room", { connectRequestId });
        globalThis.__leapSocket.emit("join_room", { connectRequestId });
        globalThis.__leapSocket.on("goal_created", handleGoalCreated);
        globalThis.__leapSocket.on("goal_updated", handleGoalUpdated);
        globalThis.__leapSocket.on("milestone_added", handleMilestoneAdded);
        globalThis.__leapSocket.on("milestone_updated", handleMilestoneUpdated);
        globalThis.__leapSocket.on("milestone_deleted", handleMilestoneDeleted);
      }
    }, 200);

    return () => {
      clearInterval(waitForSocket);
      globalThis.__leapSocket?.off("goal_created", handleGoalCreated);
      globalThis.__leapSocket?.off("goal_updated", handleGoalUpdated);
      globalThis.__leapSocket?.off("milestone_added", handleMilestoneAdded);
      globalThis.__leapSocket?.off("milestone_updated", handleMilestoneUpdated);
      globalThis.__leapSocket?.off("milestone_deleted", handleMilestoneDeleted);
    };
  }, [connectRequestId]);

  // ✅ Remove these since we no longer create our own socket:
  // const socketRef = useRef(null)  ← remove
  // import { io } from "socket.io-client"  ← remove
  // import SOCKET_URL  ← remove

  // ── Create goal ───────────────────────────────────────────
  const createGoal = useCallback(
    async ({ title, description, startDate, endDate }) => {
      setSaving(true);
      setError(null);
      pendingOwnGoalCreate.current += 1;
      try {
        const { data } = await axiosInstance.post("/goals", {
          connectRequestId,
          title,
          description,
          startDate,
          endDate,
        });
        setGoal(mapGoal(data.goal));
        setMilestones([]);
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(message);
        return { success: false, error: message };
      } finally {
        setSaving(false);
      }
    },
    [connectRequestId],
  );

  // ── Update goal ───────────────────────────────────────────
  const updateGoal = useCallback(async (goalId, fields) => {
    setSaving(true);
    setError(null);
    pendingOwnGoalUpdate.current += 1;
    try {
      const { data } = await axiosInstance.patch(`/goals/${goalId}`, fields);
      setGoal(mapGoal(data.goal));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Add milestone ─────────────────────────────────────────
  const addMilestone = useCallback(async (goalId, { title, dueDate }) => {
    setSaving(true);
    setError(null);
    pendingOwnMilestoneAdd.current += 1;
    try {
     const { data } = await axiosInstance.post(`/goals/${goalId}/milestones`, {
       title,
       dueDate,
     });
     setMilestones((prev) => [...prev, mapMilestone(data.milestone)]);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Toggle milestone (optimistic) ─────────────────────────
  const toggleMilestone = useCallback(async (milestoneId, isCompleted) => {
    pendingOwnMilestoneToggle.current.add(milestoneId);
    setMilestones((prev) =>
      prev.map((m) => (m._id === milestoneId ? { ...m, isCompleted } : m)),
    );
    try {
      const { data } = await axiosInstance.patch(
        `/goals/milestones/${milestoneId}`,
        { isCompleted },
      );
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestoneId ? mapMilestone(data.milestone) : m)),
      );
    } catch (err) {
      pendingOwnMilestoneToggle.current.delete(milestoneId);
      setMilestones((prev) =>
        prev.map((m) =>
          m._id === milestoneId ? { ...m, isCompleted: !isCompleted } : m,
        ),
      );
      setError(err.message);
    }
  }, []);

  // ── Delete milestone (optimistic) ─────────────────────────
  const deleteMilestone = useCallback(async (milestoneId) => {
    pendingOwnMilestoneDelete.current.add(milestoneId);
    let prevMilestones;
    setMilestones((prev) => {
      prevMilestones = prev;
      return prev.filter((m) => m._id !== milestoneId);
    });
    try {
      const res = await axiosInstance.delete(
        `/goals/milestones/${milestoneId}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete milestone");
      }
      return { success: true };
    } catch (err) {
      pendingOwnMilestoneDelete.current.delete(milestoneId);
      setMilestones(prevMilestones);
      setError(err.message);
      return { success: false, error: err.message };
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
