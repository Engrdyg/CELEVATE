"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, CheckCircle2, ChevronDown, Flame, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tex } from "@/components/math/tex";
import { ease } from "@/lib/motion";
import { BlueprintField, StructuralLines } from "./blueprint-backdrop";
import { ProductPreview } from "./product-preview";
import { SampleChip } from "./section-heading";
import { useParallaxFactor } from "./use-parallax";

/** Same initial/animate props on server and client; reduced motion only zeroes the duration. */
const intro = (delay: number, reduce: boolean | null) => ({
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: reduce ? { duration: 0 } : { duration: 0.9, ease: ease.outExpo, delay },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const f = useParallaxFactor();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const { scrollYProgress: previewProgress } = useScroll({ target: previewRef, offset: ["start end", "center center"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const smoothPreview = useSpring(previewProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Layered parallax: background slowest, foreground cards fastest — restrained travel.
  const gridY = useTransform(smooth, [0, 1], [0, 140 * f]);
  const linesY = useTransform(smooth, [0, 1], [0, 220 * f]);
  const copyY = useTransform(smooth, [0, 1], [0, -60 * f]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.45], [1, f ? 0 : 1]);
  const rotateX = useTransform(smoothPreview, [0, 1], [f ? 22 : 0, 0]);
  const previewScale = useTransform(smoothPreview, [0, 1], [f ? 0.92 : 1, 1]);
  const previewY = useTransform(smoothPreview, [0, 1], [60 * f, 0]);
  const cardLeftY = useTransform(smooth, [0, 1], [0, -180 * f]);
  const cardRightY = useTransform(smooth, [0, 1], [0, -120 * f]);
  const cardBottomY = useTransform(smooth, [0, 1], [0, -240 * f]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 sm:pt-36" aria-labelledby="hero-title">
      <BlueprintField y={gridY} className="absolute inset-x-0 -top-24 -z-10 h-[1200px]" />
      <motion.div style={{ y: linesY }} className="pointer-events-none absolute inset-x-0 top-28 -z-10 hidden justify-center md:flex">
        <StructuralLines className="w-[min(1280px,115vw)] opacity-60 [mask-image:linear-gradient(90deg,#000_0%,#000_14%,transparent_30%,transparent_70%,#000_86%,#000_100%)]" />
      </motion.div>

      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative mx-auto max-w-page px-4 text-center sm:px-6 lg:px-8">
        <motion.div {...intro(0.05, reduce)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pr-3 pl-1 text-[12px] font-medium text-muted shadow-elev-1 backdrop-blur">
            <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] tracking-wider text-primary-text uppercase">CELE</span>
            Built for the Philippine Civil Engineering Licensure Exam
          </span>
        </motion.div>

        <motion.h1
          id="hero-title"
          {...intro(0.15, reduce)}
          className="mx-auto mt-7 max-w-4xl font-display text-display-2xl font-semibold text-fg"
        >
          Engineer Your <span className="text-gradient">Future.</span>
        </motion.h1>
        <motion.p {...intro(0.25, reduce)} className="mt-5 font-display text-lg font-medium tracking-tight text-fg/85 sm:text-xl">
          Elevate Your Knowledge. Earn Your License.
        </motion.p>
        <motion.p {...intro(0.32, reduce)} className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-muted sm:text-base">
          Your smarter path to the Civil Engineering Licensure Examination. Master engineering concepts, solve practice
          problems, take mock board exams, and track your progress — all in one powerful learning platform.
        </motion.p>

        <motion.div {...intro(0.4, reduce)} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/onboarding">
              Start Reviewing <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <a href="#features">
              Explore Features <ChevronDown />
            </a>
          </Button>
        </motion.div>

        <motion.ul {...intro(0.48, reduce)} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted">
          {["All three CELE subject areas", "Step-by-step worked solutions", "Timed mock board exams"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" aria-hidden /> {t}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Floating product preview */}
      <div ref={previewRef} className="relative mx-auto mt-16 max-w-[1180px] px-4 pb-20 sm:mt-20 sm:px-6 lg:px-8" style={{ perspective: 1800 }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: ease.outExpo, delay: 0.55 }}
        >
          <motion.div style={{ rotateX, scale: previewScale, y: previewY, transformOrigin: "50% 0%" }} className="relative">
            <div aria-hidden className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[32px] bg-[radial-gradient(60%_50%_at_50%_0%,var(--glow-primary),transparent)]" />
            <div className="rounded-[20px] border border-line bg-surface/50 p-1.5 shadow-elev-4 backdrop-blur-sm sm:p-2">
              <ProductPreview />
            </div>
            <SampleChip className="absolute -top-3 right-4 sm:right-6">Product preview · sample data</SampleChip>
          </motion.div>
        </motion.div>

        {/* Floating technical panels */}
        <motion.div style={{ y: cardLeftY }} className="pointer-events-none absolute top-[18%] -left-2 hidden w-60 lg:block xl:-left-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: ease.outExpo, delay: 1.1 }}
            className="rounded-xl border border-line bg-surface/95 p-4 shadow-elev-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
              <span className="grid size-5 place-items-center rounded bg-primary-soft text-primary-text">
                <Sigma className="size-3" />
              </span>
              Formula · Simple curves
            </div>
            <div className="mt-3 text-fg">
              <Tex display tex={String.raw`T = R\tan\frac{I}{2}`} />
            </div>
            <div className="mt-1 font-mono text-[10px] text-faint">L = πRI / 180°</div>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: cardRightY }} className="pointer-events-none absolute top-[8%] -right-2 hidden w-56 lg:block xl:-right-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: ease.outExpo, delay: 1.25 }}
            className="rounded-xl border border-line bg-surface/95 p-4 shadow-elev-3 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-muted">
              Hydraulics · Ch. 2 <span className="font-mono text-primary-text">68%</span>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-subtle">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-iris"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: 1.4, ease: ease.outExpo, delay: 1.5 }}
              />
            </div>
            <div className="mt-3 text-[12px] font-medium text-fg">Energy equation &amp; head loss</div>
            <div className="text-[11px] text-muted">3 of 5 sections complete</div>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: cardBottomY }} className="pointer-events-none absolute right-[14%] bottom-6 hidden lg:block">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: ease.outExpo, delay: 1.4 }}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface/95 py-2.5 pr-4 pl-2.5 shadow-elev-3 backdrop-blur-md"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-warning-soft text-warning">
              <Flame className="size-4" />
            </span>
            <div>
              <div className="text-[12px] font-semibold">12-day streak</div>
              <div className="text-[11px] text-muted">45 min goal reached today</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
