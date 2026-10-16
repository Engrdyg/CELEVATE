import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface px-1 font-mono text-[10px] font-medium text-muted shadow-[0_1px_0_var(--line-strong)]",
        className,
      )}
      {...props}
    />
  );
}
