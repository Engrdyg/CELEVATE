"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = "var(--primary)",
  track = "var(--subtle)",
  className,
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(v)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (v / 100) * c }}
          animate={reduce ? { strokeDashoffset: c - (v / 100) * c } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: ease.outExpo }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}
