/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/hooks/useNotes.js
import { useState, useEffect, useCallback } from "react";
import logger from "@lib/monitoring/logger";
import {
  getNotes        as apiGetNotes,
  uploadNote      as apiUploadNote,
  deleteNote      as apiDeleteNote,
  getPrivateNotes as apiGetPrivateNotes,
} from "@features/notes/models/notes.api";
import type { FileNote } from "@features/notes/models/notes.api";

type NotesApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};
/**
 * Custom hook for notes.
 * @returns {Object} Hook state and handlers for the caller.
 */

const useNotes = (connectRequestId: string | null | undefined) => {
  const [notes,          setNotes]          = useState<FileNote[]>([]);
  const [privateNotes,   setPrivateNotes]   = useState<FileNote[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [privateLoading, setPrivateLoading] = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // ── Fetch shared notes ────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetNotes(connectRequestId);
      setNotes(data.notes || []);
    } catch (err: unknown) {
      const error = err as NotesApiError;
      setError(error.response?.data?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  // ── Fetch private notes ───────────────────────────────────
  const fetchPrivateNotes = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setPrivateLoading(true);
      const data = await apiGetPrivateNotes(connectRequestId);
      setPrivateNotes(data.notes || []);
    } catch (err: unknown) {
      // ✅ Don't set global error for private notes — just log
      const error = err as NotesApiError;
      logger.warn("Private notes fetch failed:", { error: error.response?.data?.message });
    } finally {
      setPrivateLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => {
    fetchNotes();
    fetchPrivateNotes();
  }, [fetchNotes, fetchPrivateNotes]);

  // ── Upload a note ─────────────────────────────────────────
  const uploadNote = useCallback(async (
    file: File | null | undefined,
    title: string = "",
    isPrivate: boolean = false,
  ) => {
    if (!file || !connectRequestId) return;
    try {
      setUploading(true);
      setError(null);
      const data = await apiUploadNote(connectRequestId, file, title, isPrivate);
      if (isPrivate) {
        setPrivateNotes((prev) => [data.note, ...prev]);
      } else {
        setNotes((prev) => [data.note, ...prev]);
      }
      return { success: true };
    } catch (err: unknown) {
      const error = err as NotesApiError;
      const msg = error.response?.data?.message || "Upload failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setUploading(false);
    }
  }, [connectRequestId]);

  // ── Delete a note ─────────────────────────────────────────
  const deleteNote = useCallback(async (noteId: string, isPrivate: boolean = false) => {
    try {
      setError(null);
      await apiDeleteNote(noteId);
      if (isPrivate) {
        setPrivateNotes((prev) => prev.filter((n) => n._id !== noteId));
      } else {
        setNotes((prev) => prev.filter((n) => n._id !== noteId));
      }
      return { success: true };
    } catch (err: unknown) {
      const error = err as NotesApiError;
      const msg = error.response?.data?.message || "Delete failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  return {
    notes,
    privateNotes,
    loading,
    privateLoading,
    uploading,
    error,
    uploadNote,
    deleteNote,
    refetch:        fetchNotes,
    refetchPrivate: fetchPrivateNotes,
  };
};

export default useNotes;
