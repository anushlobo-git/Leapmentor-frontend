/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

/** A reference the backend may send as a bare id or as a populated object. */
type RawRef = string | { _id?: string; id?: string; name?: string } | null;

/** Pulls a plain id string out of a RawRef (never returns an object). */
const refId = (ref: RawRef | undefined): string | null =>
  typeof ref === "string" ? ref : (ref?._id ?? ref?.id ?? null);

/** INCOMING: raw goal from the API. Everything optional, backend may omit anything. */
interface RawGoal {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  connectRequestId?: string;
  connectRequest?: string;
  createdBy?: RawRef;
  mentor?: RawRef;
  mentee?: RawRef;
  createdAt?: string;
  updatedAt?: string;
}

/** OUTGOING (to the UI): what screens can rely on. Required unless "absent" is meaningful. */
export interface Goal {
  _id: string | null;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  connectRequestId: string | null;
  createdBy: RawRef;
  mentor: RawRef;
  mentee: RawRef;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Normalize a raw goal from the API. Returns null when there is no goal at all.
 */
export const mapGoal = (raw?: RawGoal | null): Goal | null => {
  if (!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    startDate: raw.startDate ?? null,
    endDate: raw.endDate ?? null,
    status: raw.status ?? null,
    connectRequestId: raw.connectRequestId ?? raw.connectRequest ?? null,
    createdBy: raw.createdBy ?? null,
    mentor: raw.mentor ?? null,
    mentee: raw.mentee ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

/**
 * INCOMING: raw milestone from the API. `goal` may be a populated object or a bare id.
 */
interface RawMilestone {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  completedAt?: string;
  completedBy?: string;
  goalId?: string;
  goal?: RawRef;
  connectRequestId?: string;
  connectRequest?: string;
  order?: number;
  slotIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** OUTGOING (to the UI): normalized milestone. */
export interface Milestone {
  _id: string | null;
  title: string;
  description: string;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
  goalId: string | null;
  connectRequestId: string | null;
  order: number;
  slotIndex: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Called with nothing -> defaults. Called with null -> null (keeps the original behaviour).
export const mapMilestone = (raw: RawMilestone | null = {}): Milestone | null => {
  if (!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    dueDate: raw.dueDate ?? null,
    isCompleted: Boolean(raw.isCompleted),
    completedAt: raw.completedAt ?? null,
    completedBy: raw.completedBy ?? null,
    // refId guarantees a string id, never the whole populated object
    goalId: raw.goalId ?? refId(raw.goal),
    connectRequestId: raw.connectRequestId ?? raw.connectRequest ?? null,
    order: typeof raw.order === "number" ? raw.order : 0,
    slotIndex: typeof raw.slotIndex === "number" ? raw.slotIndex : null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};
