import { cn } from "@/lib/utils";

/** CELEVATE mark: an ascending truss — structural nodes rising into an elevation chevron. */
export function LogoMark({ className, title = "CELEVATE" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} role="img" aria-label={title}>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="var(--card)" stroke="var(--line-strong)" strokeWidth="1" />
      <path d="M6.5 23.5 L16 8.5 L25.5 23.5" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.2 23.5 L16 15.4 L20.8 23.5 M6.5 23.5 H25.5" fill="none" stroke="var(--iris)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <circle cx="16" cy="8.5" r="1.9" fill="var(--primary)" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[15px] font-bold tracking-[0.14em] text-fg">
          CELEVATE
        </span>
      )}
    </span>
  );
}
