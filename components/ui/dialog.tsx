"use client";

import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

const overlayClass =
  "fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out";

export function DialogContent({
  className,
  children,
  hideClose,
  ...props
}: React.ComponentProps<typeof D.Content> & { hideClose?: boolean }) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-elev-4 outline-none",
          "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
          className,
        )}
        style={{ transform: "translate(-50%, -50%)" }}
        {...props}
      >
        {children}
        {!hideClose && (
          <D.Close
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-fg"
            aria-label="Close"
          >
            <X className="size-4" />
          </D.Close>
        )}
      </D.Content>
    </D.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5 pr-8", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: React.ComponentProps<typeof D.Title>) {
  return <D.Title className={cn("font-display text-lg font-semibold tracking-tight", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: React.ComponentProps<typeof D.Description>) {
  return <D.Description className={cn("text-sm leading-6 text-muted", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

const sideClass = {
  left: "inset-y-0 left-0 h-full w-[min(20rem,88vw)] border-r data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left",
  right: "inset-y-0 right-0 h-full w-[min(26rem,92vw)] border-l data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right",
  bottom:
    "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom",
} as const;

/** Drawer / sheet built on Dialog. */
export function SheetContent({
  side = "right",
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof D.Content> & { side?: keyof typeof sideClass; title: string; description?: string }) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn("fixed z-50 flex flex-col border-line bg-surface shadow-elev-4 outline-none", sideClass[side], className)}
        {...props}
      >
        {side === "bottom" && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" />}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <D.Title className="font-display text-base font-semibold tracking-tight">{title}</D.Title>
            {description ? (
              <D.Description className="mt-0.5 text-xs text-muted">{description}</D.Description>
            ) : (
              <D.Description className="sr-only">{title}</D.Description>
            )}
          </div>
          <D.Close className="grid size-8 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg" aria-label="Close">
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
