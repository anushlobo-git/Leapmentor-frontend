/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/escrow.api.js
import axiosInstance from "@utils/axiosInstance"; // Use the configured axios instance with interceptors

/**
 * Locks tokens into escrow for a connect request.
 * @param {{ connectRequestId: string, sessionRate: number, sessionCount: number }} params - Escrow payment payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const payEscrow = async ({
  connectRequestId,
  sessionRate,
  sessionCount,
}) => {
  const res = await axiosInstance.post(
    `/escrow/pay`,
    { connectRequestId, sessionRate, sessionCount },
  );
  return res.data;
};

/**
 * Releases escrowed tokens for a completed session.
 * @param {string} requestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const releaseEscrow = async (requestId) => {
  const res = await axiosInstance.post(
    `/escrow/release/${requestId}`,
    {},
  );
  return res.data;
};

/**
 * Refunds escrowed tokens back to the mentee.
 * @param {string} requestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const refundEscrow = async (requestId) => {
  const res = await axiosInstance.post(
    `/escrow/refund/${requestId}`,
    {},
  );
  return res.data;
};

/**
 * Fetches escrow status and wallet snapshot for a connect request.
 * @param {string} requestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getEscrowStatus = async (requestId) => {
  const res = await axiosInstance.get(`/escrow/status/${requestId}`);
  return res.data;
};

/**
 * Pays escrow for a single additional session slot.
 * @param {{ connectRequestId: string, sessionRate: number, slotId: string }} params - Additional session payment payload.
 * @returns {Promise<any>} Backend response payload.
 */
export const payAdditionalEscrow = async ({ connectRequestId, sessionRate, slotId }) => {
  const res = await axiosInstance.post(
    `/escrow/pay-additional`,
    { connectRequestId, sessionRate, slotId },
  );
  return res.data;
};
/**
 * Fetches the platform commission rate used by escrow calculations.
 * @returns {Promise<any>} Backend response payload.
 */
export const getPlatformCommissionRate = async () => {
  const res = await axiosInstance.get(`/escrow/commission-rate`);
  return res.data;
};