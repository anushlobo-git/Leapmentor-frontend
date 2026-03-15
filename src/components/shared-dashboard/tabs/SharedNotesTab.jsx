// src/components/shared-dashboard/tabs/SharedNotesTab.jsx
import { useState, useRef, useCallback } from "react";
import useNotes from "../../../hooks/useNotes";

// ── Helpers ───────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const formatDateSeparator = (dateStr) => {
  const date      = new Date(dateStr);
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString())     return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const getMyId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).id;
  } catch {
    return null;
  }
};

// ── File Icon ─────────────────────────────────────────────────
const FILE_ICON_STYLES = {
  pdf:   "bg-red-50 text-red-500",
  image: "bg-green-50 text-green-600",
  doc:   "bg-blue-50 text-blue-500",
  ppt:   "bg-orange-50 text-orange-500",
  excel: "bg-emerald-50 text-emerald-600",
  txt:   "bg-slate-50 text-slate-500",
  other: "bg-violet-50 text-violet-500",
};

const FILE_ICON_LABELS = {
  pdf: "PDF", image: "IMG", doc: "DOC",
  ppt: "PPT", excel: "XLS", txt: "TXT", other: "FILE",
};

const FileIcon = ({ fileType }) => {
  const style = FILE_ICON_STYLES[fileType] || FILE_ICON_STYLES.other;
  const label = FILE_ICON_LABELS[fileType] || "FILE";
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style}`}>
      <span className="text-[9px] font-extrabold tracking-wide">{label}</span>
    </div>
  );
};

// ── Date Separator ────────────────────────────────────────────
const DateSeparator = ({ dateStr }) => (
  <div className="flex items-center gap-2.5 my-4">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-semibold text-slate-400 px-3 py-0.5 rounded-full bg-slate-50 border border-slate-100 whitespace-nowrap">
      {formatDateSeparator(dateStr)}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ── Loading Skeletons ─────────────────────────────────────────
const LoadingSkeletons = () => (
  <div className="flex flex-col gap-2.5">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 bg-slate-100 rounded w-3/5" />
          <div className="h-2.5 bg-slate-100 rounded w-2/5" />
        </div>
      </div>
    ))}
  </div>
);

// ── Empty State ───────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800">No notes yet</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
        Upload PDFs, documents, or images to share with your session partner.
      </p>
    </div>
  </div>
);

// ── Upload Area ───────────────────────────────────────────────
const UploadArea = ({ onUpload, uploading, onCancel }) => {
  const [dragOver,     setDragOver]     = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title,        setTitle]        = useState("");
  const [fileError,    setFileError]    = useState("");
  const inputRef = useRef(null);

  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const validateAndSet = (file) => {
    setFileError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("File type not supported. Use PDF, image, Word, PowerPoint, Excel or text.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 10MB.");
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
    if (result?.success) {
      setSelectedFile(null);
      setTitle("");
      onCancel();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 mb-5">

      {/* Drop zone */}
      <div
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-7 text-center transition-all duration-200
          ${dragOver      ? "border-blue-400 bg-blue-50 cursor-pointer"
          : selectedFile  ? "border-emerald-400 bg-emerald-50 cursor-default"
          : "border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300"}`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-emerald-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setTitle(""); setFileError(""); }}
              className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Drop file here or{" "}
              <span className="text-blue-600">click to browse</span>
            </p>
            <p className="text-xs text-slate-400">
              PDF, Word, PowerPoint, Excel, Images, Text · Max 10MB
            </p>
          </div>
        )}
        <input
          ref={inputRef} type="file" onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt"
        />
      </div>

      {/* File error */}
      {fileError && (
        <p className="text-xs text-red-500 font-medium">{fileError}</p>
      )}

      {/* Title input */}
      {selectedFile && (
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">
            Title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 2 Summary"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 text-slate-800"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold
            hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading || !!fileError}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold
            hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Uploading...
            </>
          ) : "Upload"}
        </button>
      </div>
    </div>
  );
};

// ── Note Card ─────────────────────────────────────────────────
const NoteCard = ({ note, myId, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const isOwn = note.uploadedBy?._id === myId || note.uploadedBy === myId;

  const handleDelete = async () => {
    if (!window.confirm("Delete this note?")) return;
    setDeleting(true);
    await onDelete(note._id);
    setDeleting(false);
  };

  // ✅ Force download using fetch to bypass browser open-in-tab behavior
  const handleDownload = async () => {
    try {
      const response = await fetch(note.fileUrl);
      const blob     = await response.blob();
      const url      = window.URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = note.fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(note.fileUrl, "_blank");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3
      hover:border-slate-300 hover:shadow-sm transition-all duration-150">

      {/* File icon */}
      <FileIcon fileType={note.fileType} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">
          {note.title || note.fileName}
        </p>
        {note.title && note.title !== note.fileName && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{note.fileName}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400">
            {formatFileSize(note.fileSize)} · {formatDate(note.createdAt)}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
            ${isOwn
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : "bg-violet-50 text-violet-600 border-violet-100"}`}>
            {isOwn ? "You" : note.uploadedBy?.name || "Partner"}
          </span>
        </div>

        {/* Actions — Download + Delete only */}
        <div className="flex gap-2 mt-3">

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
              bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>

          {/* Delete — own notes only */}
          {isOwn && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200
                bg-white text-red-500 text-xs font-semibold hover:bg-red-50 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const SharedNotesTab = ({ connect }) => {
  const [showUpload, setShowUpload] = useState(false);

  const {
    notes, loading, uploading, error,
    uploadNote, deleteNote,
  } = useNotes(connect?._id);

  const myId = getMyId();

  const handleUpload = useCallback(async (file, title) => {
    const result = await uploadNote(file, title);
    return result;
  }, [uploadNote]);

  return (
    <div className="space-y-0">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shared Notes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Upload and share documents, notes, and resources with your session partner.
          </p>
        </div>
        {!showUpload && connect?.status!=="completed" &&(
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white
              text-xs font-bold hover:bg-blue-700 transition-all shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200
          text-red-600 rounded-xl px-4 py-3 mb-4">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Upload area */}
      {showUpload && (
        <UploadArea
          onUpload={handleUpload}
          uploading={uploading}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Notes list */}
      {loading ? (
        <LoadingSkeletons />
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col">
          {notes.map((note, index) => {
            const prev    = notes[index - 1];
            const showSep = !prev || !isSameDay(prev.createdAt, note.createdAt);
            return (
              <div key={note._id}>
                {showSep && <DateSeparator dateStr={note.createdAt} />}
                <div className="mb-2.5">
                  <NoteCard note={note} myId={myId} onDelete={deleteNote} />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default SharedNotesTab;