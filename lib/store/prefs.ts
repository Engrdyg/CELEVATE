"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPref = "system" | "reduced" | "full";

interface PrefsState {
  motion: MotionPref;
  /** Lesson reader text scale. */
  readerScale: number;
  sidebarCollapsed: boolean;
  showExamTimer: boolean;
  setMotion: (m: MotionPref) => void;
  setReaderScale: (n: number) => void;
  toggleSidebar: () => void;
  setShowExamTimer: (v: boolean) => void;
}

export const PREFS_KEY = "celevate-prefs";

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      motion: "system",
      readerScale: 1,
      sidebarCollapsed: false,
      showExamTimer: true,
      setMotion: (motion) => {
        if (typeof document !== "undefined") {
          if (motion === "reduced") document.documentElement.dataset.motion = "reduced";
          else delete document.documentElement.dataset.motion;
        }
        set({ motion });
      },
      setReaderScale: (readerScale) => set({ readerScale: Math.min(1.3, Math.max(0.9, readerScale)) }),
      toggleSidebar: () =>
        set((s) => {
          const sidebarCollapsed = !s.sidebarCollapsed;
          if (typeof document !== "undefined") {
            if (sidebarCollapsed) document.documentElement.dataset.sidebar = "collapsed";
            else delete document.documentElement.dataset.sidebar;
          }
          return { sidebarCollapsed };
        }),
      setShowExamTimer: (showExamTimer) => set({ showExamTimer }),
    }),
    { name: PREFS_KEY, skipHydration: true, version: 1 },
  ),
);
