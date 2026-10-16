"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

const tones = {
  primary: "bg-primary",
  iris: "bg-iris",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  gradient: "bg-gradient-to-r from-primary to-iris",
} as const;

export function ProgressBar({
  value,
  tone = "primary",
  className,
  label,
  size = "md",
}: {
  value: number;
  tone?: keyof typeof tones;
  className?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cn("relative w-full overflow-hidden rounded-full bg-subtle", size === "sm" ? "h-1" : "h-1.5", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", tones[tone])}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${v}%` }}
        animate={reduce ? { width: `${v}%` } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: ease.outExpo }}
      />
    </div>
  );
}
