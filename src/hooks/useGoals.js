// src/hooks/useGoals.js
import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useToast } from "../context/ToastContext";

const API_URL    = import.meta.env.VITE_API_BASE_URL  || "http://localhost:5000/api/v1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL    || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const useGoals = (connectRequestId) => {
  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const socketRef = useRef(null);

  const pendingOwnMilestoneAdd    = useRef(0);
  const pendingOwnMilestoneToggle = useRef(new Set());
  const pendingOwnMilestoneDelete = useRef(new Set());
  const pendingOwnGoalCreate      = useRef(0);
  const pendingOwnGoalUpdate      = useRef(0);

  const { showToast } = useToast();
  const showToastRef  = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; }, [showToast]);

  // ── Fetch goal + milestones ───────────────────────────────
  const fetchGoal = useCallback(async () => {
    if (!connectRequestId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/goals/${connectRequestId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load goal");
      setGoal(data.goal);
      setMilestones(data.milestones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => { fetchGoal(); }, [fetchGoal]);

  // ── Socket: join room + listen for real-time goal events ──
  useEffect(() => {
    if (!connectRequestId) return;
    const token = getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
      transports:           ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { connectRequestId });
    });

    socket.on("goal_created", ({ goal }) => {
      if (pendingOwnGoalCreate.current > 0) { pendingOwnGoalCreate.current -= 1; return; }
      setGoal(goal);
      setMilestones([]);
      showToastRef.current({ type: "success", title: "Goal Set!", message: `"${goal.title}"` });
    });

    socket.on("goal_updated", ({ goal }) => {
      if (pendingOwnGoalUpdate.current > 0) { pendingOwnGoalUpdate.current -= 1; return; }
      setGoal(goal);
      showToastRef.current({ type: "info", title: "Goal Updated", message: `"${goal.title}"` });
    });

    socket.on("milestone_added", ({ milestone }) => {
      if (pendingOwnMilestoneAdd.current > 0) { pendingOwnMilestoneAdd.current -= 1; return; }
      setMilestones((prev) => [...prev, milestone]);
      showToastRef.current({ type: "info", title: "Milestone Added", message: `"${milestone.title}"` });
    });

    socket.on("milestone_updated", ({ milestone }) => {
      if (pendingOwnMilestoneToggle.current.has(milestone._id)) {
        pendingOwnMilestoneToggle.current.delete(milestone._id);
        return;
      }
      setMilestones((prev) => prev.map((m) => m._id === milestone._id ? milestone : m));
      showToastRef.current({
        type:    milestone.isCompleted ? "success" : "warning",
        title:   milestone.isCompleted ? "Milestone Completed!" : "Milestone Reopened",
        message: `"${milestone.title}"`,
      });
    });

    socket.on("milestone_deleted", ({ milestoneId }) => {
      if (pendingOwnMilestoneDelete.current.has(milestoneId)) {
        pendingOwnMilestoneDelete.current.delete(milestoneId);
        return;
      }
      setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
      showToastRef.current({ type: "warning", title: "Milestone Removed", message: "A milestone was deleted" });
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Goals socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [connectRequestId]);

  // ── Create goal ───────────────────────────────────────────
  const createGoal = useCallback(async ({ title, description, startDate, endDate }) => {
    setSaving(true);
    setError(null);
    pendingOwnGoalCreate.current += 1;
    try {
      const res  = await fetch(`${API_URL}/goals`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ connectRequestId, title, description, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) { pendingOwnGoalCreate.current -= 1; throw new Error(data.message || "Failed to create goal"); }
      setGoal(data.goal);
      setMilestones([]);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [connectRequestId]);

  // ── Update goal ───────────────────────────────────────────
  const updateGoal = useCallback(async (goalId, fields) => {
    setSaving(true);
    setError(null);
    pendingOwnGoalUpdate.current += 1;
    try {
      const res  = await fetch(`${API_URL}/goals/${goalId}`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) { pendingOwnGoalUpdate.current -= 1; throw new Error(data.message || "Failed to update goal"); }
      setGoal(data.goal);
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
      const res  = await fetch(`${API_URL}/goals/${goalId}/milestones`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ title, dueDate }),
      });
      const data = await res.json();
      if (!res.ok) { pendingOwnMilestoneAdd.current -= 1; throw new Error(data.message || "Failed to add milestone"); }
      setMilestones((prev) => [...prev, data.milestone]);
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
    setMilestones((prev) => prev.map((m) => m._id === milestoneId ? { ...m, isCompleted } : m));
    try {
      const res  = await fetch(`${API_URL}/goals/milestones/${milestoneId}`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify({ isCompleted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update milestone");
      setMilestones((prev) => prev.map((m) => m._id === milestoneId ? data.milestone : m));
    } catch (err) {
      pendingOwnMilestoneToggle.current.delete(milestoneId);
      setMilestones((prev) => prev.map((m) => m._id === milestoneId ? { ...m, isCompleted: !isCompleted } : m));
      setError(err.message);
    }
  }, []);

  // ── Delete milestone (optimistic) ─────────────────────────
  const deleteMilestone = useCallback(async (milestoneId) => {
    pendingOwnMilestoneDelete.current.add(milestoneId);
    let prevMilestones;
    setMilestones((prev) => { prevMilestones = prev; return prev.filter((m) => m._id !== milestoneId); });
    try {
      const res = await fetch(`${API_URL}/goals/milestones/${milestoneId}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
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
    goal, milestones,
    loading, error, saving,
    createGoal, updateGoal,
    addMilestone, toggleMilestone, deleteMilestone,
    refetch: fetchGoal,
  };
};

export default useGoals;