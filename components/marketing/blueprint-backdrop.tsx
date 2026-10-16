"use client";

import { motion, useReducedMotion, type MotionValue } from "motion/react";
import { ease } from "@/lib/motion";

/** Structural drafting lines: a Pratt-truss elevation that draws itself, with dimension marks. */
export function StructuralLines({ className, delay = 0.3 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const draw = (i: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: reduce ? { duration: 0 } : { duration: 1.8, ease: ease.outQuart, delay: delay + i * 0.12 },
  });
  const panels = 8;
  const w = 720;
  const h = 150;
  const x0 = 40;
  const y0 = 60;
  const step = w / panels;
  const top = Array.from({ length: panels + 1 }, (_, i) => [x0 + i * step, y0] as const);
  const bot = Array.from({ length: panels + 1 }, (_, i) => [x0 + i * step, y0 + h] as const);
  const webs = Array.from({ length: panels }, (_, i) => {
    const mid = panels / 2;
    const [a, b] = i < mid ? [bot[i], top[i + 1]] : [top[i], bot[i + 1]];
    return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  });
  const verticals = top.map((t, i) => `M${t[0]} ${t[1]} L${bot[i][0]} ${bot[i][1]}`);

  return (
    <svg viewBox="0 0 800 300" className={className} fill="none" aria-hidden>
      <g stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
        <motion.path d={`M${top[0][0]} ${y0} L${top[panels][0]} ${y0}`} {...draw(0)} />
        <motion.path d={`M${bot[0][0]} ${y0 + h} L${bot[panels][0]} ${y0 + h}`} {...draw(1)} />
      </g>
      <g stroke="var(--primary)" strokeWidth="0.9" opacity="0.35">
        {verticals.map((d, i) => (
          <motion.path key={`v${i}`} d={d} {...draw(2 + i * 0.3)} />
        ))}
        {webs.map((d, i) => (
          <motion.path key={`w${i}`} d={d} stroke="var(--iris)" {...draw(3 + i * 0.3)} />
        ))}
      </g>
      {/* nodes */}
      <g>
        {[...top, ...bot].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2.6"
            fill="var(--canvas)"
            stroke="var(--primary)"
            strokeWidth="1.2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={reduce ? { duration: 0 } : { delay: delay + 1 + i * 0.03, duration: 0.4, ease: ease.outExpo }}
          />
        ))}
      </g>
      {/* supports */}
      <g stroke="var(--fg-subtle)" strokeWidth="1" opacity="0.6">
        <path d={`M${x0 - 10} ${y0 + h + 14} L${x0} ${y0 + h} L${x0 + 10} ${y0 + h + 14} Z`} />
        <circle cx={x0 + w} cy={y0 + h + 7} r="6" />
        <path d={`M${x0 - 16} ${y0 + h + 18} H${x0 + 16} M${x0 + w - 16} ${y0 + h + 18} H${x0 + w + 16}`} />
      </g>
      {/* dimension line */}
      <motion.g stroke="var(--fg-subtle)" strokeWidth="0.8" opacity="0.7" {...draw(6)}>
        <path d={`M${x0} ${y0 + h + 44} H${x0 + w} M${x0} ${y0 + h + 38} V${y0 + h + 50} M${x0 + w} ${y0 + h + 38} V${y0 + h + 50}`} />
      </motion.g>
      <text x={x0 + w / 2} y={y0 + h + 40} textAnchor="middle" className="fill-[var(--fg-subtle)] font-mono text-[10px]">
        L = 8 @ 6.00 m = 48.00 m
      </text>
      <text x={x0} y={y0 - 14} className="fill-[var(--fg-subtle)] font-mono text-[9px]">
        PRATT TRUSS — ELEVATION
      </text>
    </svg>
  );
}

/** Animated coordinate grid with soft accent lighting. */
export function BlueprintField({ y, className }: { y?: MotionValue<number>; className?: string }) {
  return (
    <motion.div aria-hidden className={className} style={{ y }}>
      <div className="absolute inset-0 blueprint-grid mask-fade-edges opacity-90 motion-safe:animate-[grid-drift_40s_linear_infinite]" />
      <div className="absolute top-[8%] left-1/2 h-[520px] w-[min(1100px,95vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow-primary),transparent)] blur-2xl" />
      <div className="absolute top-[30%] left-[62%] h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow-iris),transparent)] blur-2xl" />
    </motion.div>
  );
}
