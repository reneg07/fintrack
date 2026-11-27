"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a rapidly changing value (such as search input text) using useState + useEffect
 * with proper timer cleanup to prevent excessive API requests.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
