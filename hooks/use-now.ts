"use client";

import { useEffect, useState } from "react";

/** Current time (ms), updated every `interval` ms. Null until mounted (avoids SSR clock reads). */
export function useNow(interval = 1000, enabled = true) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, interval);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [interval, enabled]);
  return now;
}
