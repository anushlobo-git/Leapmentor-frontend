/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/NotepadSection.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import usePrivateNotes from "@features/notes/hooks/usePrivateNotes";
import NotepadEditor from "@features/shared-dashboard/components/tabs/private-notes/NotepadEditor";
import NoteListItem from "@features/shared-dashboard/components/tabs/private-notes/NoteListItem";

// ── Notepad Section ───────────────────────────────────────────
const NotepadSection = ({ connectId, isCompleted }) => {
  const { notes, loading, saving, createNote, updateNote, deleteNote } =
    usePrivateNotes(connectId);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [mobileView, setMobileView] = useState("list");

  useEffect(() => {
    if (!loading && notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0]._id);
    }
  }, [loading, notes]);

  const activeNote = notes.find((n) => n._id === activeNoteId) || null;

  const handleCreate = async () => {
    const result = await createNote("Untitled Note", "");
    if (result?.success) {
      setActiveNoteId(result.note._id);
      setMobileView("editor");
    }
  };

  const handleSave = async (noteId, title, content) => {
    if (noteId) return await updateNote(noteId, title, content);
    const result = await createNote(title, content);
    if (result?.success) setActiveNoteId(result.note._id);
    return result;
  };

  const handleDelete = async (noteId) => {
    if (!globalThis.confirm("Delete this note?")) return;
    await deleteNote(noteId);
    setActiveNoteId(notes.find((n) => n._id !== noteId)?._id || null);
    setMobileView("list");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    /* ── Horizontal layout: narrow sidebar | wide editor ── */
    <div
      className="flex gap-4 w-full overflow-hidden"
      style={{ height: "500px" }}
    >
      {/* Sidebar — fixed narrow width */}
      <div
        className={`flex flex-col gap-2.5 shrink-0 ${mobileView === "editor" ? "hidden" : "flex"} md:flex`}
        style={{ width: "200px" }}
      >
        {!isCompleted && (
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Note
          </button>
        )}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center gap-2 bg-white border border-slate-200 rounded-2xl">
            <span className="text-2xl">📝</span>
            <p className="text-xs text-slate-500 font-medium">No notes yet</p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-2 overflow-y-auto"
            style={{ maxHeight: "480px" }}
          >
            {notes.map((note) => (
              <NoteListItem
                key={note._id}
                note={note}
                isActive={activeNoteId === note._id}
                onClick={() => {
                  setActiveNoteId(note._id);
                  setMobileView("editor");
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor — takes all remaining horizontal space */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {/* Mobile back */}
        <div className="md:hidden mb-3">
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to notes
          </button>
        </div>

        {activeNote ? (
          <NotepadEditor
            note={activeNote}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => {
              setActiveNoteId(null);
              setMobileView("list");
            }}
            saving={saving}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-slate-700">
                No note selected
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Create a new note or select one from the list.
              </p>
            </div>
            {!isCompleted && (
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

NotepadSection.propTypes = {
  connectId: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
};

export default NotepadSection;
