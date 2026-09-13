/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// ✅ replace entire file
import axiosInstance from "@lib/axiosInstance";

/**
 * Creates a private note for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @param {string} title - Note title.
 * @param {string} content - Note body.
 * @returns {Promise<any>} Backend response payload.
 */
export const createPrivateNote = async (connectRequestId, title, content) => {
  const res = await axiosInstance.post("/private-notes", { connectRequestId, title, content });
  return res.data;
};

/**
 * Fetches private notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getPrivateNotes = async (connectRequestId) => {
  const res = await axiosInstance.get(`/private-notes/${connectRequestId}`);
  return res.data;
};

/**
 * Updates a private note.
 * @param {string} noteId - Note identifier.
 * @param {string} title - Updated title.
 * @param {string} content - Updated note body.
 * @returns {Promise<any>} Backend response payload.
 */
export const updatePrivateNote = async (noteId, title, content) => {
  const res = await axiosInstance.patch(`/private-notes/${noteId}`, { title, content });
  return res.data;
};

/**
 * Deletes a private note by ID.
 * @param {string} noteId - Note identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const deletePrivateNote = async (noteId) => {
  const res = await axiosInstance.delete(`/private-notes/${noteId}`);
  return res.data;
};