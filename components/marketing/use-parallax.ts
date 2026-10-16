"use client";

import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Parallax is disabled for reduced motion, data-saver, low-core devices; scaled down on small screens. */
export function useParallaxFactor() {
  const reduce = useReducedMotion();
  const factor = useSyncExternalStore(
    subscribe,
    () => {
      const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
      if (nav.connection?.saveData) return 0;
      if ((navigator.hardwareConcurrency ?? 8) <= 2) return 0;
      return window.matchMedia("(min-width: 768px)").matches ? 1 : 0.4;
    },
    () => 1,
  );
  return reduce ? 0 : factor;
}
