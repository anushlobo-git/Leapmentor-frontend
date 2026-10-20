/**
 * Copyright (c) 2026 Leapmentor. All rights reserved.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type PriceField = "minPrice" | "maxPrice";

interface UseDebouncedPriceFiltersProps {
  initialMinPrice: string;
  initialMaxPrice: string;
  updateFilter: (key: PriceField, value: string) => void;
  debounceMs?: number;
}

interface DebouncedPriceFilters {
  localMin: string;
  localMax: string;
  handleMinPrice: (value: string) => void;
  handleMaxPrice: (value: string) => void;
}

const DEFAULT_DEBOUNCE_MS = 600;

/**
 * Keeps price inputs responsive while delaying filter updates until typing stops.
 * It also syncs the displayed values when the parent resets the filters.
 */
export default function useDebouncedPriceFilters({
  initialMinPrice,
  initialMaxPrice,
  updateFilter,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: Readonly<UseDebouncedPriceFiltersProps>): DebouncedPriceFilters {
  const [localMin, setLocalMin] = useState(initialMinPrice);
  const [localMax, setLocalMax] = useState(initialMaxPrice);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalMin(initialMinPrice);
  }, [initialMinPrice]);

  useEffect(() => {
    setLocalMax(initialMaxPrice);
  }, [initialMaxPrice]);

  useEffect(() => {
    const minTimerId = minTimer.current;
    const maxTimerId = maxTimer.current;

    return () => {
      if (minTimerId) clearTimeout(minTimerId);
      if (maxTimerId) clearTimeout(maxTimerId);
    };
  }, [localMin, localMax]);

  const scheduleUpdate = useCallback(
    (field: PriceField, value: string) => {
      const timer = field === "minPrice" ? minTimer : maxTimer;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        updateFilter(field, value);
        timer.current = null;
      }, debounceMs);
    },
    [debounceMs, updateFilter],
  );

  const handleMinPrice = useCallback(
    (value: string) => {
      setLocalMin(value);
      scheduleUpdate("minPrice", value);
    },
    [scheduleUpdate],
  );

  const handleMaxPrice = useCallback(
    (value: string) => {
      setLocalMax(value);
      scheduleUpdate("maxPrice", value);
    },
    [scheduleUpdate],
  );

  return {
    localMin,
    localMax,
    handleMinPrice,
    handleMaxPrice,
  };
}
