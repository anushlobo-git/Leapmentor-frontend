/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

// src/features/shared-dashboard/components/tabs/SharedNotesTab.jsx
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import useNotes from "@features/notes/hooks/useNotes";
import PrivateNotesTab from "@features/shared-dashboard/components/tabs/PrivateNotesTab";
import {
  selectConnectId,
  selectConnectStatus,
} from "@features/shared-dashboard/store/sharedDashboardSlice";
import PropTypes from "prop-types";
import { validateDocumentFile } from "@lib/validation/schemas";
import { formatDateString as formatDate } from "@lib/formatters/dateTime";
import {
  formatFileSize,
  FILE_TYPE_CONFIG,
} from "@features/notes/utils/notesHelpers";
import {
  groupNotesByDay,
  downloadNoteFile,
  NoteDateSeparator,
  FileTypeBadge,
  NotesLoadingSkeletons,
} from "@features/shared-dashboard/components/tabs/notesTabShared";

// ── Upload Modal ──────────────────────────────────────────────
const UploadModal = ({ onUpload, uploading, onClose, isPrivateView }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const validateAndSet = (file) => {
    setFileError("");
    if (!file) return;
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  };
  const handleFileInput = (e) => validateAndSet(e.target.files?.[0]);
  const handleUpload = async () => {
    if (!selectedFile) return;
    const result = await onUpload(selectedFile, title);
    if (result?.success) onClose();
  };

  let uploadZoneClassName =
    "border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40";
  if (dragOver) {
    uploadZoneClassName = "border-blue-400 bg-blue-50 cursor-pointer";
  } else if (selectedFile) {
    uploadZoneClassName = "border-emerald-400 bg-emerald-50 cursor-default";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isPrivateView ? "Upload Private File" : "Upload Shared File"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPrivateView
                ? "Only visible to you"
                : "Visible to both you and your session partner"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {isPrivateView && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-xs font-semibold text-amber-700">
                This file will be <strong>private</strong> — your partner cannot
                see it.
              </p>
            </div>
          )}
          <label
            htmlFor="shared-notes-file-input"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${uploadZoneClassName}`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700 break-all">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setTitle("");
                    setFileError("");
                  }}
                  className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isPrivateView ? "bg-amber-100 border-amber-200" : "bg-blue-100 border-blue-200"}`}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isPrivateView ? "#d97706" : "#2563eb"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Drop file here or{" "}
                    <span
                      className={
                        isPrivateView ? "text-amber-600" : "text-blue-600"
                      }
                    >
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, Word, PPT, Excel, Images · Max 10MB
                  </p>
                </div>
              </div>
            )}
            <input
              id="shared-notes-file-input"
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt"
            />
          </label>
          {fileError && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{fileError}</p>
            </div>
          )}
          {selectedFile && (
            <div>
              <label
                htmlFor="note-title-input"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
              >
                Title (optional)
              </label>
              <input
                id="note-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 2 Summary"
                className="w-full text-sm border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 text-slate-800 font-medium"
              />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading || !!fileError}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm ${isPrivateView ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
                  Uploading...
                </>
              ) : (
                <>
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
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  </svg>
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Note Card — full width, taller, equal columns ─────────────
const NoteCard = ({ note, myId, onDelete, isPrivateView = false }) => {
  const [deleting, setDeleting] = useState(false);
  const isOwn = note.uploadedBy?._id === myId || note.uploadedBy === myId;
  const cfg = FILE_TYPE_CONFIG[note.fileType] || FILE_TYPE_CONFIG.other;

  const handleDelete = async () => {
    if (!globalThis.confirm("Delete this file?")) return;
    setDeleting(true);
    await onDelete(note._id);
    setDeleting(false);
  };

  const handleDownload = async () => downloadNoteFile(note, "shared note");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 w-full h-full">
      {/* File type icon */}
      <FileTypeBadge cfg={cfg} />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-800 truncate flex-1">
            {note.title || note.fileName}
          </p>
          {!isPrivateView && (
            <span
              className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isOwn
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-violet-50 text-violet-600 border-violet-200"
              }`}
            >
              {isOwn ? "You" : note.uploadedBy?.name || "Partner"}
            </span>
          )}
          {isPrivateView && (
            <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
              🔒 Private
            </span>
          )}
        </div>

        {note.title && note.title !== note.fileName && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {note.fileName}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          {formatFileSize(note.fileSize)} · {formatDate(note.createdAt)}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          {(isOwn || isPrivateView) && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-500 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared Files Section ──────────────────────────────────────
const SharedFilesSection = ({ myId }) => {
  const connectId = useSelector(selectConnectId);
  const isCompleted = useSelector(selectConnectStatus) === "completed";
  const [showUpload, setShowUpload] = useState(false);
  const { notes, loading, uploading, error, uploadNote, deleteNote } =
    useNotes(connectId);

  const handleUpload = async (file, title) => uploadNote(file, title, false);
  const handleDelete = async (noteId) => deleteNote(noteId, false);

  const groupedItems = groupNotesByDay(notes);

  let content;
  if (loading) {
    content = (
      <NotesLoadingSkeletons gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" />
    );
  } else if (notes.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-5">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-base font-bold text-slate-700">
          No shared files yet
        </p>
        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
          Upload PDFs, documents, images, or presentations to share with your
          session partner.
        </p>
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
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
            Upload First File
          </button>
        )}
      </div>
    );
  } else {
    content = (
      /* ── Full-width equal 2-column grid ── */
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
        style={{ gridAutoRows: "1fr" }}
      >
        {groupedItems.map((item) =>
          item.type === "separator" ? (
            <NoteDateSeparator key={item.key} dateStr={item.dateStr} />
          ) : (
            <NoteCard
              key={item.key}
              note={item.note}
              myId={myId}
              onDelete={handleDelete}
              isPrivateView={false}
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
          <h2 className="text-base font-bold text-slate-800">Shared Files</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {notes.length} {notes.length === 1 ? "file" : "files"} shared with
            your session partner
          </p>
        </div>
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
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
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload File
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

      {content}

      {showUpload && (
        <UploadModal
          onUpload={handleUpload}
          uploading={uploading}
          onClose={() => setShowUpload(false)}
          isPrivateView={false}
        />
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const SharedNotesTab = () => {
  const connectId = useSelector(selectConnectId);
  const myId = useSelector((state) => state.auth.user?.id);
  const [activeView, setActiveView] = useState("shared");

  if (!connectId) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Notes & Files
        </h1>
        <p className="text-sm font-medium text-blue-900 mt-1">
          Manage shared resources and your private workspace
        </p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-full sm:w-fit">
        <button
          onClick={() => setActiveView("shared")}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeView === "shared"
              ? "bg-white text-blue-700 shadow-sm border border-blue-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
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
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Shared
        </button>
        <button
          onClick={() => setActiveView("private")}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeView === "private"
              ? "bg-white text-amber-700 shadow-sm border border-amber-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
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
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Private
        </button>
      </div>

      {activeView === "shared" && <SharedFilesSection myId={myId} />}
      {activeView === "private" && <PrivateNotesTab />}
    </div>
  );
};

UploadModal.propTypes = {
  onUpload: PropTypes.func.isRequired,
  uploading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isPrivateView: PropTypes.bool.isRequired,
};

NoteCard.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    fileName: PropTypes.string,
    fileType: PropTypes.string,
    fileSize: PropTypes.number,
    fileUrl: PropTypes.string,
    createdAt: PropTypes.string,
    uploadedBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
    ]),
  }).isRequired,
  myId: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  isPrivateView: PropTypes.bool,
};

SharedFilesSection.propTypes = {
  myId: PropTypes.string,
};

export default SharedNotesTab;
