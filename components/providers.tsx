"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePrefs } from "@/lib/store/prefs";
import { useHydrated, useProgress } from "@/lib/store/progress";

function StoreHydration() {
  useEffect(() => {
    Promise.all([usePrefs.persist.rehydrate(), useProgress.persist.rehydrate()]).finally(() => useHydrated.getState().set());
  }, []);
  return null;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme}
      position="bottom-right"
      offset={20}
      mobileOffset={{ bottom: 84 }}
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !border-line !bg-surface !text-fg !shadow-elev-3 !font-sans",
          description: "!text-muted",
          actionButton: "!bg-primary-strong !text-primary-fg",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const motion = usePrefs((s) => s.motion);
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion={motion === "reduced" ? "always" : motion === "full" ? "never" : "user"}>
        <TooltipProvider delayDuration={300} skipDelayDuration={150}>
          <StoreHydration />
          {children}
          <ThemedToaster />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
