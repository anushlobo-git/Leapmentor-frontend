/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// ✅ replace entire file
import axiosInstance from "@lib/http/axiosInstance";

export interface PrivateNote {
  _id: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrivateNotesResponse {
  notes?: PrivateNote[];
}

export interface PrivateNoteResponse {
  note: PrivateNote;
  success?: boolean;
}

export interface DeletePrivateNoteResponse {
  success?: boolean;
}

/**
 * Creates a private note for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @param {string} title - Note title.
 * @param {string} content - Note body.
 * @returns {Promise<any>} Backend response payload.
 */
export const createPrivateNote = async (
  connectRequestId: string,
  title: string,
  content: string,
): Promise<PrivateNoteResponse> => {
  const res = await axiosInstance.post<PrivateNoteResponse>("/private-notes", {
    connectRequestId,
    title,
    content,
  });
  return res.data;
};

/**
 * Fetches private notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getPrivateNotes = async (connectRequestId: string): Promise<PrivateNotesResponse> => {
  const res = await axiosInstance.get<PrivateNotesResponse>(`/private-notes/${connectRequestId}`);
  return res.data;
};

/**
 * Updates a private note.
 * @param {string} noteId - Note identifier.
 * @param {string} title - Updated title.
 * @param {string} content - Updated note body.
 * @returns {Promise<any>} Backend response payload.
 */
export const updatePrivateNote = async (
  noteId: string,
  title: string,
  content: string,
): Promise<PrivateNoteResponse> => {
  const res = await axiosInstance.patch<PrivateNoteResponse>(`/private-notes/${noteId}`, {
    title,
    content,
  });
  return res.data;
};

/**
 * Deletes a private note by ID.
 * @param {string} noteId - Note identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const deletePrivateNote = async (noteId: string): Promise<DeletePrivateNoteResponse> => {
  const res = await axiosInstance.delete<DeletePrivateNoteResponse>(`/private-notes/${noteId}`);
  return res.data;
};
