import { AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      <div className="relative mb-4 grid size-12 place-items-center rounded-xl border border-line bg-subtle text-muted">
        <div aria-hidden className="absolute -inset-6 -z-10 blueprint-grid-fine opacity-70 mask-fade-edges" />
        <Icon className="size-5" />
      </div>
      <p className="font-display text-[15px] font-semibold text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-danger-soft text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <p className="font-display text-[15px] font-semibold">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusDot({ tone = "primary", pulse, className }: { tone?: "primary" | "success" | "warning" | "danger" | "muted"; pulse?: boolean; className?: string }) {
  const color = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-faint",
  }[tone];
  return (
    <span className={cn("relative inline-flex size-2", className)} aria-hidden>
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-50", color)} />}
      <span className={cn("relative inline-flex size-2 rounded-full", color)} />
    </span>
  );
}
