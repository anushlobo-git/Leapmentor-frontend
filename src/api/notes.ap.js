/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// ✅ replace entire file
import axiosInstance from "@utils/axiosInstance";

/**
 * Uploads a note or note attachment for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @param {File} file - File to upload.
 * @param {string} [title=""] - Optional note title.
 * @param {boolean} [isPrivate=false] - Whether the note should be private.
 * @returns {Promise<any>} Backend response payload.
 */
export const uploadNote = async (
  connectRequestId,
  file,
  title = "",
  isPrivate = false,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("connectRequestId", connectRequestId);
  if (title?.trim()) formData.append("title", title.trim());
  if (isPrivate) formData.append("isPrivate", "true");

  const res = await axiosInstance.post("/notes/upload", formData);
  return res.data;
};

/**
 * Fetches shared notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getNotes = async (connectRequestId) => {
  const res = await axiosInstance.get(`/notes/${connectRequestId}`);
  return res.data;
};

/**
 * Fetches private notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getPrivateNotes = async (connectRequestId) => {
  const res = await axiosInstance.get(`/notes/${connectRequestId}/private`);
  return res.data;
};

/**
 * Deletes a note by ID.
 * @param {string} noteId - Note identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const deleteNote = async (noteId) => {
  const res = await axiosInstance.delete(`/notes/${noteId}`);
  return res.data;
};
