"use client";

import { create } from "zustand";

/** Transient (non-persisted) UI state. */
interface UIState {
  commandOpen: boolean;
  focusMode: boolean;
  setCommandOpen: (v: boolean) => void;
  setFocusMode: (v: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  commandOpen: false,
  focusMode: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setFocusMode: (focusMode) => set({ focusMode }),
}));
