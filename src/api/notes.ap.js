// src/api/notes.api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Upload a note (multipart/form-data) ───────────────────────
export const uploadNote = async (connectRequestId, file, title = "", isPrivate = false) => {
  const formData = new FormData();
  formData.append("file",             file);
  formData.append("connectRequestId", connectRequestId);
  if (title?.trim())  formData.append("title",     title.trim());
  if (isPrivate)      formData.append("isPrivate",  "true");       // ✅ NEW

  const res = await axios.post(`${BASE_URL}/api/notes/upload`, formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// ── Fetch all shared notes for a session ──────────────────────
export const getNotes = async (connectRequestId) => {
  const res = await axios.get(
    `${BASE_URL}/api/notes/${connectRequestId}`,
    { headers: authHeader() }
  );
  return res.data;
};

// ── Fetch private notes (own only) ────────────────────────────
export const getPrivateNotes = async (connectRequestId) => {
  const res = await axios.get(
    `${BASE_URL}/api/notes/${connectRequestId}/private`,
    { headers: authHeader() }
  );
  return res.data;
};

// ── Delete a note ─────────────────────────────────────────────
export const deleteNote = async (noteId) => {
  const res = await axios.delete(
    `${BASE_URL}/api/notes/${noteId}`,
    { headers: authHeader() }
  );
  return res.data;
};