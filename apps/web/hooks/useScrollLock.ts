"use client";

import { useEffect, useCallback } from "react";

// Cache scrollbar width outside the hook so we only calculate it once per session
let cachedScrollbarWidth: number | null = null;

const getScrollbarWidth = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  if (cachedScrollbarWidth !== null) return cachedScrollbarWidth;

  cachedScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  return cachedScrollbarWidth;
};

/**
 * useScrollLock Hook
 * * Purpose: Manages body scroll locking with scrollbar width compensation.
 * * Optimization: Caches width to prevent synchronous layout thrashing during rapid toggles.
 */
export const useScrollLock = (lock: boolean) => {
  const toggleLock = useCallback((shouldLock: boolean) => {
    if (typeof document === "undefined") return;

    const body = document.body;
    const scrollbarWidth = getScrollbarWidth();

    if (shouldLock) {
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      body.style.overflow = "";
      body.style.paddingRight = "";
    }
  }, []);

  useEffect(() => {
    toggleLock(lock);
    return () => toggleLock(false);
  }, [lock, toggleLock]);

  return { toggleLock };
};
