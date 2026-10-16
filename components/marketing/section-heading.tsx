import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Eyebrow({ index, children, className }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.18em] text-primary-text uppercase", className)}>
      {index && <span className="text-faint">{index}</span>}
      {index && <span aria-hidden className="h-px w-5 bg-line-strong" />}
      {children}
    </p>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow index={index} className={align === "center" ? "justify-center" : undefined}>
        {eyebrow}
      </Eyebrow>
      <h2 className="mt-4 font-display text-display-xl font-semibold text-fg">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted sm:text-[17px]">{description}</p>}
    </Reveal>
  );
}

export function SampleChip({ className, children = "Sample data" }: { className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-muted uppercase backdrop-blur", className)}>
      <span className="size-1.5 rounded-full bg-warning" aria-hidden />
      {children}
    </span>
  );
}
