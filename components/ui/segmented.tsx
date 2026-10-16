"use client";

import { ToggleGroup } from "radix-ui";
import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

/** Single-select segmented control (accessible radio-like toggle group). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentOption<T>[];
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className={cn("inline-flex items-center gap-0.5 rounded-lg border border-line bg-subtle/70 p-0.5", className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            "relative inline-flex items-center justify-center gap-1.5 rounded-md font-medium text-muted transition-colors hover:text-fg data-[state=on]:text-fg [&_svg]:size-4",
            size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-md border border-line bg-surface shadow-elev-1" transition={spring.snappy} />
          )}
          <span className="relative z-10 inline-flex items-center gap-1.5">
            {o.icon}
            {o.label}
          </span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
