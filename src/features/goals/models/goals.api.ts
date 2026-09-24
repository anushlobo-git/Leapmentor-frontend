/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/goals/models/goals.api.ts
import axiosInstance from "@lib/http/axiosInstance";

export const fetchGoalRequest = (connectRequestId: string) =>
  axiosInstance.get(`/goals/${connectRequestId}`);

export const createGoalRequest = ({
  connectRequestId,
  title,
  description,
  startDate,
  endDate,
}: {
  connectRequestId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}) =>
  axiosInstance.post("/goals", {
    connectRequestId,
    title,
    description,
    startDate,
    endDate,
  });

export const updateGoalRequest = (goalId: string, fields: any) =>
  axiosInstance.patch(`/goals/${goalId}`, fields);

export const addMilestoneRequest = (
  goalId: string,
  { title, dueDate }: { title: string; dueDate?: string },
) => axiosInstance.post(`/goals/${goalId}/milestones`, { title, dueDate });

export const toggleMilestoneRequest = (
  milestoneId: string,
  isCompleted: boolean,
) =>
  axiosInstance.patch(`/goals/milestones/${milestoneId}`, { isCompleted });

// NOTE (carried over unchanged from the presenter, per the existing
// TS-migration comment there): this returns a raw Axios response, which
// never has `.ok`/`.json()` — that pre-existing quirk lives at the call
// site in useGoals.ts and is intentionally left untouched here.
export const deleteMilestoneRequest = (milestoneId: string) =>
  axiosInstance.delete(`/goals/milestones/${milestoneId}`);
