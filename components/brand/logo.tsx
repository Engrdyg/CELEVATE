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

const LETTERS = "CELEVATE".split("");
/** C·E·L·E = CELE (letters 1–4); E·L·E·V·A·T·E = ELEVATE (letters 2–8). They share "ELE". */
const inCele = (i: number) => i <= 3;
const inElevate = (i: number) => i >= 1;
const GAP = "0.13em";
const RULE = "0.085em";

/**
 * CELEVATE wordmark that shows both words it is built from:
 * a primary rule under CELE (the exam) and a rising iris rule over ELEVATE (the promise).
 * `labels` adds small captions for larger lockups.
 */
export function Wordmark({ className, labels = false }: { className?: string; labels?: boolean }) {
  return (
    <span
      role="img"
      aria-label={labels ? "CELEVATE: CELE, the Civil Engineering Licensure Examination, plus ELEVATE" : "CELEVATE"}
      className={cn("relative inline-flex font-display leading-none font-bold text-fg", labels && "pt-[0.62em] pb-[0.62em]", className)}
    >
      {LETTERS.map((l, i) => {
        const layers: { image: string; size: string; pos: string }[] = [];
        if (inElevate(i)) layers.push({ image: "linear-gradient(var(--iris),var(--iris))", size: `100% ${RULE}`, pos: "left top" });
        if (inCele(i)) layers.push({ image: "linear-gradient(var(--primary),var(--primary))", size: i === 3 ? `calc(100% - ${GAP}) ${RULE}` : `100% ${RULE}`, pos: "left bottom" });
        return (
          <span
            key={i}
            aria-hidden
            className="relative py-[0.06em]"
            style={{
              paddingRight: i === LETTERS.length - 1 ? 0 : GAP,
              backgroundImage: layers.map((x) => x.image).join(","),
              backgroundSize: layers.map((x) => x.size).join(","),
              backgroundPosition: layers.map((x) => x.pos).join(","),
              backgroundRepeat: "no-repeat",
            }}
          >
            {l}
            {i === LETTERS.length - 1 && (
              // The ELEVATE rule turns upward at the end: an arrow rising off the last letter.
              <svg aria-hidden viewBox="0 0 10 10" className="absolute top-[-0.3em] left-[calc(100%-0.04em)] size-[0.38em] overflow-visible" fill="none">
                <path d="M0 9.2 L8.6 1 M3.4 0.9 H8.9 V6.4" stroke="var(--iris)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </span>
        );
      })}
      {labels && (
        <>
          <span aria-hidden className="absolute top-0 right-0 font-mono text-[0.26em] font-semibold tracking-[0.2em] text-iris-text">
            ELEVATE
          </span>
          <span aria-hidden className="absolute bottom-0 left-0 font-mono text-[0.26em] font-semibold tracking-[0.2em] text-primary-text">
            CELE
          </span>
        </>
      )}
    </span>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && <Wordmark className="text-[16px]" />}
    </span>
  );
}
