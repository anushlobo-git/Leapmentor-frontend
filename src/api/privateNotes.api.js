// src/privateNotes.api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Create a new private note
export const createPrivateNote = async (connectRequestId, title, content) => {
  const res = await axios.post(
    `${BASE_URL}/private-notes`,
    { connectRequestId, title, content },
    { headers: authHeader() }
  );
  return res.data;
};

// Get all private notes for a session
export const getPrivateNotes = async (connectRequestId) => {
  const res = await axios.get(
    `${BASE_URL}/private-notes/${connectRequestId}`,
    { headers: authHeader() }
  );
  return res.data;
};

// Update a note
export const updatePrivateNote = async (noteId, title, content) => {
  const res = await axios.patch(
    `${BASE_URL}/private-notes/${noteId}`,
    { title, content },
    { headers: authHeader() }
  );
  return res.data;
};

// Delete a note
export const deletePrivateNote = async (noteId) => {
  const res = await axios.delete(
    `${BASE_URL}/private-notes/${noteId}`,
    { headers: authHeader() }
  );
  return res.data;
};