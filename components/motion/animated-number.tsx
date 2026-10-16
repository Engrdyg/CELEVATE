"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up to `value` once visible. Renders the final value for SSR/no-JS/reduced motion. */
export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
  duration = 1.2,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const fmt = (n: number) =>
    prefix + n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) {
      if (el) el.textContent = fmt(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {fmt(value)}
    </span>
  );
}
