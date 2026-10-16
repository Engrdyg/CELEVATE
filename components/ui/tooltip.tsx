"use client";

import { Tooltip as T } from "radix-ui";
import { cn } from "@/lib/utils";

export const TooltipProvider = T.Provider;

export function Tooltip({
  content,
  children,
  side = "top",
  disabled,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
  className?: string;
}) {
  if (disabled) return <>{children}</>;
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-[60] max-w-64 rounded-md border border-line bg-fg px-2 py-1 text-xs font-medium text-canvas shadow-elev-2 data-[state=closed]:animate-pop-out data-[state=delayed-open]:animate-pop-in",
            className,
          )}
        >
          {content}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
