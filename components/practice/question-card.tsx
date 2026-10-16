"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  Flag,
  Lightbulb,
  ListOrdered,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RichText } from "@/components/math/rich-text";
import { Tex } from "@/components/math/tex";
import { EngineeringFigure } from "@/components/figures/figures";
import { getSubject, lessonHref, lessonOutline } from "@/lib/content";
import { topicTitle } from "@/lib/qbank/taxonomy";
import { qbankApi, type PublicQuestion, type ReviewQuestion } from "@/lib/qbank/client";
import type { ChoiceKey } from "@/lib/qbank/schema";
import type { FigureId } from "@/lib/content/types";
import { AI_ACTIONS, tutorHref } from "@/lib/tutor/asks";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DIFF_TONE = { easy: "success", moderate: "warning", difficult: "danger" } as const;

export function QuestionMeta({ q, className }: { q: Pick<PublicQuestion, "subject" | "topic" | "difficulty">; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge tone="primary">{getSubject(q.subject)?.code}</Badge>
      <Badge tone="neutral">{topicTitle(q.topic)}</Badge>
      <Badge tone={DIFF_TONE[q.difficulty]} className="capitalize">
        {q.difficulty}
      </Badge>
    </div>
  );
}

/**
 * Accessible multiple-choice question rendered from the answer-free payload.
 * Native radio inputs give arrow-key navigation and screen-reader semantics.
 * `selected` / `onSelect` use stable choice ids; letters shown are per-attempt labels.
 */
export function QuestionBody({
  q,
  name,
  selected,
  onSelect,
  answer,
  disabled,
  size = "md",
}: {
  q: PublicQuestion;
  name: string;
  selected: ChoiceKey | null | undefined;
  onSelect: (c: ChoiceKey) => void;
  /** Correct choice id — only passed once the rules allow disclosure. */
  answer?: ChoiceKey | null;
  disabled?: boolean;
  size?: "md" | "lg";
}) {
  const revealed = !!answer;
  return (
    <div>
      <div className={cn("leading-7 text-fg", size === "lg" ? "text-[16px] sm:text-[17px] sm:leading-8" : "text-[15px]")}>
        <RichText text={q.stem} />
      </div>
      {q.figure && <EngineeringFigure id={q.figure as FigureId} className="mt-5 rounded-xl border border-line bg-canvas/50 p-4" />}
      <fieldset className="mt-5" disabled={disabled || revealed}>
        <legend className="sr-only">Answer choices</legend>
        <div className="grid grid-cols-1 gap-2">
          {q.choices.map((c) => {
            const isSel = selected === c.id;
            const isAns = revealed && c.id === answer;
            const isWrong = revealed && isSel && c.id !== answer;
            return (
              <label
                key={c.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-150",
                  "has-[:focus-visible]:border-primary has-[:focus-visible]:shadow-[0_0_0_3px_var(--primary-soft)]",
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
                  {isAns ? <Check className="size-3.5" /> : isWrong ? <X className="size-3.5" /> : c.label}
                </span>
                <span className="min-w-0 flex-1 text-[15px]">
                  <span className="sr-only">Choice {c.label}: </span>
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

function SectionTitle({ icon: Icon, children, tone = "text-primary-text" }: { icon: typeof Sigma; children: React.ReactNode; tone?: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-[14px] font-semibold">
      <Icon className={cn("size-4", tone)} aria-hidden /> {children}
    </h3>
  );
}

/** Verified, engineering-style solution. Only rendered after the rules allow disclosure. */
export function SolutionPanel({
  q,
  selected,
  revealToken,
  showStatus = true,
}: {
  q: ReviewQuestion;
  selected?: ChoiceKey | null;
  revealToken?: string | null;
  showStatus?: boolean;
}) {
  const reduce = useReducedMotion();
  const correct = selected === q.answer;
  const correctChoice = q.choices.find((c) => c.id === q.answer)!;
  const related = q.relatedLessonIds.map((id) => lessonOutline.find((l) => l.id === id)).filter(Boolean);
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: ease.outQuart }}
      aria-label="Solution"
      className="space-y-6"
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
              Correct answer: <strong className="font-semibold text-fg">{q.answerLabel}</strong> — <RichText text={correctChoice.text} />
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge tone="success">
          <ShieldCheck /> Answer independently recomputed
        </Badge>
        {q.smeReview === "approved" ? <Badge tone="primary">Reviewed by a licensed engineer</Badge> : <Badge tone="outline">Awaiting licensed-engineer review</Badge>}
      </div>

      {q.given.length > 0 && (
        <div>
          <SectionTitle icon={ClipboardList}>Given</SectionTitle>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm leading-6 sm:grid-cols-2">
            {q.given.map((g, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-primary" />
                <RichText text={g} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <SectionTitle icon={Target}>Required</SectionTitle>
        <p className="mt-1.5 text-sm leading-6">
          <RichText text={q.required} />
        </p>
      </div>

      {q.formulas.length > 0 && (
        <div>
          <SectionTitle icon={Sigma} tone="text-iris-text">
            Formula
          </SectionTitle>
          <div className="mt-2 grid gap-2">
            {q.formulas.map((f, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface px-3 py-2">
                <p className="text-xs text-muted">{f.label}</p>
                <Tex tex={f.tex} display className="text-fg" />
              </div>
            ))}
          </div>
          {q.variables.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-xs">
                <caption className="sr-only">Variables</caption>
                <thead className="text-faint">
                  <tr>
                    <th scope="col" className="pb-1 font-medium">Symbol</th>
                    <th scope="col" className="pb-1 font-medium">Meaning</th>
                    <th scope="col" className="pb-1 font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {q.variables.map((v, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="py-1.5 pr-3">
                        <Tex tex={v.symbol} />
                      </td>
                      <td className="py-1.5 pr-3 text-fg">{v.meaning}</td>
                      <td className="py-1.5 font-mono text-[11px] text-muted">{v.unit ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div>
        <SectionTitle icon={ListOrdered}>Solution</SectionTitle>
        <ol className="mt-3 space-y-4">
          {q.solution.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] font-semibold text-primary-text">{i + 1}</span>
              <div className="min-w-0 flex-1 text-sm leading-6 text-fg">
                <p className="font-medium">{s.title}</p>
                <RichText text={s.text} />
                {s.tex && <Tex tex={s.tex} display className="mt-2 rounded-lg border border-line bg-canvas/60 px-3 py-2" />}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm">
        <p className="text-xs font-semibold tracking-wide text-success uppercase">Final answer</p>
        <p className="mt-1 text-fg">
          <RichText text={q.finalAnswer} />
        </p>
      </div>

      <div>
        <SectionTitle icon={Lightbulb}>Engineering insight</SectionTitle>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          <RichText text={q.insight} />
        </p>
      </div>

      {q.commonErrors.length > 0 && (
        <div className="rounded-xl border border-warning/25 bg-warning-soft p-4">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-warning">
            <AlertTriangle className="size-4" aria-hidden /> Common errors
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-fg">
            {q.commonErrors.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-warning" />
                <RichText text={e} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {q.relatedConcepts.map((c) => (
          <Badge key={c} tone="neutral">
            {c}
          </Badge>
        ))}
        {related.map((l) =>
          l!.status === "available" ? (
            <Link key={l!.id} href={lessonHref(l!.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:border-line-strong">
              <BookOpen className="size-3.5 text-primary-text" /> {l!.title}
            </Link>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {revealToken && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles /> Ask CELEVATE AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Uses this verified solution as context</DropdownMenuLabel>
              {AI_ACTIONS.map((a) => (
                <DropdownMenuItem key={a.id} asChild>
                  <Link href={tutorHref(q.id, revealToken, a.id)}>{a.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ReportButton questionId={q.id} />
      </div>
    </motion.section>
  );
}

const ISSUES = [
  { value: "wrong_answer", label: "The keyed answer looks wrong" },
  { value: "calculation_error", label: "Calculation error in the solution" },
  { value: "unclear_question", label: "Question is unclear or missing data" },
  { value: "typo", label: "Typo or wording" },
  { value: "rendering", label: "Formula or figure doesn't display" },
  { value: "other", label: "Something else" },
];

export function ReportButton({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("wrong_answer");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Flag /> Report an issue
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an issue with {questionId}</DialogTitle>
            <DialogDescription>Reviewers check every report. Published answers are never changed automatically.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const learnerId = typeof window !== "undefined" ? (localStorage.getItem("celevate-learner-id") ?? undefined) : undefined;
                const r = await qbankApi.report({ questionId, issueType: issue, description: text.trim(), learnerId });
                if (r.stored) toast.success("Thanks — your report was sent to the review team");
                else toast(r.message ?? "Reporting isn't available on this deployment yet");
                setOpen(false);
                setText("");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Issue type</p>
              <Select label="Issue type" value={issue} onChange={setIssue} options={ISSUES} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`report-${questionId}`}>Details</Label>
              <Textarea id={`report-${questionId}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="What looks wrong? Include your computed value if you have one." required minLength={5} maxLength={2000} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={busy} disabled={text.trim().length < 5}>
                Send report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
