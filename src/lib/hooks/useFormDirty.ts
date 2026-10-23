/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useRef } from "react";

interface UseFormDirtyOptions {
  /** Baseline is captured on the first render where this is true (e.g. after prefill fetch). */
  ready?: boolean;
  /** Force "clean" — e.g. after a successful save, so the redirect isn't blocked. */
  disabled?: boolean;
}

/**
 * Reports whether `form` differs from its baseline snapshot.
 * The snapshot is taken once, on the first `ready` render.
 */
export const useFormDirty = (
  form: unknown,
  { ready = true, disabled = false }: UseFormDirtyOptions = {},
): boolean => {
  const baseline = useRef<string | null>(null);
  const current = JSON.stringify(form);

  if (ready && baseline.current === null) {
    baseline.current = current;
  }

  if (!ready || disabled || baseline.current === null) return false;
  return current !== baseline.current;
};
