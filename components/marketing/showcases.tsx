"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Bot, Check, Clock, Copy, Flag, NotebookPen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tex } from "@/components/math/tex";
import { RichText } from "@/components/math/rich-text";
import { Reveal } from "@/components/motion/reveal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionBody } from "@/components/practice/question-card";
import { getSubject } from "@/lib/content";
import { catalog, getCatalogEntry } from "@/lib/qbank/catalog";
import { topicTitle } from "@/lib/qbank/taxonomy";
import type { ChoiceKey } from "@/lib/qbank/schema";
import { useInView } from "@/hooks/use-in-view";
import { useSingleQuestion } from "@/hooks/use-single-question";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SampleChip, SectionHeading } from "./section-heading";
import { sparkPath } from "./product-preview";
import { useParallaxFactor } from "./use-parallax";

/* ------------------------------------------------------------------ */
/*  04 — Interactive review experience: a real question from the bank  */
/* ------------------------------------------------------------------ */

const DEMO_ID = catalog.find((q) => q.subject === "mste" && q.difficulty === "easy")?.id ?? catalog[0]?.id;

export function TryAQuestion() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "400px");
  const { q, error, check, checking, submit, reset } = useSingleQuestion(DEMO_ID, visible);
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const reduce = useReducedMotion();
  if (!DEMO_ID) return null;
  const entry = getCatalogEntry(DEMO_ID)!;
  const correct = !!check?.item.isCorrect;
  const subject = getSubject(entry.subject);

  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="try-title">
      <div className="mx-auto grid max-w-page items-start gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <SectionHeading
          index="04"
          eyebrow="Interactive review"
          title={<span id="try-title">Try a problem. See the reasoning.</span>}
          description="This is a real item from the CELEVATE question bank, graded on the server. Pick an answer and check it — the full solution and common errors appear instantly in practice mode."
        />
        <Reveal>
          <div ref={ref} className="surface-card overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
              <Badge tone="primary">{subject?.code}</Badge>
              <Badge tone="neutral">{topicTitle(entry.topic)}</Badge>
              <Badge tone="success" className="capitalize">
                {entry.difficulty}
              </Badge>
              <span className="ml-auto font-mono text-[11px] text-faint">Practice mode</span>
            </div>
            <div className="p-5 sm:p-6">
              {error ? (
                <p className="text-[14px] text-muted">The sample question couldn&apos;t be loaded right now. You can try it in Practice.</p>
              ) : !q ? (
                <div role="status" aria-label="Loading question" className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-40" />
                </div>
              ) : (
                <>
                  <QuestionBody q={q} name="landing-try" selected={check?.item.selected ?? selected} onSelect={setSelected} answer={check?.item.answer} />
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {!check ? (
                      <Button
                        onClick={() => selected && submit(selected).catch((e: Error) => toast.error(e.message))}
                        disabled={!selected}
                        loading={checking}
                      >
                        Check answer
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          reset();
                          setSelected(null);
                        }}
                      >
                        Try again
                      </Button>
                    )}
                    <AnimatePresence>
                      {check && (
                        <motion.p
                          initial={reduce ? false : { opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          role="status"
                          className={cn("text-[14px] font-medium", correct ? "text-success" : "text-danger")}
                        >
                          {correct ? "Correct — nicely done." : `Not quite. The answer is ${check.item.answerLabel}.`}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
            <AnimatePresence initial={false}>
              {check && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: ease.outQuart }}
                  className="overflow-hidden border-t border-line bg-subtle/40"
                >
                  <div className="p-5 sm:p-6">
                    <p className="font-display text-[14px] font-semibold">Solution</p>
                    <ol className="mt-4 space-y-3">
                      {check.review.solution.map((s, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[10px] font-semibold text-primary-text">{i + 1}</span>
                          <div className="min-w-0 flex-1 text-[14px] leading-6">
                            <p className="font-medium">{s.title}</p>
                            <RichText text={s.text} />
                            {s.tex && <Tex tex={s.tex} display className="mt-1.5 text-fg" />}
                          </div>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-[14px]">
                      <span className="font-semibold">Final answer: </span>
                      <RichText text={check.review.finalAnswer} />
                    </p>
                    <div className="mt-5 flex justify-end">
                      <Button asChild variant="link" size="sm">
                        <Link href="/practice">
                          Continue in Practice <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  05 — AI-assisted learning                                          */
/* ------------------------------------------------------------------ */

export function AiShowcase() {
  const reduce = useReducedMotion();
  const steps = [
    { t: "Identify what's given", tex: String.raw`Q = 0.05\ \text{m}^3/\text{s},\quad D = 0.20\ \text{m}` },
    { t: "Apply continuity", tex: String.raw`v = \frac{Q}{A} = \frac{0.05}{\tfrac{\pi}{4}(0.20)^2} = 1.59\ \text{m/s}` },
    { t: "Velocity head", tex: String.raw`\frac{v^2}{2g} = \frac{(1.59)^2}{2(9.81)} = 0.129\ \text{m}` },
  ];
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/40 py-24 sm:py-32" aria-labelledby="ai-title">
      <div className="mx-auto grid max-w-page items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <div className="surface-card relative overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-2 text-[13px] font-medium">
                <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-primary to-iris text-white">
                  <Sparkles className="size-3.5" />
                </span>
                CELEVATE AI
              </div>
              <SampleChip>Illustrative conversation</SampleChip>
            </div>
            <div className="space-y-4 p-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary-strong px-4 py-2.5 text-[14px] text-primary-fg">
                Water flows at 0.05 m³/s in a 200-mm pipe. What&apos;s the velocity head?
              </div>
              <div className="max-w-[92%] space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
                  <Bot className="size-3.5" /> Step-by-step explanation
                  <Badge tone="iris">AI-generated</Badge>
                </div>
                {steps.map((s, i) => (
                  <motion.div
                    key={s.t}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.25, duration: 0.5, ease: ease.outExpo }}
                    className="rounded-xl border border-line bg-canvas/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-[12px] font-medium text-muted">
                      <span className="font-mono text-primary-text">{String(i + 1).padStart(2, "0")}</span> {s.t}
                    </div>
                    <Tex tex={s.tex} display className="mt-1 text-fg" />
                  </motion.div>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    [Copy, "Copy solution"],
                    [NotebookPen, "Save to notes"],
                    [Sparkles, "Ask follow-up"],
                  ].map(([Icon, l]) => {
                    const I = Icon as typeof Copy;
                    return (
                      <span key={l as string} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line px-2.5 text-[12px] text-muted">
                        <I className="size-3.5" /> {l as string}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading
            index="05"
            eyebrow="AI-assisted learning"
            title={<span id="ai-title">An engineering tutor that shows its work.</span>}
            description="CELEVATE AI is designed for structured, step-by-step explanations with properly rendered formulas, links to related lessons and one-click saving to your notes."
          />
          <Reveal delay={0.1}>
            <ul className="mt-6 space-y-2.5 text-[14px] text-muted">
              {[
                "AI-generated explanations are always labeled and kept separate from verified lesson content.",
                "Works with a connected AI provider; without one, the workspace runs in a clearly marked demo mode.",
                "Every answer links back to the lessons and formulas it relies on.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  06 — Performance analytics                                         */
/* ------------------------------------------------------------------ */

const TREND = [52, 55, 54, 60, 63, 61, 66, 70, 69, 73, 76, 78];
const HEAT = [
  [0.2, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 0.3],
  [0.6, 0.3, 0.4, 0.9, 0.5, 0.8, 0.2, 0.6],
  [0.9, 0.7, 0.5, 0.3, 0.6, 0.4, 0.8, 0.7],
];

export function AnalyticsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const f = useParallaxFactor();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [30 * f, -30 * f]);
  const y2 = useTransform(scrollYProgress, [0, 1], [70 * f, -50 * f]);
  const reduce = useReducedMotion();
  const W = 460;
  const H = 150;
  const path = sparkPath(TREND, W, H, 8);
  return (
    <section id="analytics" className="relative scroll-mt-20 py-24 sm:py-32" aria-labelledby="analytics-title">
      <div className="mx-auto grid max-w-page items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <SectionHeading
          index="06"
          eyebrow="Performance analytics"
          title={<span id="analytics-title">Know exactly where you stand.</span>}
          description="Accuracy trends, topic mastery, study consistency and mock-exam history are computed from your own activity — and turned into concrete next steps."
        />
        <div ref={ref} className="relative">
          <motion.div style={{ y: y1 }} className="surface-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-[15px] font-semibold">Accuracy over time</p>
                <p className="text-[12px] text-muted">Weekly average, all subjects</p>
              </div>
              <SampleChip />
            </div>
            <svg viewBox={`0 0 ${W} ${H + 10}`} className="mt-4 w-full" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" x2={W} y1={8 + i * 46} y2={8 + i * 46} stroke="var(--chart-grid)" />
              ))}
              <motion.path
                d={`${path} L${W - 8} ${H} L8 ${H} Z`}
                fill="var(--primary)"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 0.1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6 }}
              />
              <motion.path
                d={path}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.4"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: ease.outQuart }}
              />
            </svg>
          </motion.div>
          <motion.div style={{ y: y2 }} className="surface-card relative z-10 mt-4 ml-auto w-full max-w-sm rounded-2xl p-5 sm:-mt-10 sm:mr-[-12px] sm:shadow-elev-3">
            <p className="font-display text-[14px] font-semibold">Topic mastery</p>
            <div className="mt-3 space-y-1.5">
              {HEAT.map((row, r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <span className="w-11 font-mono text-[10px] text-faint">{["MSTE", "HGE", "PSAD"][r]}</span>
                  {row.map((v, c) => (
                    <motion.span
                      key={c}
                      className="h-5 flex-1 rounded"
                      style={{ background: `color-mix(in srgb, var(--primary) ${Math.round(v * 85 + 8)}%, var(--subtle))` }}
                      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (r * 8 + c) * 0.025, duration: 0.4 }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-line bg-warning-soft/60 px-3 py-2 text-[12px] text-fg">
              <span className="font-medium text-warning">Next action:</span> 8 items on effective stress
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  07 — Mock board exams                                              */
/* ------------------------------------------------------------------ */

export function ExamShowcase() {
  const states = Array.from({ length: 40 }, (_, i) => (i < 23 ? (i % 7 === 3 ? "flag" : "done") : i === 23 ? "current" : "todo"));
  return (
    <section id="mock-exams" className="relative scroll-mt-20 overflow-hidden border-y border-line bg-surface/40 py-24 sm:py-32" aria-labelledby="exam-title">
      <div className="mx-auto grid max-w-page items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <div className="surface-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">Mock Board · Mixed subjects</p>
                <p className="text-[11px] text-muted">Question 24 of 40</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 py-1.5 font-mono text-[13px] font-semibold tabular">
                <Clock className="size-3.5 text-primary-text" /> 47:12
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="h-1 rounded-full bg-subtle">
                  <div className="h-full w-[58%] rounded-full bg-primary" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-[92%] rounded bg-subtle" />
                  <div className="h-3 w-[80%] rounded bg-subtle" />
                  <div className="h-3 w-[55%] rounded bg-subtle" />
                </div>
                <div className="mt-5 grid gap-2">
                  {["A", "B", "C", "D"].map((l) => (
                    <div key={l} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5", l === "C" ? "border-primary bg-primary-soft" : "border-line")}>
                      <span className={cn("grid size-6 place-items-center rounded-md border font-mono text-[11px]", l === "C" ? "border-primary bg-primary-strong text-primary-fg" : "border-line text-muted")}>{l}</span>
                      <span className="h-2.5 w-24 rounded bg-subtle" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[12px] text-muted">
                  <Flag className="size-3.5" /> Mark for review
                </div>
              </div>
              <div className="sm:w-44">
                <p className="text-[11px] font-medium text-muted">Question palette</p>
                <div className="mt-2 grid grid-cols-8 gap-1 sm:grid-cols-5">
                  {states.map((s, i) => (
                    <span
                      key={i}
                      className={cn(
                        "grid aspect-square place-items-center rounded font-mono text-[9px]",
                        s === "done" && "bg-primary-soft text-primary-text",
                        s === "flag" && "bg-warning-soft text-warning",
                        s === "current" && "bg-primary-strong text-primary-fg ring-2 ring-primary/30",
                        s === "todo" && "border border-line text-faint",
                      )}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading
            index="07"
            eyebrow="Mock board exams"
            title={<span id="exam-title">Rehearse the real thing, calmly.</span>}
            description="A distraction-free exam room: timer, question palette, flags for review, autosave in your browser and automatic submission when time runs out."
          />
          <Reveal delay={0.1} className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Configurable", "subjects, items & time"],
              ["Hidden answers", "until you submit"],
              ["Autosaved", "resume after a refresh"],
              ["Full breakdown", "by subject & topic"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-xl border border-line bg-card/60 px-4 py-3">
                <p className="text-[14px] font-semibold">{a}</p>
                <p className="text-[12px] text-muted">{b}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
