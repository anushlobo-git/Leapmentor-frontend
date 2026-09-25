/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";

interface BlockerLike {
  state: "blocked" | "unblocked" | "proceeding";
  proceed?: () => void;
  reset?: () => void;
}

interface UnsavedChangesDialogProps {
  blocker: BlockerLike;
}

export default function UnsavedChangesDialog({ blocker }: UnsavedChangesDialogProps) {
  const isBlocked = blocker.state === "blocked";
  const stay = blocker.reset;

  useEffect(() => {
    if (!isBlocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stay?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isBlocked, stay]);

  if (!isBlocked) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <h2 id="unsaved-changes-title" className="text-lg font-bold text-slate-900">
          Leave without saving?
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          You have unsaved changes. If you leave now, they will be lost.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => blocker.reset?.()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-blue-900 border-2 border-blue-900 hover:bg-blue-50 transition-colors"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={() => blocker.proceed?.()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </dialog>
  );
}
