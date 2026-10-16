"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { ease } from "@/lib/motion";

/** Fade-and-rise when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: ease.outExpo, delay }}
    >
      {children}
    </Comp>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.outExpo } },
};

export function Stagger({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ul" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp className={className} variants={container} initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={staggerItem}>
      {children}
    </Comp>
  );
}
