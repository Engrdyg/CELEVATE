"use client";

import { useEffect, useState } from "react";

/**
 * Seconds elapsed since `resetKey` last changed, ticking every second while
 * `running`. The clock restarts whenever the key changes.
 */
export function useElapsed(resetKey: string, running = true) {
  const [state, setState] = useState({ key: resetKey, seconds: 0 });
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const tick = () => setState({ key: resetKey, seconds: Math.floor((Date.now() - start) / 1000) });
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [resetKey, running]);
  return state.key === resetKey ? state.seconds : 0;
}
