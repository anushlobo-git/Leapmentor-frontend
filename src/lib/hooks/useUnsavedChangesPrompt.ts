/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Blocks in-app navigation (data-router `useBlocker`) and tab close/refresh
 * (`beforeunload`) while `isDirty` is true.
 * Returns the blocker so the caller can render <UnsavedChangesDialog />.
 * Requires a data router (createBrowserRouter / createMemoryRouter).
 */
export const useUnsavedChangesPrompt = (isDirty: boolean) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return blocker;
};
