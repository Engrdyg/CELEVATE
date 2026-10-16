"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Cloud, Flag, Grid3x3, LogOut, Timer } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, SheetContent, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeMenu } from "@/components/theme/theme-selector";
import { QuestionBody } from "@/components/practice/question-card";
import { getQuestion, getSubject, type ChoiceId } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";
import { usePrefs } from "@/lib/store/prefs";
import { useStoreReady } from "@/hooks/use-hydrated";
import { useNow } from "@/hooks/use-now";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { cn, formatDuration } from "@/lib/utils";

export function ExamSessionView() {
  const ready = useStoreReady();
  const exam = useProgress((s) => s.exams.find((e) => e.status === "in-progress"));
  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl p-6" role="status" aria-label="Loading exam">
        <Skeleton className="h-10" />
        <Skeleton className="mt-6 h-80 rounded-2xl" />
      </div>
    );
  }
  if (!exam) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center p-6">
        <EmptyState
          icon={ClipboardCheck}
          title="No exam in progress"
          description="Start a mock board exam from the exam hub. Submitted exams can be reviewed from your history."
          action={
            <Button asChild>
              <Link href="/exams">Go to Mock Board Exams</Link>
            </Button>
          }
        />
      </main>
    );
  }
  return <Session examId={exam.id} />;
}

function Session({ examId }: { examId: string }) {
  const router = useRouter();
  const exam = useProgress((s) => s.exams.find((e) => e.id === examId))!;
  const answer = useProgress((s) => s.answerExam);
  const toggleFlag = useProgress((s) => s.toggleExamFlag);
  const setIndex = useProgress((s) => s.setExamIndex);
  const submitExam = useProgress((s) => s.submitExam);
  const record = useProgress((s) => s.recordAttempt);
  const showTimer = usePrefs((s) => s.showExamTimer);
  const setShowTimer = usePrefs((s) => s.setShowExamTimer);

  const now = useNow(1000);
  useStudyTimer();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const submittedRef = useRef(false);

  const total = exam.questionIds.length;
  const idx = exam.currentIndex;
  const qid = exam.questionIds[idx];
  const q = getQuestion(qid)!;
  const answeredCount = Object.keys(exam.answers).length;
  const remaining = now == null ? null : Math.max(0, Math.round((new Date(exam.deadline).getTime() - now) / 1000));
  const expired = remaining === 0;

  const finalize = useCallback(
    (auto: boolean) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const e = useProgress.getState().exams.find((x) => x.id === examId);
      if (!e) return;
      const perItem = Math.round((Math.min(Date.now(), new Date(e.deadline).getTime()) - new Date(e.startedAt).getTime()) / 1000 / Math.max(1, e.questionIds.length));
      for (const id of e.questionIds) {
        const qq = getQuestion(id);
        if (!qq) continue;
        const sel = e.answers[id] ?? null;
        record({ questionId: id, subjectId: qq.subjectId, topic: qq.topic, selected: sel, correct: sel === qq.answer, seconds: perItem, mode: "exam" });
      }
      submitExam(examId, auto);
      router.replace(`/exams/results?id=${examId}`);
    },
    [examId, record, submitExam, router],
  );

  // Automatic submission at the deadline, if the exam rules require it.
  useEffect(() => {
    if (expired && exam.config.autoSubmit) finalize(true);
  }, [expired, exam.config.autoSubmit, finalize]);
  useEffect(() => {
    if (expired && !exam.config.autoSubmit) setConfirmOpen(true);
  }, [expired, exam.config.autoSubmit]);

  const choose = (c: ChoiceId) => {
    if (expired) return;
    answer(examId, qid, exam.answers[qid] === c ? null : c);
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 900);
  };
  const go = useCallback((i: number) => setIndex(examId, Math.max(0, Math.min(total - 1, i))), [examId, setIndex, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[role=dialog],input[type=text],textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, ChoiceId> = { "1": "A", "2": "B", "3": "C", "4": "D" };
      if (map[e.key]) {
        e.preventDefault();
        answer(examId, qid, map[e.key]);
      } else if (e.key === "ArrowRight" && !(t instanceof HTMLInputElement)) go(idx + 1);
      else if (e.key === "ArrowLeft" && !(t instanceof HTMLInputElement)) go(idx - 1);
      else if (e.key.toLowerCase() === "f") toggleFlag(examId, qid);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, examId, qid, go, idx, toggleFlag]);

  const flagged = exam.flagged.includes(qid);
  const low = remaining != null && remaining <= 300;

  const palette = (
    <div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-5">
        {exam.questionIds.map((id, i) => {
          const answered = !!exam.answers[id];
          const isFlagged = exam.flagged.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                go(i);
                setPaletteOpen(false);
              }}
              aria-current={i === idx ? "step" : undefined}
              aria-label={`Question ${i + 1}: ${answered ? "answered" : "unanswered"}${isFlagged ? ", marked for review" : ""}`}
              className={cn(
                "relative grid aspect-square place-items-center rounded-md font-mono text-[11px] font-medium transition-colors",
                answered ? "bg-primary-soft text-primary-text" : "border border-line text-muted hover:border-line-strong",
                isFlagged && "bg-warning-soft text-warning",
                i === idx && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
              )}
            >
              {i + 1}
              {isFlagged && <Flag className="absolute -top-1 -right-1 size-2.5 fill-warning text-warning" aria-hidden />}
            </button>
          );
        })}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="rounded-lg bg-primary-soft py-2">
          <dt className="text-muted">Answered</dt>
          <dd className="font-mono text-sm font-semibold text-primary-text">{answeredCount}</dd>
        </div>
        <div className="rounded-lg border border-line py-2">
          <dt className="text-muted">Unanswered</dt>
          <dd className="font-mono text-sm font-semibold">{total - answeredCount}</dd>
        </div>
        <div className="rounded-lg bg-warning-soft py-2">
          <dt className="text-muted">For review</dt>
          <dd className="font-mono text-sm font-semibold text-warning">{exam.flagged.length}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Exam header */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-6">
          <LogoMark className="size-7 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{exam.config.title}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted" aria-live="polite">
              <Cloud className={cn("size-3", savedPulse ? "text-success" : "text-faint")} aria-hidden />
              {savedPulse ? "Saved" : "Autosaved in this browser"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[14px] font-semibold tabular transition-colors",
              low ? "border-danger/40 bg-danger-soft text-danger" : "border-line bg-canvas text-fg",
            )}
            aria-label={showTimer ? `Time remaining ${remaining == null ? "" : formatDuration(remaining)}. Click to hide timer` : "Show timer"}
          >
            <Timer className="size-4" aria-hidden />
            {showTimer ? (remaining == null ? "--:--" : formatDuration(remaining)) : "Show"}
          </button>
          <ThemeMenu />
          <Button size="sm" variant="iris" onClick={() => setConfirmOpen(true)}>
            Submit
          </Button>
        </div>
        <div className="h-0.5 bg-subtle" role="progressbar" aria-label="Answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answeredCount}>
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(answeredCount / total) * 100}%` }} />
        </div>
        {low && remaining! > 0 && (
          <p className="bg-danger-soft py-1 text-center text-xs font-medium text-danger" role="alert">
            Less than 5 minutes remaining
          </p>
        )}
      </header>

      <main id="main" className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-3 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-label={`Question ${idx + 1} of ${total}`} className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[13px] font-medium">
              Question {idx + 1} <span className="text-faint">of {total}</span>
              <span className="ml-2 rounded bg-subtle px-1.5 py-0.5 text-[10px] text-muted">{getSubject(q.subjectId)?.code}</span>
            </p>
            <Button variant={flagged ? "outline" : "ghost"} size="sm" onClick={() => toggleFlag(examId, qid)} aria-pressed={flagged} className={flagged ? "border-warning/50 text-warning" : undefined}>
              <Flag className={flagged ? "fill-warning" : undefined} /> {flagged ? "Marked for review" : "Mark for review"}
            </Button>
          </div>
          <div className="rounded-2xl border border-line bg-card p-4 shadow-elev-1 sm:p-7">
            <QuestionBody key={qid} q={q} name={`exam-${qid}`} selected={exam.answers[qid]} onSelect={choose} disabled={expired} size="lg" />
            {exam.answers[qid] && (
              <button type="button" onClick={() => answer(examId, qid, null)} className="mt-3 text-xs text-muted underline-offset-2 hover:text-fg hover:underline">
                Clear answer
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => go(idx - 1)} disabled={idx === 0}>
              <ArrowLeft /> Previous
            </Button>
            <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="lg:hidden">
                  <Grid3x3 /> {answeredCount}/{total}
                </Button>
              </DialogTrigger>
              <SheetContent side="bottom" title="Question palette">
                <div className="p-5 pt-1">{palette}</div>
              </SheetContent>
            </Dialog>
            {idx < total - 1 ? (
              <Button onClick={() => go(idx + 1)}>
                Next <ArrowRight />
              </Button>
            ) : (
              <Button variant="iris" onClick={() => setConfirmOpen(true)}>
                Review & submit
              </Button>
            )}
          </div>
          <p className="mt-6 hidden text-center text-[11px] text-faint sm:block">Keys: 1–4 answer · ← → move · F mark for review</p>
        </section>

        <aside className="hidden lg:block" aria-label="Question palette">
          <div className="sticky top-24 rounded-2xl border border-line bg-card p-4 shadow-elev-1">
            <p className="mb-3 text-xs font-medium text-muted">Question palette</p>
            {palette}
            <Button asChild variant="ghost" size="sm" className="mt-4 w-full text-muted">
              <Link href="/exams">
                <LogOut /> Leave (progress is saved)
              </Link>
            </Button>
          </div>
        </aside>
      </main>

      {/* Submit confirmation */}
      <Dialog open={confirmOpen} onOpenChange={(o) => !expired && setConfirmOpen(o)}>
        <DialogContent hideClose={expired}>
          <DialogHeader>
            <DialogTitle>{expired ? "Time is up" : "Submit your exam?"}</DialogTitle>
            <DialogDescription>
              {expired ? "The time limit has been reached. Submit to see your results." : "You won't be able to change your answers after submitting."}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-[13px]">
            <li className="flex items-center justify-between rounded-lg bg-subtle px-3 py-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary-text" /> Answered
              </span>
              <span className="font-mono font-semibold">
                {answeredCount}/{total}
              </span>
            </li>
            {total - answeredCount > 0 && (
              <li className="flex items-center justify-between rounded-lg bg-danger-soft px-3 py-2 text-danger">
                <span>Unanswered (scored as incorrect)</span>
                <span className="font-mono font-semibold">{total - answeredCount}</span>
              </li>
            )}
            {exam.flagged.length > 0 && (
              <li className="flex items-center justify-between rounded-lg bg-warning-soft px-3 py-2 text-warning">
                <span>Marked for review</span>
                <span className="font-mono font-semibold">{exam.flagged.length}</span>
              </li>
            )}
          </ul>
          <DialogFooter>
            {!expired && (
              <DialogClose asChild>
                <Button variant="ghost">Keep working</Button>
              </DialogClose>
            )}
            <Button variant="iris" onClick={() => finalize(expired)}>
              Submit exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
