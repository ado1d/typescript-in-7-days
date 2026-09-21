"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hydration-safe client detection.
 * Returns false during SSR and the hydration render, true afterwards.
 * (Canonical replacement for the useState+useEffect "mounted" pattern.)
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
