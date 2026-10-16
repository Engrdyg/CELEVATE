"use client";

import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";

/** Restrained line illustrations per subject that draw themselves on first view. */
export function SubjectArt({ id, className }: { id: string; className?: string }) {
  const reduce = useReducedMotion();
  const p = (d: string, i: number, color = "var(--primary)", w = 1.5) => (
    <motion.path
      key={i}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={reduce ? { duration: 0 } : { duration: 1.6, ease: ease.outQuart, delay: 0.2 + i * 0.15 }}
    />
  );
  return (
    <svg viewBox="0 0 280 120" className={className ?? "h-28 w-full"} aria-hidden>
      {id === "mste" && (
        <>
          {p("M20 100 L90 52", 0, "var(--fg-subtle)", 1)}
          {p("M260 100 L190 52", 1, "var(--fg-subtle)", 1)}
          {p("M90 52 Q140 18 190 52", 2)}
          {p("M140 110 L90 52 M140 110 L190 52", 3, "var(--iris)", 1)}
          <circle cx="90" cy="52" r="3" fill="var(--primary)" />
          <circle cx="190" cy="52" r="3" fill="var(--primary)" />
          <text x="78" y="44" className="fill-[var(--fg-subtle)] font-mono text-[9px]">PC</text>
          <text x="186" y="44" className="fill-[var(--fg-subtle)] font-mono text-[9px]">PT</text>
          <text x="146" y="104" className="fill-[var(--fg-subtle)] font-mono text-[9px]">O · R</text>
        </>
      )}
      {id === "hge" && (
        <>
          {p("M20 34 H260", 0, "var(--primary)", 1)}
          {p("M20 34 C60 28 90 40 130 34 S200 28 260 34", 1, "var(--iris)", 1)}
          {p("M40 50 V104 H240 V50", 2, "var(--fg-subtle)", 1)}
          {[60, 80, 100].map((y, i) => p(`M50 ${y} H230`, 3 + i, "var(--primary)", 0.6))}
          {p("M140 50 L140 104 M140 104 L200 104", 6, "var(--primary)", 1.4)}
          <text x="208" y="98" className="fill-[var(--fg-subtle)] font-mono text-[9px]">γh</text>
          <text x="26" y="26" className="fill-[var(--fg-subtle)] font-mono text-[9px]">▽ WS</text>
        </>
      )}
      {id === "psad" && (
        <>
          {p("M30 60 H250", 0, "var(--primary)", 2)}
          {[50, 80, 110, 140, 170, 200, 230].map((x, i) => p(`M${x} 30 V52`, 1 + i * 0.2, "var(--iris)", 1))}
          {p("M40 30 H240", 2, "var(--iris)", 1)}
          {p("M30 60 L22 74 H38 Z M250 60 m0 8 a6 6 0 1 0 0.01 0", 3, "var(--fg-subtle)", 1)}
          {p("M30 90 Q140 130 250 90", 4, "var(--primary)", 1)}
          <text x="132" y="24" className="fill-[var(--fg-subtle)] font-mono text-[9px]">w</text>
          <text x="118" y="118" className="fill-[var(--fg-subtle)] font-mono text-[9px]">M = wL²/8</text>
        </>
      )}
    </svg>
  );
}

