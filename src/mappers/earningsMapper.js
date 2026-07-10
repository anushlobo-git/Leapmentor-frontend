/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/mappers/earningsMapper.js

import { mapPagination } from "./mentorMapper";

/**
 * Normalize the earnings summary stats object from the API into the internal shape.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw earnings summary object from API
 * @returns {Object} Normalized earnings summary object with guaranteed field structure
 */
export const mapEarningsSummary = (raw = {}) => ({
  totalEarnings: typeof raw.totalEarnings === "number" ? raw.totalEarnings : 0,
  sessionsThisMonth: typeof raw.sessionsThisMonth === "number" ? raw.sessionsThisMonth : 0,
  avgRating: typeof raw.avgRating === "number" ? raw.avgRating : Number(raw.avgRating) || 0,
  pendingPayout: typeof raw.pendingPayout === "number" ? raw.pendingPayout : 0,
  walletBalance: typeof raw.walletBalance === "number" ? raw.walletBalance : 0,
});

/**
 * Normalize a raw chart data point from the API into the internal shape.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw chart point object from API
 * @returns {Object} Normalized chart point object with guaranteed field structure
 */
export const mapChartPoint = (raw = {}) => ({
  label: raw.label ?? raw.date ?? null,
  amount: typeof raw.amount === "number" ? raw.amount : 0,
  sessions: typeof raw.sessions === "number" ? raw.sessions : 0,
});

/**
 * Normalize a raw payout record from the API into the internal shape.
 * Provides defensive defaults for all fields to prevent silent failures when backend shape changes.
 * @param {Object} raw - Raw payout object from API
 * @returns {Object} Normalized payout object with guaranteed field structure
 */
export const mapPayout = (raw = {}) => ({
  id: raw._id ?? raw.id ?? null,
  date: raw.date ?? raw.createdAt ?? raw.requestedAt ?? null,
  menteeName: raw.menteeName ?? raw.mentee?.name ?? "",
  sessionType: raw.sessionType ?? raw.session?.type ?? "",
  duration: raw.duration ?? raw.session?.duration ?? "",
  amount: typeof raw.amount === "number" ? raw.amount : 0,
  status: raw.status ?? "pending",
  processedAt: raw.processedAt ?? null,
  transactionId: raw.transactionId ?? null,
  bankAccount: raw.bankAccount ?? raw.accountNumber ?? null,
});
/**
 * Normalize the paginated payouts response payload (already unwrapped by axiosInstance,
 * i.e. res.data) into { payouts, pagination }. Reuses mapPagination from mentorMapper.js.
 * Defensive against either field being missing entirely.
 * @param {Object} raw - Raw response object from API
 * @returns {Object} Normalized response object with guaranteed field structure
 */
export const mapPayoutsResponse = (raw = {}) => ({
  payouts: Array.isArray(raw.payouts) ? raw.payouts.map(mapPayout) : [],
  pagination: mapPagination(raw.pagination ?? {}),
});
