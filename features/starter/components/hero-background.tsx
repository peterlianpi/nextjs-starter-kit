"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Client-only lazy loader for the Three.js hero background.
 * - `ssr: false` keeps three (~150KB gz) out of the server bundle and only
 *   downloads it after hydration on capable clients.
 * - Skips entirely for prefers-reduced-motion users (static gradient stays).
 */
const ThreeScene = dynamic(() => import("./three-scene"), {
  ssr: false,
  loading: () => null,
});

const motionQuery = "(prefers-reduced-motion: reduce)";

export function HeroBackground() {
  // Subscribe to the reduced-motion media query without setState-in-effect.
  const subscribe = useCallback((onChange: () => void) => {
    const mql = window.matchMedia(motionQuery);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const reduceMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(motionQuery).matches,
    () => false
  );

  const enabled = !reduceMotion;

  // Static token gradient is always present as the base layer / fallback.
  return useMemo(
    () => (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        {enabled ? <ThreeScene /> : null}
      </div>
    ),
    [enabled]
  );
}
