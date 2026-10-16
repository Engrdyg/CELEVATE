"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/store/progress";

const IDLE_MS = 2 * 60_000;
const TICK_MS = 15_000;

/**
 * Logs *active* study time: counted only while the tab is visible and the
 * learner interacted within the last two minutes.
 */
export function useStudyTimer(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let lastActivity = Date.now();
    const bump = () => (lastActivity = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActivity < IDLE_MS) {
        if (useProgress.getState().profile) useProgress.getState().addStudyTime(TICK_MS / 60_000);
      }
    }, TICK_MS);
    return () => {
      window.clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [enabled]);
}
