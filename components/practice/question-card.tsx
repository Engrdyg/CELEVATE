"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, BookOpen, Check, CheckCircle2, Lightbulb, Sigma, X, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/math/rich-text";
import { Tex } from "@/components/math/tex";
import { EngineeringFigure } from "@/components/figures/figures";
import { getFormula, getSubject, lessonHref, lessonOutline, type ChoiceId, type Question } from "@/lib/content";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DIFF_TONE = { easy: "success", medium: "warning", hard: "danger" } as const;

export function QuestionMeta({ q, className }: { q: Question; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge tone="primary">{getSubject(q.subjectId)?.code}</Badge>
      <Badge tone="neutral">{q.topic}</Badge>
      <Badge tone={DIFF_TONE[q.difficulty]} className="capitalize">
        {q.difficulty}
      </Badge>
    </div>
  );
}

/**
 * Accessible multiple-choice question. Uses native radio inputs so arrow-key
 * navigation and screen-reader semantics work out of the box.
 */
export function QuestionBody({
  q,
  name,
  selected,
  onSelect,
  revealed,
  disabled,
  size = "md",
}: {
  q: Question;
  name: string;
  selected: ChoiceId | null | undefined;
  onSelect: (c: ChoiceId) => void;
  revealed?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <div>
      <div className={cn("leading-7 text-fg", size === "lg" ? "text-[16px] sm:text-[17px] sm:leading-8" : "text-[15px]")}>
        <RichText text={q.stem} />
      </div>
      {q.figure && <EngineeringFigure id={q.figure} className="mt-5 rounded-xl border border-line bg-canvas/50 p-4" />}
      <fieldset className="mt-5" disabled={disabled || revealed}>
        <legend className="sr-only">Answer choices</legend>
        <div className="grid gap-2">
          {q.choices.map((c) => {
            const isSel = selected === c.id;
            const isAns = revealed && c.id === q.answer;
            const isWrong = revealed && isSel && c.id !== q.answer;
            return (
              <label
                key={c.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-150",
                  "has-[:focus-visible]:shadow-[0_0_0_3px_var(--primary-soft)] has-[:focus-visible]:border-primary",
                  !revealed && !isSel && "border-line hover:border-line-strong hover:bg-subtle/50",
                  !revealed && isSel && "border-primary bg-primary-soft",
                  revealed && !isAns && !isWrong && "border-line opacity-70",
                  isAns && "border-success bg-success-soft",
                  isWrong && "border-danger bg-danger-soft",
                  (disabled || revealed) && "cursor-default",
                )}
              >
                <input type="radio" name={name} value={c.id} checked={isSel} onChange={() => onSelect(c.id)} className="peer sr-only" />
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg border font-mono text-[12px] font-semibold transition-colors",
                    !revealed && isSel ? "border-primary bg-primary-strong text-primary-fg" : "border-line bg-surface text-muted",
                    isAns && "border-success bg-success text-white",
                    isWrong && "border-danger bg-danger text-white",
                  )}
                  aria-hidden
                >
                  {isAns ? <Check className="size-3.5" /> : isWrong ? <X className="size-3.5" /> : c.id}
                </span>
                <span className="min-w-0 flex-1 text-[15px]">
                  <span className="sr-only">Choice {c.id}: </span>
                  <RichText text={c.text} />
                </span>
                {isAns && <span className="sr-only">(correct answer)</span>}
                {isWrong && <span className="sr-only">(your answer, incorrect)</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function SolutionPanel({ q, selected, showStatus = true }: { q: Question; selected?: ChoiceId | null; showStatus?: boolean }) {
  const reduce = useReducedMotion();
  const correct = selected === q.answer;
  const related = q.relatedLessonIds.map((id) => lessonOutline.find((l) => l.id === id)).filter(Boolean);
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: ease.outQuart }}
      aria-label="Solution"
      className="space-y-5"
    >
      {showStatus && (
        <div
          role="status"
          className={cn("flex items-start gap-3 rounded-xl border p-4", correct ? "border-success/30 bg-success-soft" : selected ? "border-danger/30 bg-danger-soft" : "border-line bg-subtle")}
        >
          {correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : <XCircle className={cn("mt-0.5 size-5 shrink-0", selected ? "text-danger" : "text-muted")} />}
          <div className="text-sm">
            <p className="font-semibold text-fg">{correct ? "Correct" : selected ? "Incorrect" : "Not answered"}</p>
            <p className="mt-0.5 text-muted">
              Correct answer: <strong className="font-semibold text-fg">{q.answer}</strong> — <RichText text={q.choices.find((c) => c.id === q.answer)!.text} />
            </p>
          </div>
        </div>
      )}

      <div>
        <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold">
          <Lightbulb className="size-4 text-primary-text" aria-hidden /> Detailed solution
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          <RichText text={q.solution.summary} />
        </p>
        <ol className="mt-4 space-y-4">
          {q.solution.steps.map((s, i) => (
            <li key={i} className="relative flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] font-semibold text-primary-text">{i + 1}</span>
              <div className="min-w-0 flex-1 text-sm leading-6 text-fg">
                <RichText text={s.text} />
                {s.tex && <Tex tex={s.tex} display className="mt-2 rounded-lg border border-line bg-canvas/60 px-3 py-2" />}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {q.solution.formulaIds.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-display text-[14px] font-semibold">
            <Sigma className="size-4 text-iris-text" aria-hidden /> Formulas used
          </h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {q.solution.formulaIds.map((id) => {
              const f = getFormula(id);
              if (!f) return null;
              return (
                <li key={id}>
                  <Link href={`/formulas?f=${f.id}`} className="block rounded-lg border border-line bg-surface px-3 py-2 transition-colors hover:border-line-strong">
                    <span className="block text-xs text-muted">{f.name}</span>
                    <Tex tex={f.tex} display className="text-fg" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {q.solution.commonErrors.length > 0 && (
        <div className="rounded-xl border border-warning/25 bg-warning-soft p-4">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-warning">
            <AlertTriangle className="size-4" aria-hidden /> Common errors
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-fg">
            {q.solution.commonErrors.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-warning" />
                <RichText text={e} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-muted">Related topics</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((l) => (
              <li key={l!.id}>
                {l!.status === "available" ? (
                  <Link href={lessonHref(l!.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-fg hover:border-line-strong">
                    <BookOpen className="size-3.5 text-primary-text" /> {l!.title}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-xs text-muted">
                    <BookOpen className="size-3.5" /> {l!.title} · lesson in preparation
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}
