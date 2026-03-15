// src/hooks/useNotes.js
import { useState, useEffect, useCallback } from "react";
import {
  getNotes    as apiGetNotes,
  uploadNote  as apiUploadNote,
  deleteNote  as apiDeleteNote,
} from "../api/notes.ap";

const useNotes = (connectRequestId) => {
  const [notes,     setNotes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  // ── Fetch notes on mount ──────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!connectRequestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetNotes(connectRequestId);
      setNotes(data.notes || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, [connectRequestId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Upload a note ─────────────────────────────────────────
  const uploadNote = useCallback(async (file, title = "") => {
    if (!file || !connectRequestId) return;
    try {
      setUploading(true);
      setError(null);
      const data = await apiUploadNote(connectRequestId, file, title);
      // ✅ Prepend new note to top of list
      setNotes((prev) => [data.note, ...prev]);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Upload failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setUploading(false);
    }
  }, [connectRequestId]);

  // ── Delete a note ─────────────────────────────────────────
  const deleteNote = useCallback(async (noteId) => {
    try {
      setError(null);
      await apiDeleteNote(noteId);
      // ✅ Remove from local state immediately
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || "Delete failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  return {
    notes,
    loading,
    uploading,
    error,
    uploadNote,
    deleteNote,
    refetch: fetchNotes,
  };
};

export default useNotes;