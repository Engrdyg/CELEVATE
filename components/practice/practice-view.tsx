"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Filter,
  Flag,
  GraduationCap,
  Keyboard,
  RotateCcw,
  SearchX,
  Shuffle,
  Timer,
  XCircle,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { ProgressBar } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/states";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { QuestionBody, QuestionMeta, SolutionPanel } from "./question-card";
import { allQuestions, getQuestion, subjects, type ChoiceId, type Difficulty, type SubjectId } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { useElapsed } from "@/hooks/use-elapsed";
import { ease } from "@/lib/motion";
import { cn, formatDuration, pct } from "@/lib/utils";

type Mode = "practice" | "exam";
type Scope = "all" | "unanswered" | "incorrect" | "bookmarked";
interface Answer {
  selected: ChoiceId | null;
  submitted: boolean;
  seconds: number;
}

export function PracticeView() {
  const params = useSearchParams();
  const router = useRouter();
  const ready = useStoreReady();
  const reduce = useReducedMotion();

  const attempts = useProgress((s) => s.attempts);
  const bookmarks = useProgress((s) => s.bookmarks);
  const record = useProgress((s) => s.recordAttempt);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const setLastLocation = useProgress((s) => s.setLastLocation);

  const focusQ = params.get("q");
  const focusQuestion = focusQ ? getQuestion(focusQ) : undefined;
  const [subject, setSubject] = useState<SubjectId | "all">((params.get("subject") as SubjectId) ?? focusQuestion?.subjectId ?? "all");
  const [chapter, setChapter] = useState<string>(params.get("chapter") ?? "all");
  const [topic, setTopic] = useState<string>(params.get("topic") ?? "all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [scope, setScope] = useState<Scope>("all");
  const [mode, setMode] = useState<Mode>("practice");
  const [showTimer, setShowTimer] = useState(false);
  const [seed, setSeed] = useState(0);

  // Keep filters in sync when navigating here with new query params.
  useEffect(() => {
    const s = params.get("subject") as SubjectId | null;
    const q = params.get("q");
    setSubject(s ?? (q ? (getQuestion(q)?.subjectId ?? "all") : "all"));
    setChapter(params.get("chapter") ?? "all");
    setTopic(params.get("topic") ?? "all");
  }, [params]);

  const pool = useMemo(() => {
    const answered = new Set(attempts.map((a) => a.questionId));
    const lastResult = new Map<string, boolean>();
    for (const a of attempts) lastResult.set(a.questionId, a.correct);
    const marked = new Set(bookmarks.filter((b) => b.kind === "question").map((b) => b.refId));
    let list = allQuestions.filter(
      (q) =>
        (subject === "all" || q.subjectId === subject) &&
        (chapter === "all" || q.chapterId === chapter) &&
        (topic === "all" || q.topic === topic) &&
        (difficulty === "all" || q.difficulty === difficulty) &&
        (scope === "all" ||
          (scope === "unanswered" && !answered.has(q.id)) ||
          (scope === "incorrect" && lastResult.get(q.id) === false) ||
          (scope === "bookmarked" && marked.has(q.id))),
    );
    if (seed > 0) {
      list = [...list];
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(((Math.sin(seed * 9301 + i * 49297) + 1) / 2) * (i + 1)) % (i + 1);
        [list[i], list[j]] = [list[j], list[i]];
      }
    }
    if (focusQ) {
      const idx = list.findIndex((q) => q.id === focusQ);
      if (idx > 0) list = [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
    }
    return list.map((q) => q.id);
    // Pool is fixed per filter selection; attempts/bookmarks only matter for scoped filters at selection time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, chapter, topic, difficulty, scope, seed, focusQ, ready]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [finished, setFinished] = useState(false);
  const [flags, setFlags] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const questionStart = useRef<number>(0);

  // Reset the session whenever the pool changes.
  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setFinished(false);
    setFlags([]);
    setStartedAt(Date.now());
    questionStart.current = Date.now();
  }, [pool, mode]);

  const qid = pool[index];
  const q = qid ? getQuestion(qid) : undefined;
  const answer = qid ? answers[qid] : undefined;
  const elapsed = useElapsed(startedAt, showTimer && !finished);
  const marked = !!q && bookmarks.some((b) => b.kind === "question" && b.refId === q.id);
  const answeredCount = Object.values(answers).filter((a) => (mode === "practice" ? a.submitted : a.selected)).length;

  useEffect(() => {
    questionStart.current = Date.now();
  }, [index]);

  useEffect(() => {
    if (!ready) return;
    const qs = new URLSearchParams();
    if (subject !== "all") qs.set("subject", subject);
    if (chapter !== "all") qs.set("chapter", chapter);
    setLastLocation({
      href: `/practice${qs.size ? `?${qs}` : ""}`,
      title: subject === "all" ? "Mixed practice set" : `${subjects.find((s) => s.id === subject)?.code} practice set`,
      subtitle: "Practice",
      kind: "practice",
    });
  }, [ready, subject, chapter, setLastLocation]);

  const select = useCallback(
    (c: ChoiceId) => {
      if (!qid || answers[qid]?.submitted || finished) return;
      setAnswers((a) => ({ ...a, [qid]: { selected: c, submitted: false, seconds: a[qid]?.seconds ?? 0 } }));
    },
    [qid, answers, finished],
  );

  const submit = useCallback(() => {
    if (!q || !answer?.selected || answer.submitted) return;
    const seconds = Math.round((Date.now() - questionStart.current) / 1000);
    setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], submitted: true, seconds } }));
    record({ questionId: q.id, subjectId: q.subjectId, topic: q.topic, selected: answer.selected, correct: answer.selected === q.answer, seconds, mode: "practice" });
  }, [q, answer, record]);

  const finishExamSet = () => {
    // Record every answered item once, then reveal results.
    for (const id of pool) {
      const a = answers[id];
      const qq = getQuestion(id);
      if (!qq || !a?.selected || a.submitted) continue;
      record({ questionId: id, subjectId: qq.subjectId, topic: qq.topic, selected: a.selected, correct: a.selected === qq.answer, seconds: a.seconds, mode: "practice" });
    }
    setAnswers((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, submitted: true }])));
    setFinished(true);
    setIndex(0);
  };

  const go = useCallback((d: number) => setIndex((i) => Math.max(0, Math.min(pool.length - 1, i + d))), [pool.length]);

  // Keyboard: 1–4 / A–D select, Enter submits, ←/→ navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input[type=text],input[type=search],textarea,[role=combobox],[role=dialog]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, ChoiceId> = { "1": "A", "2": "B", "3": "C", "4": "D", a: "A", b: "B", c: "C", d: "D" };
      const k = e.key.toLowerCase();
      if (map[k]) {
        select(map[k]);
        e.preventDefault();
      } else if (e.key === "Enter" && mode === "practice" && !(t instanceof HTMLButtonElement)) {
        submit();
      } else if (e.key === "ArrowRight" && !(t instanceof HTMLInputElement)) go(1);
      else if (e.key === "ArrowLeft" && !(t instanceof HTMLInputElement)) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select, submit, go, mode]);

  const chapters = subject === "all" ? [] : (subjects.find((s) => s.id === subject)?.chapters ?? []);
  const topicOptions = Array.from(new Set(allQuestions.filter((x) => (subject === "all" || x.subjectId === subject) && (chapter === "all" || x.chapterId === chapter)).map((x) => x.topic)));

  const filters = (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Mode</p>
        <Segmented
          label="Learning mode"
          value={mode}
          onChange={setMode}
          className="w-full [&>*]:flex-1"
          options={[
            { value: "practice", label: "Practice", icon: <GraduationCap /> },
            { value: "exam", label: "Exam", icon: <Timer /> },
          ]}
        />
        <p className="text-[11px] leading-4 text-faint">
          {mode === "practice" ? "Instant feedback and full solutions after each answer." : "Answers stay hidden until you finish the set."}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Subject</p>
        <Select
          label="Subject"
          value={subject}
          onChange={(v) => {
            setSubject(v as SubjectId | "all");
            setChapter("all");
            setTopic("all");
          }}
          className="w-full"
          options={[{ value: "all", label: "All subjects" }, ...subjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.shortName}` }))]}
        />
      </div>
      {chapters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted">Chapter</p>
          <Select
            label="Chapter"
            value={chapter}
            onChange={(v) => {
              setChapter(v);
              setTopic("all");
            }}
            className="w-full"
            options={[{ value: "all", label: "All chapters" }, ...chapters.map((c) => ({ value: c.id, label: `${c.number}. ${c.title}` }))]}
          />
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Topic</p>
        <Select label="Topic" value={topic} onChange={setTopic} className="w-full" options={[{ value: "all", label: "All topics" }, ...topicOptions.map((t) => ({ value: t, label: t }))]} />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Difficulty</p>
        <Segmented
          size="sm"
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          className="w-full [&>*]:flex-1"
          options={[
            { value: "all", label: "Any" },
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Show</p>
        <Select
          label="Question scope"
          value={scope}
          onChange={(v) => setScope(v as Scope)}
          className="w-full"
          options={[
            { value: "all", label: "All questions" },
            { value: "unanswered", label: "Not yet attempted" },
            { value: "incorrect", label: "Last answered incorrectly" },
            { value: "bookmarked", label: "Bookmarked" },
          ]}
        />
      </div>
      <label className="flex items-center justify-between gap-3 rounded-lg border border-line bg-subtle/40 px-3 py-2.5">
        <span className="text-[13px]">Show timer</span>
        <Switch checked={showTimer} onCheckedChange={setShowTimer} aria-label="Show timer" />
      </label>
      <Button variant="outline" size="sm" className="w-full" onClick={() => setSeed((s) => s + 1)}>
        <Shuffle /> Shuffle questions
      </Button>
    </div>
  );

  const examScore = finished ? pool.filter((id) => answers[id]?.selected === getQuestion(id)?.answer).length : 0;

  return (
    <PageContainer wide>
      <PageHeader
        title="Practice Questions"
        description="Original CELE-style problems with step-by-step solutions. Use filters to target exactly what you need."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter /> Filters
              </Button>
            </DialogTrigger>
            <SheetContent side="bottom" title="Practice filters">
              <div className="p-5 pt-1">{filters}</div>
            </SheetContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_15rem]">
        <aside className="hidden lg:block" aria-label="Practice filters">
          <Card className="sticky top-24 p-5">{filters}</Card>
        </aside>

        <section aria-label="Question" className="min-w-0">
          {pool.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No questions match these filters"
                description="Try widening the subject, topic or difficulty, or switch the scope back to all questions."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubject("all");
                      setChapter("all");
                      setTopic("all");
                      setDifficulty("all");
                      setScope("all");
                      router.replace("/practice");
                    }}
                  >
                    <RotateCcw /> Reset filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <>
              {finished && mode === "exam" && (
                <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-display text-lg font-semibold">
                      Set complete: {examScore}/{pool.length} correct ({pct(examScore, pool.length)}%)
                    </p>
                    <p className="text-[13px] text-muted">Review each item below — solutions are now visible.</p>
                  </div>
                  <Button variant="outline" onClick={() => setSeed((s) => s + 1)}>
                    <RotateCcw /> New set
                  </Button>
                </Card>
              )}
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
                  <p className="font-mono text-[13px] font-medium tabular">
                    {String(index + 1).padStart(2, "0")} <span className="text-faint">/ {String(pool.length).padStart(2, "0")}</span>
                  </p>
                  {q && <QuestionMeta q={q} className="hidden sm:flex" />}
                  <div className="ml-auto flex items-center gap-1">
                    {showTimer && (
                      <span className="mr-1 inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-xs tabular" aria-label={`Elapsed time ${formatDuration(elapsed)}`}>
                        <Timer className="size-3.5 text-primary-text" /> {formatDuration(elapsed)}
                      </span>
                    )}
                    <Tooltip content={marked ? "Remove bookmark" : "Bookmark question"}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-pressed={marked}
                        aria-label={marked ? "Remove bookmark" : "Bookmark question"}
                        onClick={() => q && toast(toggleBookmark("question", q.id) ? "Question bookmarked" : "Bookmark removed")}
                      >
                        {marked ? <BookmarkCheck className="text-primary-text" /> : <Bookmark />}
                      </Button>
                    </Tooltip>
                    {qid && (
                      <Tooltip content={flags.includes(qid) ? "Unflag" : "Flag for review"}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-pressed={flags.includes(qid)}
                          aria-label={flags.includes(qid) ? "Remove review flag" : "Flag for review"}
                          onClick={() => setFlags((f) => (f.includes(qid) ? f.filter((x) => x !== qid) : [...f, qid]))}
                        >
                          <Flag className={flags.includes(qid) ? "fill-warning text-warning" : undefined} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <ProgressBar value={pct(answeredCount, pool.length)} size="sm" className="rounded-none" label="Set progress" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={qid}
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.18, ease: ease.outQuart }}
                    className="p-4 sm:p-6"
                  >
                    {q && (
                      <>
                        <QuestionMeta q={q} className="mb-4 sm:hidden" />
                        <QuestionBody q={q} name={`practice-${q.id}`} selected={answer?.selected} onSelect={select} revealed={!!answer?.submitted} size="lg" />
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/30 px-4 py-3 sm:px-5">
                  <Button variant="ghost" onClick={() => go(-1)} disabled={index === 0}>
                    <ArrowLeft /> <span className="hidden xs:inline">Previous</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    {mode === "practice" && !answer?.submitted && (
                      <Button onClick={submit} disabled={!answer?.selected}>
                        Submit answer
                      </Button>
                    )}
                    {mode === "exam" && !finished && (index === pool.length - 1 || answeredCount === pool.length) && (
                      <Button onClick={finishExamSet} variant="iris">
                        Finish set ({answeredCount}/{pool.length})
                      </Button>
                    )}
                  </div>
                  <Button variant={answer?.submitted ? "primary" : "ghost"} onClick={() => go(1)} disabled={index >= pool.length - 1}>
                    <span className="hidden xs:inline">Next</span> <ArrowRight />
                  </Button>
                </div>
              </Card>

              {q && answer?.submitted && (
                <Card className="mt-4 p-4 sm:p-6">
                  <SolutionPanel q={q} selected={answer.selected} />
                </Card>
              )}
              <p className="mt-4 hidden items-center gap-2 text-xs text-faint sm:flex">
                <Keyboard className="size-3.5" aria-hidden /> <Kbd>1</Kbd>–<Kbd>4</Kbd> select · <Kbd>Enter</Kbd> submit · <Kbd>←</Kbd>
                <Kbd>→</Kbd> navigate
              </p>
            </>
          )}
        </section>

        {pool.length > 0 && (
          <aside className="hidden xl:block" aria-label="Question navigator">
            <Card className="sticky top-24 p-4">
              <p className="text-xs font-medium text-muted">Question navigator</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {pool.map((id, i) => {
                  const a = answers[id];
                  const qq = getQuestion(id);
                  const state = a?.submitted ? (a.selected === qq?.answer ? "correct" : "wrong") : a?.selected ? "selected" : "todo";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Question ${i + 1}${state === "correct" ? ", correct" : state === "wrong" ? ", incorrect" : state === "selected" ? ", answered" : ""}`}
                      aria-current={i === index ? "step" : undefined}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md font-mono text-[11px] transition-colors",
                        state === "todo" && "border border-line text-muted hover:border-line-strong",
                        state === "selected" && "bg-primary-soft text-primary-text",
                        state === "correct" && "bg-success-soft text-success",
                        state === "wrong" && "bg-danger-soft text-danger",
                        i === index && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                        "relative",
                      )}
                    >
                      {i + 1}
                      {flags.includes(id) && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-warning" aria-label="flagged" />}
                    </button>
                  );
                })}
              </div>
              <ul className="mt-4 space-y-1.5 text-[11px] text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-success" /> Correct
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="size-3.5 text-danger" /> Incorrect
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-3.5 rounded bg-primary-soft" /> Answered
                </li>
                <li className="flex items-center gap-2">
                  <span className="ml-1 size-2 rounded-full bg-warning" /> Flagged for review
                </li>
              </ul>
              <div className="mt-4 border-t border-line pt-3 text-xs text-muted">
                <Link href="/exams" className="font-medium text-primary-text hover:underline">
                  Want strict timing? Take a mock exam →
                </Link>
              </div>
            </Card>
          </aside>
        )}
      </div>
      {mode === "exam" && !finished && pool.length > 0 && (
        <p className="mt-4 text-center">
          <Badge tone="iris">Exam mode — answers and solutions appear after you finish the set</Badge>
        </p>
      )}
    </PageContainer>
  );
}
