"use client";

import { useEffect, useState } from "react";

/** Seconds elapsed since `since` (ms epoch), ticking every second while `running`. */
export function useElapsed(since: number | null, running = true) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!since || !running) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [since, running]);
  return since && now ? Math.max(0, Math.floor((now - since) / 1000)) : 0;
}
