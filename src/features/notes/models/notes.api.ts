/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// ✅ replace entire file
import axiosInstance from "@lib/http/axiosInstance";

export interface FileNote {
  _id: string;
  title?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  uploadedBy?: string | { _id?: string; name?: string };
}

export interface FileNotesResponse {
  notes?: FileNote[];
}

export interface FileNoteResponse {
  note: FileNote;
  success?: boolean;
}

export interface DeleteNoteResponse {
  success?: boolean;
}

/**
 * Uploads a note or note attachment for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @param {File} file - File to upload.
 * @param {string} [title=""] - Optional note title.
 * @param {boolean} [isPrivate=false] - Whether the note should be private.
 * @returns {Promise<any>} Backend response payload.
 */
export const uploadNote = async (
  connectRequestId: string,
  file: File,
  title: string = "",
  isPrivate: boolean = false,
): Promise<FileNoteResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("connectRequestId", connectRequestId);
  if (title?.trim()) formData.append("title", title.trim());
  if (isPrivate) formData.append("isPrivate", "true");

  const res = await axiosInstance.post<FileNoteResponse>("/notes/upload", formData);
  return res.data;
};

/**
 * Fetches shared notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getNotes = async (connectRequestId: string): Promise<FileNotesResponse> => {
  const res = await axiosInstance.get<FileNotesResponse>(`/notes/${connectRequestId}`);
  return res.data;
};

/**
 * Fetches private notes for a connect request.
 * @param {string} connectRequestId - Connect request identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const getPrivateNotes = async (connectRequestId: string): Promise<FileNotesResponse> => {
  const res = await axiosInstance.get<FileNotesResponse>(`/notes/${connectRequestId}/private`);
  return res.data;
};

/**
 * Deletes a note by ID.
 * @param {string} noteId - Note identifier.
 * @returns {Promise<any>} Backend response payload.
 */
export const deleteNote = async (noteId: string): Promise<DeleteNoteResponse> => {
  const res = await axiosInstance.delete<DeleteNoteResponse>(`/notes/${noteId}`);
  return res.data;
};
