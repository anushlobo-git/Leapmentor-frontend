/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/connectsMapper.js
//
// Why this shape: mapConnectRequest must match what the consuming components
// (HistoryTable.jsx, DetailDrawer.jsx, ConnectsTab.jsx, ConnectCard.jsx) actually
// read — nested mentor/mentee objects and profile objects, not flattened fields.
// A mapper whose output shape nothing in the app reads is worse than no mapper.

const mapPerson = (raw) => {
  if (!raw) return null;
  return {
    _id: raw._id ?? raw.id ?? null,
    name: raw.name ?? "",
    email: raw.email ?? null,
    profilePicture: raw.profilePicture ?? null,
  };
};

export const mapConnectRequest = (raw = {}) => ({
  _id: raw._id ?? raw.id ?? null,
  status: raw.status ?? "pending",

  mentor: mapPerson(raw.mentor),
  mentee: mapPerson(raw.mentee),
  mentorProfile: raw.mentorProfile ?? null,
  menteeProfile: raw.menteeProfile ?? null,

  message: raw.message ?? "",
  referredBy: raw.referredBy ?? null,
  referredByProfile: raw.referredByProfile ?? null,
  referredTo: mapPerson(raw.referredTo),
  referredToProfile: raw.referredToProfile ?? null,
  referredRequestId: raw.referredRequestId ?? null,

  requestedAt: raw.requestedAt ?? raw.createdAt ?? null,
  respondedAt: raw.respondedAt ?? null,
  selectedSlots: Array.isArray(raw.selectedSlots) ? raw.selectedSlots : [],
  confirmedSlot: raw.confirmedSlot ?? null,
  additionalSlots: Array.isArray(raw.additionalSlots)
    ? raw.additionalSlots
    : [],

  sessionRate: raw.sessionRate ?? null,
  sessionCount: raw.sessionCount ?? null,
  totalAmount: raw.totalAmount ?? null,
  paymentStatus: raw.paymentStatus ?? null,
  paidAt: raw.paidAt ?? null,
  completedAt: raw.completedAt ?? null,
  commissionRate: raw.commissionRate ?? null,
  commissionAmount: raw.commissionAmount ?? null,
  mentorPayout: raw.mentorPayout ?? null,

  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});
