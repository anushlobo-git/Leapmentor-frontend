// src/escrow.api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─────────────────────────────────────────────────────────────
// POST /escrow/pay
// Mentee locks tokens into escrow
// ─────────────────────────────────────────────────────────────
export const payEscrow = async ({
  connectRequestId,
  sessionRate,
  sessionCount,
}) => {
  const res = await axios.post(
    `${BASE_URL}/escrow/pay`,
    { connectRequestId, sessionRate, sessionCount },
    { headers: authHeader() },
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /escrow/release/:requestId
// Mentee confirms session complete — tokens go to mentor
// ─────────────────────────────────────────────────────────────
export const releaseEscrow = async (requestId) => {
  const res = await axios.post(
    `${BASE_URL}/escrow/release/${requestId}`,
    {},
    { headers: authHeader() },
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /escrow/refund/:requestId
// Either party cancels — tokens return to mentee
// ─────────────────────────────────────────────────────────────
export const refundEscrow = async (requestId) => {
  const res = await axios.post(
    `${BASE_URL}/escrow/refund/${requestId}`,
    {},
    { headers: authHeader() },
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET /escrow/status/:requestId
// Get payment + wallet snapshot for a connect request
// ─────────────────────────────────────────────────────────────
export const getEscrowStatus = async (requestId) => {
  const res = await axios.get(`${BASE_URL}/escrow/status/${requestId}`, {
    headers: authHeader(),
  });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /escrow/pay-additional
// Mentee locks tokens for a single additional session slot
// ─────────────────────────────────────────────────────────────
export const payAdditionalEscrow = async ({ connectRequestId, sessionRate, slotId }) => {
  const res = await axios.post(
    `${BASE_URL}/escrow/pay-additional`,
    { connectRequestId, sessionRate, slotId },
    { headers: authHeader() },
  );
  return res.data;
};