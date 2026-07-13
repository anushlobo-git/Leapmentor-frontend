/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/private-notes/PrivateFilesSection.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import useNotes from "@features/notes/hooks/useNotes";
import {
  selectConnectId,
  selectConnectStatus,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import {
  groupNotesByDay,
  NoteDateSeparator,
  NotesLoadingSkeletons,
} from "@features/shared-dashboard/components/tabs/notesTabShared";
import PrivateUploadModal from "@features/shared-dashboard/components/tabs/private-notes/PrivateUploadModal";
import PrivateFileCard from "@features/shared-dashboard/components/tabs/private-notes/PrivateFileCard";

// ── Private Files Section ─────────────────────────────────────
const PrivateFilesSection = () => {
  const connectId = useSelector(selectConnectId);
  const isCompleted = useSelector(selectConnectStatus) === "completed";
  const [showUpload, setShowUpload] = useState(false);
  const { privateNotes, loading, uploading, error, uploadNote, deleteNote } =
    useNotes(connectId);

  const handleUpload = async (file, title) => uploadNote(file, title, true);
  const handleDelete = async (noteId) => deleteNote(noteId, true);

  const safeNotes = privateNotes || [];

  const groupedItems = groupNotesByDay(safeNotes);

  // ── Extracted: was a nested ternary (loading / empty / list) ──
  let filesContent;
  if (loading) {
    filesContent = (
      <NotesLoadingSkeletons gridClassName="grid grid-cols-2 gap-4 w-full" />
    );
  } else if (safeNotes.length === 0) {
    filesContent = (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center mb-5">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-700">
          No private files yet
        </p>
        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
          Upload files that only you can access — your session partner won't see
          these.
        </p>
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all shadow-sm"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Upload First Private File
          </button>
        )}
      </div>
    );
  } else {
    filesContent = (
      <div className="w-full grid grid-cols-2 gap-4">
        {groupedItems.map((item) =>
          item.type === "separator" ? (
            <NoteDateSeparator key={item.key} dateStr={item.dateStr} />
          ) : (
            <PrivateFileCard
              key={item.key}
              note={item.note}
              onDelete={handleDelete}
            />
          ),
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Private Files</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {safeNotes.length} file{safeNotes.length === 1 ? "" : "s"} — only
            visible to you
          </p>
        </div>
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all shadow-sm"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Private File
          </button>
        )}
      </div>

      {error && !uploading && (
        <div className="flex items-center gap-2.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          {error}
        </div>
      )}

      {filesContent}

      {showUpload && (
        <PrivateUploadModal
          onUpload={handleUpload}
          uploading={uploading}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default PrivateFilesSection;
