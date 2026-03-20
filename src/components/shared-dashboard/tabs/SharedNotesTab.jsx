// src/components/shared-dashboard/tabs/SharedNotesTab.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import useNotes        from "../../../hooks/useNotes";
import usePrivateNotes from "../../../hooks/usePrivateNotes";

// ── Helpers ───────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
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
  } catch { return null; }
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

// ── Upload Area ───────────────────────────────────────────────
const UploadArea = ({ onUpload, uploading, onCancel, isPrivateView }) => {
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
    if (result?.success) { setSelectedFile(null); setTitle(""); onCancel(); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 mb-5">
      {isPrivateView && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <span className="text-sm">🔒</span>
          <p className="text-xs font-semibold text-amber-700">This file will be private — only visible to you.</p>
        </div>
      )}
      {/* ✅ Reduced padding on mobile */}
      <div
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-5 sm:p-7 text-center transition-all duration-200
          ${dragOver ? "border-blue-400 bg-blue-50 cursor-pointer"
          : selectedFile ? "border-emerald-400 bg-emerald-50 cursor-default"
          : "border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300"}`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-emerald-700 break-all">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setTitle(""); setFileError(""); }}
              className="text-xs text-slate-400 underline hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
              Choose different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              <span className="hidden sm:inline">Drop file here or </span>
              <span className="text-blue-600">click to browse</span>
            </p>
            <p className="text-xs text-slate-400">PDF, Word, PPT, Excel, Images · Max 10MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" onChange={handleFileInput} className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt" />
      </div>
      {fileError && <p className="text-xs text-red-500 font-medium">{fileError}</p>}
      {selectedFile && (
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Title (optional)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 2 Summary"
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 text-slate-800" />
        </div>
      )}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={uploading}
          className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          Cancel
        </button>
        <button type="button" onClick={handleUpload} disabled={!selectedFile || uploading || !!fileError}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {uploading ? (<><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Uploading...</>) : "Upload"}
        </button>
      </div>
    </div>
  );
};

// ── Note Card (file) ──────────────────────────────────────────
const NoteCard = ({ note, myId, onDelete, isPrivateView = false }) => {
  const [deleting, setDeleting] = useState(false);
  const isOwn = note.uploadedBy?._id === myId || note.uploadedBy === myId;

  const handleDelete = async () => {
    if (!window.confirm("Delete this file?")) return;
    setDeleting(true);
    await onDelete(note._id);
    setDeleting(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(note.fileUrl);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = note.fileName || "download";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { window.open(note.fileUrl, "_blank"); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex gap-3 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
      <FileIcon fileType={note.fileType} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{note.title || note.fileName}</p>
        {note.title && note.title !== note.fileName && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{note.fileName}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400">
            {formatFileSize(note.fileSize)} · {formatDate(note.createdAt)}
          </span>
          {!isPrivateView && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isOwn ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-violet-50 text-violet-600 border-violet-100"}`}>
              {isOwn ? "You" : note.uploadedBy?.name || "Partner"}
            </span>
          )}
          {isPrivateView && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100">🔒 Private</span>
          )}
        </div>
        {/* ✅ Buttons stack on very small screens */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          {(isOwn || isPrivateView) && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-500 text-xs font-semibold hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
              </svg>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Notepad Editor ────────────────────────────────────────────
const NotepadEditor = ({ note, onSave, onDelete, onClose, saving }) => {
  const [title,   setTitle]   = useState(note?.title   || "");
  const [content, setContent] = useState(note?.content || "");
  const [dirty,   setDirty]   = useState(false);

  useEffect(() => {
    setTitle(note?.title   || "");
    setContent(note?.content || "");
    setDirty(false);
  }, [note?._id]);

  const handleSave = async () => {
    const result = await onSave(note?._id, title, content);
    if (result?.success) setDirty(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([`${title}\n\n${content}`], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${title || "note"}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${title || "Note"}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:auto;color:#1e293b;}
      h1{font-size:22px;margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;}
      pre{white-space:pre-wrap;font-size:14px;line-height:1.7;}</style></head>
      <body><h1>${title || "Untitled Note"}</h1><pre>${content}</pre></body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* ✅ Toolbar wraps on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 border-b border-slate-100 bg-slate-50 gap-2">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Note title..."
          className="flex-1 text-sm font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 min-w-0"
        />
        <div className="flex items-center gap-1.5 sm:gap-2 sm:ml-3 flex-wrap">
          <button type="button" onClick={downloadTxt}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-all">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            .txt
          </button>
          <button type="button" onClick={downloadPdf}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-all">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            .pdf
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? "Saving..." : "Save"}
          </button>
          {note?._id && (
            <button type="button" onClick={() => onDelete(note._id)}
              className="p-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          )}
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      {/* ✅ Taller textarea on mobile */}
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); }}
        placeholder="Start writing your private note here..."
        className="w-full h-48 sm:h-64 px-3 sm:px-4 py-3 text-sm text-slate-700 leading-relaxed resize-none outline-none bg-white placeholder:text-slate-300"
      />
      {dirty && (
        <p className="text-[10px] text-amber-500 font-medium px-4 pb-2">Unsaved changes</p>
      )}
    </div>
  );
};

// ── Notepad Note List Item ────────────────────────────────────
const NoteListItem = ({ note, isActive, onClick }) => (
  <button type="button" onClick={onClick}
    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 ${
      isActive ? "border-blue-300 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
    }`}>
    <p className="text-xs font-bold text-slate-700 truncate">{note.title || "Untitled Note"}</p>
    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{note.content || "No content"}</p>
    <p className="text-[10px] text-slate-300 mt-0.5">{formatDate(note.updatedAt)}</p>
  </button>
);

// ── Notepad Section ───────────────────────────────────────────
const NotepadSection = ({ connectId, isCompleted }) => {
  const { notes, loading, saving, createNote, updateNote, deleteNote } = usePrivateNotes(connectId);
  const [activeNoteId, setActiveNoteId] = useState(null);
  // ✅ On mobile, show list or editor (not side by side)
  const [mobileView, setMobileView] = useState("list"); // "list" | "editor"

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
      setMobileView("editor"); // ✅ switch to editor on mobile after creating
    }
  };

  const handleSave = async (noteId, title, content) => {
    if (noteId) {
      return await updateNote(noteId, title, content);
    } else {
      const result = await createNote(title, content);
      if (result?.success) setActiveNoteId(result.note._id);
      return result;
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    await deleteNote(noteId);
    setActiveNoteId(notes.find((n) => n._id !== noteId)?._id || null);
    setMobileView("list");
  };

  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setMobileView("editor"); // ✅ switch to editor on mobile when note selected
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Desktop: side by side | Mobile: stacked with toggle */}
      <div className="hidden sm:flex gap-4">
        {/* Sidebar — note list */}
        <div className="w-48 shrink-0 flex flex-col gap-2">
          {!isCompleted && (
            <button type="button" onClick={handleCreate}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Note
            </button>
          )}
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No notes yet</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {notes.map((note) => (
                <NoteListItem
                  key={note._id}
                  note={note}
                  isActive={activeNoteId === note._id}
                  onClick={() => setActiveNoteId(note._id)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Editor */}
        <div className="flex-1">
          {activeNote ? (
            <NotepadEditor
              note={activeNote}
              onSave={handleSave}
              onDelete={handleDelete}
              onClose={() => setActiveNoteId(null)}
              saving={saving}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-white border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">No note selected</p>
                <p className="text-xs text-slate-400 mt-1">Create a new note or select one from the list.</p>
              </div>
              {!isCompleted && (
                <button type="button" onClick={handleCreate}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
                  + New Note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mobile: list OR editor, toggled */}
      <div className="sm:hidden flex flex-col gap-3">
        {mobileView === "list" ? (
          <>
            {!isCompleted && (
              <button type="button" onClick={handleCreate}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Note
              </button>
            )}
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2 bg-white border border-slate-200 rounded-2xl">
                <p className="text-sm font-bold text-slate-700">No notes yet</p>
                <p className="text-xs text-slate-400">Create your first private note.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {notes.map((note) => (
                  <NoteListItem
                    key={note._id}
                    note={note}
                    isActive={activeNoteId === note._id}
                    onClick={() => handleSelectNote(note._id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ✅ Back button on mobile editor view */}
            <button type="button" onClick={() => setMobileView("list")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors self-start">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back to notes
            </button>
            {activeNote ? (
              <NotepadEditor
                note={activeNote}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={() => setMobileView("list")}
                saving={saving}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-white border border-slate-200 rounded-2xl">
                <p className="text-sm font-bold text-slate-700">No note selected</p>
                <button type="button" onClick={() => setMobileView("list")}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold">
                  View Notes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Files Section ─────────────────────────────────────────────
const FilesSection = ({ connect, isPrivateView }) => {
  const [showUpload, setShowUpload] = useState(false);
  const { notes, privateNotes, loading, uploading, error, uploadNote, deleteNote } = useNotes(connect?._id);
  const myId        = getMyId();
  const isCompleted = connect?.status === "completed";
  const displayNotes = isPrivateView ? privateNotes : notes;

  const handleUpload = async (file, title) => uploadNote(file, title, isPrivateView);
  const handleDelete = async (noteId) => deleteNote(noteId, isPrivateView);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {!showUpload && !isCompleted && (
          <button type="button" onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload File
          </button>
        )}
      </div>
      {error && !uploading && (
        <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4">
          <span>⚠</span> {error}
        </div>
      )}
      {showUpload && (
        <UploadArea
          onUpload={handleUpload}
          uploading={uploading}
          onCancel={() => setShowUpload(false)}
          isPrivateView={isPrivateView}
        />
      )}
      {loading ? (
        <LoadingSkeletons />
      ) : displayNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">No files yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              {isPrivateView ? "Upload private files only you can see." : "Upload PDFs, documents, or images to share with your session partner."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {displayNotes.map((note, index) => {
            const prev    = displayNotes[index - 1];
            const showSep = !prev || !isSameDay(prev.createdAt, note.createdAt);
            return (
              <div key={note._id}>
                {showSep && <DateSeparator dateStr={note.createdAt} />}
                <div className="mb-2.5">
                  <NoteCard note={note} myId={myId} onDelete={handleDelete} isPrivateView={isPrivateView} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const SharedNotesTab = ({ connect }) => {
  const [activeView,    setActiveView]    = useState("shared");
  const [privateSubTab, setPrivateSubTab] = useState("files");

  const isCompleted   = connect?.status === "completed";
  const isPrivateView = activeView === "private";

  if (!connect?._id) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Notes</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {isPrivateView
            ? "Your private space — files and notes only visible to you."
            : "Shared documents and resources with your session partner."}
        </p>
      </div>

      {/* Shared / Private toggle */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-4 sm:mb-5 w-fit">
        <button onClick={() => setActiveView("shared")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === "shared" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          🌐 Shared
        </button>
        <button onClick={() => setActiveView("private")}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === "private" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          🔒 Private
        </button>
      </div>

      {/* Private sub-tabs */}
      {isPrivateView && (
        <div className="flex items-center gap-3 mb-4 sm:mb-5 border-b border-slate-100 pb-3">
          <button onClick={() => setPrivateSubTab("files")}
            className={`text-xs font-bold pb-1 transition-all border-b-2 ${privateSubTab === "files" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            📁 Files
          </button>
          <button onClick={() => setPrivateSubTab("notepad")}
            className={`text-xs font-bold pb-1 transition-all border-b-2 ${privateSubTab === "notepad" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            📝 Notepad
          </button>
        </div>
      )}

      {/* Content */}
      {!isPrivateView && <FilesSection connect={connect} isPrivateView={false} />}
      {isPrivateView && privateSubTab === "files" && <FilesSection connect={connect} isPrivateView={true} />}
      {isPrivateView && privateSubTab === "notepad" && <NotepadSection connectId={connect._id} isCompleted={isCompleted} />}
    </div>
  );
};

export default SharedNotesTab;