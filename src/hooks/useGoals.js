// src/hooks/useGoals.js
import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const useGoals = (connectRequestId) => {
  const [goal,             setGoal]             = useState(null);
  const [milestones,       setMilestones]       = useState([]);
  const [milestonesBySlot, setMilestonesBySlot] = useState({});
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [saving,           setSaving]           = useState(false);

  // ── Fetch goal + milestones ───────────────────────────────
  const fetchGoal = useCallback(async () => {
    if (!connectRequestId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/goals/${connectRequestId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load goal");
      setGoal(data.goal);
      setMilestones(data.milestones || []);
      setMilestonesBySlot(data.milestonesBySlot || {}); // ✅ from backend
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => { fetchGoal(); }, [fetchGoal]);

  // ── Create goal ───────────────────────────────────────────
  const createGoal = useCallback(async ({ title, description, startDate, endDate }) => {
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/goals`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ connectRequestId, title, description, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create goal");
      setGoal(data.goal);
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
    try {
      const res  = await fetch(`${API}/api/goals/${goalId}`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update goal");
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
  // ✅ Now accepts slotIndex — null = goal-level, 0/1/2 = session-specific
  const addMilestone = useCallback(async (goalId, { title, slotIndex = null }) => {
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/goals/${goalId}/milestones`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ title, slotIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add milestone");

      const newMilestone = data.milestone;

      // ✅ Update flat milestones array
      setMilestones((prev) => [...prev, newMilestone]);

      // ✅ Update milestonesBySlot grouped state
      const key = newMilestone.slotIndex !== null && newMilestone.slotIndex !== undefined
        ? String(newMilestone.slotIndex)
        : "null";
      setMilestonesBySlot((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), newMilestone],
      }));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Toggle milestone complete ─────────────────────────────
  const toggleMilestone = useCallback(async (milestoneId, isCompleted) => {
    // Optimistic update — both flat and grouped
    const updateFn = (prev) =>
      prev.map((m) => m._id === milestoneId ? { ...m, isCompleted } : m);

    setMilestones(updateFn);
    setMilestonesBySlot((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[key] = updated[key].map((m) =>
          m._id === milestoneId ? { ...m, isCompleted } : m
        );
      });
      return updated;
    });

    try {
      const res  = await fetch(`${API}/api/milestones/${milestoneId}`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify({ isCompleted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update milestone");

      // ✅ Confirm with server response
      setMilestones((prev) =>
        prev.map((m) => m._id === milestoneId ? data.milestone : m)
      );
      setMilestonesBySlot((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((m) =>
            m._id === milestoneId ? data.milestone : m
          );
        });
        return updated;
      });
    } catch (err) {
      // Rollback both
      const rollbackFn = (prev) =>
        prev.map((m) => m._id === milestoneId ? { ...m, isCompleted: !isCompleted } : m);
      setMilestones(rollbackFn);
      setMilestonesBySlot((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((m) =>
            m._id === milestoneId ? { ...m, isCompleted: !isCompleted } : m
          );
        });
        return updated;
      });
      setError(err.message);
    }
  }, []);

  // ── Delete milestone ──────────────────────────────────────
  const deleteMilestone = useCallback(async (milestoneId) => {
    try {
      const res  = await fetch(`${API}/api/milestones/${milestoneId}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete milestone");

      // ✅ Remove from both flat and grouped state
      setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
      setMilestonesBySlot((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].filter((m) => m._id !== milestoneId);
        });
        return updated;
      });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    }
  }, []);

  return {
    goal, milestones, milestonesBySlot,
    loading, error, saving,
    createGoal, updateGoal,
    addMilestone, toggleMilestone, deleteMilestone,
    refetch: fetchGoal,
  };
};

export default useGoals;