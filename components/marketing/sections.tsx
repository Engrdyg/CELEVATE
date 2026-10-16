"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Bot,
  ClipboardCheck,
  Command,
  Crosshair,
  Eye,
  Layers3,
  ListChecks,
  Sigma,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tex } from "@/components/math/tex";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Logo } from "@/components/brand/logo";
import { subjects } from "@/lib/content";
import { CELE_RULES } from "@/config/cele";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Eyebrow, SectionHeading } from "./section-heading";
import { useParallaxFactor } from "./use-parallax";

/* ------------------------------------------------------------------ */
/*  02 — Product introduction                                          */
/* ------------------------------------------------------------------ */

export function Introduction() {
  const pillars = [
    {
      icon: BookOpenText,
      title: "Learn with structure",
      text: "Syllabus-aligned chapters, readable lessons, rendered formulas and worked examples that show every step.",
    },
    {
      icon: Crosshair,
      title: "Practice with intent",
      text: "Problems that explain why an answer is right, which formula applies, and where reviewees commonly slip.",
    },
    {
      icon: ClipboardCheck,
      title: "Prove it under time",
      text: "Timed mock board exams with a question palette, review flags and a full breakdown when you submit.",
    },
  ];
  return (
    <section className="relative border-y border-line bg-surface/40 py-24 sm:py-32" aria-labelledby="intro-title">
      <div className="mx-auto grid max-w-page gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8">
        <Reveal>
          <Eyebrow index="01">The platform</Eyebrow>
          <h2 id="intro-title" className="mt-4 font-display text-display-xl font-semibold">
            One focused place to prepare for the board.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-[17px]">
            CELEVATE replaces scattered notes, photocopied problem sets and guesswork with a single, calm workspace.
            Everything you study feeds your progress picture, so you always know what to review next.
          </p>
          <p className="mt-6 max-w-xl rounded-lg border border-line bg-card/60 px-4 py-3 text-[13px] leading-6 text-muted">
            CELEVATE is an independent review platform. It is not affiliated with, or endorsed by, the Professional
            Regulation Commission (PRC) or the Board of Civil Engineering.
          </p>
        </Reveal>
        <Stagger className="grid gap-4">
          {pillars.map(({ icon: Icon, title, text }, i) => (
            <StaggerItem key={title}>
              <div className="group surface-card flex gap-5 rounded-xl p-5 transition-[border-color,transform] duration-200 hover:border-line-strong sm:p-6">
                <div className="relative grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-subtle text-primary-text">
                  <Icon className="size-5" />
                  <span className="absolute -top-2 -right-2 font-mono text-[10px] text-faint">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-display text-[17px] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-muted">{text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  03 — Feature highlights (bento)                                    */
/* ------------------------------------------------------------------ */

function FeatureCard({
  icon: Icon,
  title,
  text,
  className,
  children,
}: {
  icon: typeof Sigma;
  title: string;
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <StaggerItem className={cn("h-full", className)}>
      <div className="group surface-card relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-elev-3">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-[radial-gradient(closest-side,var(--glow-primary),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary-text">
          <Icon className="size-[18px]" />
        </div>
        <h3 className="mt-4 font-display text-[17px] font-semibold">{title}</h3>
        <p className="mt-1.5 text-[14px] leading-6 text-muted">{text}</p>
        {children && <div className="mt-6 flex-1">{children}</div>}
      </div>
    </StaggerItem>
  );
}

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-24 sm:py-32" aria-labelledby="features-title">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="02"
          eyebrow="Features"
          title={<span id="features-title">Everything a reviewee needs. Nothing that distracts.</span>}
          description="Built around how civil engineering is actually studied: concepts, formulas, solved problems and timed practice."
        />
        <Stagger className="mt-14 grid gap-4 md:grid-cols-6">
          <FeatureCard
            icon={Sigma}
            title="Mathematics that reads beautifully"
            text="Every formula is typeset properly — fractions, roots, subscripts and Greek letters exactly as you'd write them."
            className="md:col-span-4"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                String.raw`\sigma = \frac{P}{A}`,
                String.raw`h_L = f\frac{L}{D}\frac{v^2}{2g}`,
                String.raw`M_u = \phi A_s f_y\left(d - \tfrac{a}{2}\right)`,
              ].map((t) => (
                <div key={t} className="flex min-h-20 items-center justify-center rounded-xl border border-line bg-subtle/60 px-3 py-4 text-fg">
                  <Tex tex={t} display />
                </div>
              ))}
            </div>
          </FeatureCard>
          <FeatureCard
            icon={ListChecks}
            title="Solutions, step by step"
            text="Correct answer, method, formula used and common errors — after every practice problem."
            className="md:col-span-2"
          >
            <ol className="space-y-2 text-[13px]">
              {["Identify givens", "Select the governing formula", "Substitute with units", "Check the result"].map((s, i) => (
                <li key={s} className="flex items-center gap-2.5 text-muted">
                  <span className="grid size-5 place-items-center rounded-full border border-line font-mono text-[10px] text-primary-text">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </FeatureCard>
          <FeatureCard icon={Target} title="Practice & exam modes" text="Instant feedback while learning. Strict, answer-hidden rules during exams." className="md:col-span-2" />
          <FeatureCard icon={Command} title="Command search" text="Press ⌘K / Ctrl K to jump to any lesson, formula or tool in a keystroke." className="md:col-span-2" />
          <FeatureCard icon={Eye} title="Focus mode" text="Hide navigation and study in a quiet, single-column reader with adjustable text size." className="md:col-span-2" />
          <FeatureCard icon={Layers3} title="Formula library" text="A searchable, categorized reference with variables and units explained." className="md:col-span-3" />
          <FeatureCard icon={Bot} title="CELEVATE AI (integration-ready)" text="A tutoring workspace designed for step-by-step explanations. Clearly labeled whenever responses are AI-generated." className="md:col-span-3" />
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  04 — Three CELE subject areas                                      */
/* ------------------------------------------------------------------ */

function SubjectArt({ id }: { id: string }) {
  const reduce = useReducedMotion();
  const p = (d: string, i: number, color = "var(--primary)", w = 1.5) => (
    <motion.path
      key={i}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      initial={reduce ? false : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, ease: ease.outQuart, delay: 0.2 + i * 0.15 }}
    />
  );
  return (
    <svg viewBox="0 0 280 120" className="h-28 w-full" aria-hidden>
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

export function SubjectsSection() {
  return (
    <section id="subjects" className="relative scroll-mt-20 border-y border-line bg-surface/40 py-24 sm:py-32" aria-labelledby="subjects-title">
      <div aria-hidden className="absolute inset-0 -z-10 blueprint-grid-fine opacity-50 mask-fade-b" />
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="03"
          eyebrow="CELE subject areas"
          title={<span id="subjects-title">Three subjects. One clear syllabus map.</span>}
          description="Content is organized around the three CELE subject areas. Labels and weights are configurable so they can follow the applicable PRC syllabus."
        />
        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3">
          {subjects.map((s) => (
            <StaggerItem key={s.id}>
              <Link
                href={`/subjects/${s.id}`}
                className="group surface-card flex h-full flex-col rounded-2xl p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-elev-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-line bg-subtle px-2 py-1 font-mono text-[11px] font-semibold tracking-wider text-primary-text">{s.code}</span>
                  <span className="font-mono text-[11px] text-faint">{Math.round(s.weight * 100)}% weight*</span>
                </div>
                <div className="mt-4 rounded-xl border border-line bg-canvas/60 px-2">
                  <SubjectArt id={s.id} />
                </div>
                <h3 className="mt-5 font-display text-lg leading-snug font-semibold">{s.name}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-6 text-muted">{s.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[13px]">
                  <span className="text-muted">
                    {s.chapters.length} chapters · {s.questionCount} practice items
                  </span>
                  <ArrowRight className="size-4 text-primary-text transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 text-xs text-faint">* Commonly cited subject weights. {CELE_RULES.note}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  09 — How it works (scroll-linked drawing line)                     */
/* ------------------------------------------------------------------ */

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const steps = [
    { t: "Set your target", d: "Tell CELEVATE your intended exam, daily study goal and the subjects you want to prioritize." },
    { t: "Study the concepts", d: "Work through structured lessons with formulas, diagrams and worked examples." },
    { t: "Practice deliberately", d: "Solve problems with instant, step-by-step feedback and save what you want to revisit." },
    { t: "Simulate the board", d: "Take timed mock exams, then let your results decide what to review next." },
  ];
  return (
    <section id="how-it-works" className="relative scroll-mt-20 py-24 sm:py-32" aria-labelledby="how-title">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionHeading index="08" eyebrow="How CELEVATE works" title={<span id="how-title">From first lesson to exam day.</span>} align="center" />
        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          <div aria-hidden className="absolute top-2 bottom-2 left-[19px] w-px bg-line sm:left-1/2" />
          <motion.div aria-hidden style={{ scaleY: progress }} className="absolute top-2 bottom-2 left-[19px] w-px origin-top bg-gradient-to-b from-primary to-iris sm:left-1/2" />
          <ol className="space-y-12">
            {steps.map((s, i) => (
              <li key={s.t} className={cn("relative grid items-start gap-4 pl-14 sm:grid-cols-2 sm:gap-16 sm:pl-0", i % 2 && "sm:[&>div]:col-start-2")}>
                <span className="absolute top-0 left-0 grid size-10 place-items-center rounded-full border border-line-strong bg-canvas font-mono text-[13px] font-semibold text-primary-text shadow-elev-1 sm:left-1/2 sm:-translate-x-1/2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Reveal className={cn("sm:pt-1", i % 2 ? "sm:pl-2" : "sm:pr-2 sm:text-right")}>
                  <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-muted">{s.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  10 — Final CTA                                                     */
/* ------------------------------------------------------------------ */

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const f = useParallaxFactor();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40 * f, 40 * f]);
  return (
    <section ref={ref} className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8" aria-labelledby="cta-title">
      <Reveal className="relative mx-auto max-w-page overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-elev-3 sm:px-12 sm:py-24">
        <motion.div aria-hidden style={{ y }} className="absolute -inset-20 -z-0 blueprint-grid opacity-80 mask-fade-edges" />
        <div aria-hidden className="absolute top-0 left-1/2 h-64 w-[80%] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--glow-primary),transparent)]" />
        <div className="relative">
          <Eyebrow className="justify-center">Begin today</Eyebrow>
          <h2 id="cta-title" className="mx-auto mt-4 max-w-2xl font-display text-display-xl font-semibold">
            Your license is built one session at a time.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            Set up your review plan in under a minute. Your progress is saved in this browser — no account required to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/onboarding">
                Start Reviewing <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/subjects">Browse subjects</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  11 — Footer                                                        */
/* ------------------------------------------------------------------ */

export function SiteFooter() {
  const cols = [
    { h: "Study", links: [["Subjects", "/subjects"], ["Practice questions", "/practice"], ["Mock board exams", "/exams"], ["Formula library", "/formulas"]] },
    { h: "Your review", links: [["Dashboard", "/dashboard"], ["My progress", "/progress"], ["Achievements", "/achievements"], ["Settings", "/settings"]] },
    { h: "Platform", links: [["Features", "/#features"], ["How it works", "/#how-it-works"], ["CELEVATE AI", "/tutor"]] },
  ];
  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[13px] leading-6 text-muted">Elevate Your Knowledge. Earn Your License.</p>
          <p className="mt-4 max-w-xs text-xs leading-5 text-faint">
            An independent review platform for aspiring Filipino civil engineers. Not affiliated with the Professional
            Regulation Commission.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h3 className="font-mono text-[11px] font-medium tracking-[0.16em] text-faint uppercase">{c.h}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-muted transition-colors hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© CELEVATE. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <BarChart3 className="size-3.5" aria-hidden /> Progress is stored locally in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
