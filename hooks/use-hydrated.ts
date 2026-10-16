"use client";

import { useHydrated } from "@/lib/store/progress";

/** True once persisted stores have been read from localStorage. */
export function useStoreReady() {
  return useHydrated((s) => s.hydrated);
}
