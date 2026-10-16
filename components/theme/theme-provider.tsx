"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export type ThemePreference = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: Resolved;
  setTheme: (t: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (e: StorageEvent) => e.key === THEME_KEY && cb();
  mq.addEventListener("change", cb);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
    window.removeEventListener("storage", onStorage);
  };
}
function readPref(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}
function readSystem(): Resolved {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: Resolved, animate: boolean) {
  const root = document.documentElement;
  const reduce =
    root.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduce) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 320);
  }
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<ThemePreference>(subscribe, readPref, () => "system");
  const system = useSyncExternalStore<Resolved>(subscribe, readSystem, () => "dark");
  const resolvedTheme: Resolved = theme === "system" ? system : theme;

  // Keep <html> in sync when the OS preference changes or another tab updates the theme.
  useEffect(() => {
    if (!document.documentElement.classList.contains(resolvedTheme)) applyTheme(resolvedTheme, true);
  }, [resolvedTheme]);

  const setTheme = useCallback((t: ThemePreference) => {
    try {
      if (t === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, t);
    } catch {}
    applyTheme(t === "system" ? readSystem() : t, true);
    emit();
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
