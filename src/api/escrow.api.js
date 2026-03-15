// src/api/escrow.api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─────────────────────────────────────────────────────────────
// POST /api/escrow/pay
// Mentee locks tokens into escrow
// ─────────────────────────────────────────────────────────────
export const payEscrow = async ({ connectRequestId, sessionRate, sessionCount }) => {
  const res = await axios.post(
    `${BASE_URL}/api/escrow/pay`,
    { connectRequestId, sessionRate, sessionCount },
    { headers: authHeader() }
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /api/escrow/release/:requestId
// Mentee confirms session complete — tokens go to mentor
// ─────────────────────────────────────────────────────────────
export const releaseEscrow = async (requestId) => {
  const res = await axios.post(
    `${BASE_URL}/api/escrow/release/${requestId}`,
    {},
    { headers: authHeader() }
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// POST /api/escrow/refund/:requestId
// Either party cancels — tokens return to mentee
// ─────────────────────────────────────────────────────────────
export const refundEscrow = async (requestId) => {
  const res = await axios.post(
    `${BASE_URL}/api/escrow/refund/${requestId}`,
    {},
    { headers: authHeader() }
  );
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// GET /api/escrow/status/:requestId
// Get payment + wallet snapshot for a connect request
// ─────────────────────────────────────────────────────────────
export const getEscrowStatus = async (requestId) => {
  const res = await axios.get(
    `${BASE_URL}/api/escrow/status/${requestId}`,
    { headers: authHeader() }
  );
  return res.data;
};