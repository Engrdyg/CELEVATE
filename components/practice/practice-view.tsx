"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Crosshair,
  Flag,
  Keyboard,
  Layers,
  Play,
  RotateCcw,
  SearchX,
  Settings2,
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
import { EmptyState } from "@/components/ui/states";
import { Tooltip } from "@/components/ui/tooltip";
import { QuestionBody, QuestionMeta, SolutionPanel } from "./question-card";
import { subjects, type SubjectId } from "@/lib/content";
import { catalog, getCatalogEntry } from "@/lib/qbank/catalog";
import { examConfig, taxonomy, topicTitle } from "@/lib/qbank/taxonomy";
import { ApiError, qbankApi, type PublicQuestion, type ReviewQuestion, type StartResponse } from "@/lib/qbank/client";
import type { ChoiceKey, QDifficulty } from "@/lib/qbank/schema";
import type { GradedItem } from "@/lib/qbank/engine";
import { useProgress } from "@/lib/store/progress";
import { weaknessWeights } from "@/lib/analytics";
import { useStoreReady } from "@/hooks/use-hydrated";
import { useElapsed } from "@/hooks/use-elapsed";
import { ease } from "@/lib/motion";
import { cn, formatDuration, pct } from "@/lib/utils";

type PracticeMode = "topic" | "subject" | "random" | "weakness" | "timed";
type Feedback = "instant" | "end";

interface Config {
  mode: PracticeMode;
  subject: SubjectId | "all";
  topic: string;
  difficulty: QDifficulty | "all";
  count: number;
  minutes: number;
  feedback: Feedback;
  includeId?: string;
}

interface Checked {
  item: Pick<GradedItem, "isCorrect" | "answer" | "selected">;
  review: ReviewQuestion;
  revealToken: string | null;
}

interface ActiveSet {
  start: StartResponse;
  index: number;
  answers: Record<string, ChoiceKey>;
  times: Record<string, number>;
  flags: string[];
  checked: Record<string, Checked>;
  /** End-of-set grading. */
  finished: boolean;
  revealToken: string | null;
  score?: { correct: number; total: number; percent: number };
}

const MODES: { value: PracticeMode; label: string; hint: string }[] = [
  { value: "topic", label: "By topic", hint: "Drill one syllabus topic." },
  { value: "subject", label: "By subject", hint: "Mixed questions from one CELE subject." },
  { value: "random", label: "Random", hint: "Any published question, all subjects." },
  { value: "weakness", label: "Weak areas", hint: "Weighted toward topics where your accuracy is lowest." },
  { value: "timed", label: "Timed", hint: "Countdown with auto-submit; answers revealed at the end." },
];

const firstTopic = (subject: SubjectId | "all") => {
  const s = taxonomy.subjects.find((x) => x.id === (subject === "all" ? "mste" : subject))!;
  return s.topics.find((t) => catalog.some((c) => c.topic === t.id))?.id ?? s.topics[0].id;
};

function configFromParams(params: URLSearchParams): { cfg: Config; auto: boolean } {
  const focus = params.get("q") ? getCatalogEntry(params.get("q")!) : undefined;
  const topicParam = params.get("topic");
  const topicSubject = topicParam ? (taxonomy.subjects.find((s) => s.topics.some((t) => t.id === topicParam))?.id as SubjectId | undefined) : undefined;
  const subject = ((params.get("subject") as SubjectId | null) ?? focus?.subject ?? topicSubject ?? "all") as SubjectId | "all";
  const modeParam = params.get("mode") as PracticeMode | null;
  const mode: PracticeMode = focus ? "topic" : modeParam && MODES.some((m) => m.value === modeParam) ? modeParam : params.get("subject") ? "subject" : "random";
  return {
    cfg: {
      mode,
      subject: mode === "topic" && subject === "all" ? "mste" : subject,
      topic: focus?.topic ?? topicParam ?? firstTopic(subject),
      difficulty: "all",
      count: 10,
      minutes: 20,
      feedback: mode === "timed" ? "end" : "instant",
      includeId: focus?.id,
    },
    auto: !!focus || !!modeParam || !!params.get("subject"),
  };
}

/** Remount on query changes so the config initializes from the URL without syncing effects. */
export function PracticeView() {
  const params = useSearchParams();
  return <Practice key={params.toString()} />;
}

function Practice() {
  const params = useSearchParams();
  const ready = useStoreReady();
  const [{ cfg: initialCfg, auto }] = useState(() => configFromParams(new URLSearchParams(params.toString())));
  const [cfg, setCfg] = useState<Config>(initialCfg);
  const [set, setSet] = useState<ActiveSet | null>(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState<string | null>(null);
  const setLastLocation = useProgress((s) => s.setLastLocation);

  const start = useCallback(async (c: Config) => {
    const state = useProgress.getState();
    const recentIds = [...state.attempts]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, examConfig.recentExclusionWindow)
      .map((a) => a.questionId);
    const mode = c.mode;
    setLoading(true);
    setError(null);
    try {
      const res = await qbankApi.start({
        mode,
        subjects: c.subject !== "all" && mode !== "topic" ? [c.subject] : undefined,
        topics: mode === "topic" ? [c.topic] : undefined,
        difficulties: c.difficulty !== "all" ? [c.difficulty] : undefined,
        count: c.count,
        minutes: mode === "timed" ? c.minutes : undefined,
        feedback: mode === "timed" ? "end" : c.feedback,
        topicWeights: mode === "weakness" ? weaknessWeights(state) : undefined,
        recentIds: Array.from(new Set(recentIds)).filter((id) => id !== c.includeId),
        includeIds: c.includeId ? [c.includeId] : undefined,
        title: mode === "topic" ? `${topicTitle(c.topic)} practice` : undefined,
      });
      setSet({ start: res, index: 0, answers: {}, times: {}, flags: [], checked: {}, finished: false, revealToken: null });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Deep links (recommendations, "practice this question") start immediately.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!ready || !auto || autoStarted.current) return;
    autoStarted.current = true;
    void start(initialCfg);
  }, [ready, auto, initialCfg, start]);

  useEffect(() => {
    if (!ready) return;
    const qs = new URLSearchParams({ mode: cfg.mode });
    if (cfg.mode === "topic") qs.set("topic", cfg.topic);
    else if (cfg.subject !== "all") qs.set("subject", cfg.subject);
    setLastLocation({
      href: `/practice?${qs}`,
      title: cfg.mode === "topic" ? `${topicTitle(cfg.topic)} practice` : cfg.subject === "all" ? "Mixed practice set" : `${subjects.find((s) => s.id === cfg.subject)?.code} practice set`,
      subtitle: "Practice",
      kind: "practice",
    });
  }, [ready, cfg.mode, cfg.topic, cfg.subject, setLastLocation]);

  return (
    <PageContainer wide>
      <PageHeader
        title="Practice Questions"
        description="Original CELE-style problems from the verified question bank, each with a step-by-step solution."
        actions={
          set ? (
            <Button variant="outline" onClick={() => setSet(null)}>
              <Settings2 /> New set
            </Button>
          ) : undefined
        }
      />
      {set ? (
        <SetRunner set={set} setSet={setSet} onRestart={() => start(cfg)} />
      ) : (
        <SetupPanel cfg={cfg} setCfg={setCfg} loading={loading} error={error} onStart={() => start(cfg)} />
      )}
    </PageContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

function SetupPanel({ cfg, setCfg, loading, error, onStart }: { cfg: Config; setCfg: (fn: (c: Config) => Config) => void; loading: boolean; error: string | null; onStart: () => void }) {
  const attempts = useProgress((s) => s.attempts);
  const ready = useStoreReady();
  const update = (patch: Partial<Config>) => setCfg((c) => ({ ...c, ...patch, includeId: undefined }));
  const topicSubject = cfg.subject === "all" ? "mste" : cfg.subject;
  const topics = taxonomy.subjects.find((s) => s.id === topicSubject)!.topics;

  const available = useMemo(
    () =>
      catalog.filter(
        (q) =>
          (cfg.mode === "topic" ? q.topic === cfg.topic : cfg.subject === "all" || q.subject === cfg.subject) &&
          (cfg.difficulty === "all" || q.difficulty === cfg.difficulty),
      ).length,
    [cfg.mode, cfg.topic, cfg.subject, cfg.difficulty],
  );
  const needsHistory = cfg.mode === "weakness" && ready && attempts.length < 5;
  const modeInfo = MODES.find((m) => m.value === cfg.mode)!;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Build a practice set</h2>
        <p className="mt-1 text-[13px] text-muted">Questions are drawn from published, independently recomputed items. Choices are shuffled for every set.</p>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted">Mode</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Practice mode">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={cfg.mode === m.value}
                  onClick={() => update({ mode: m.value, feedback: m.value === "timed" ? "end" : cfg.feedback, subject: m.value === "topic" && cfg.subject === "all" ? "mste" : cfg.subject })}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    cfg.mode === m.value ? "border-primary bg-primary-soft text-primary-text" : "border-line hover:border-line-strong",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-faint">{modeInfo.hint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cfg.mode !== "random" && cfg.mode !== "weakness" && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Subject</p>
                <Select
                  label="Subject"
                  value={cfg.mode === "topic" ? topicSubject : cfg.subject}
                  onChange={(v) => update({ subject: v as SubjectId | "all", topic: firstTopic(v as SubjectId | "all") })}
                  className="w-full"
                  options={[...(cfg.mode === "topic" || cfg.mode === "subject" ? [] : [{ value: "all", label: "All subjects" }]), ...subjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.shortName}` }))]}
                />
              </div>
            )}
            {cfg.mode === "topic" && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Topic</p>
                <Select
                  label="Topic"
                  value={cfg.topic}
                  onChange={(v) => update({ topic: v })}
                  className="w-full"
                  options={topics.map((t) => ({ value: t.id, label: `${t.title} (${catalog.filter((c) => c.topic === t.id).length})` }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted">Difficulty</p>
              <Segmented
                size="sm"
                label="Difficulty"
                value={cfg.difficulty}
                onChange={(v) => update({ difficulty: v })}
                className="w-full [&>*]:flex-1"
                options={[
                  { value: "all", label: "Any" },
                  { value: "easy", label: "Easy" },
                  { value: "moderate", label: "Moderate" },
                  { value: "difficult", label: "Difficult" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted">Questions</p>
              <Segmented
                size="sm"
                label="Number of questions"
                value={String(cfg.count)}
                onChange={(v) => update({ count: Number(v) })}
                className="w-full [&>*]:flex-1"
                options={["5", "10", "20", "30"].map((n) => ({ value: n, label: n }))}
              />
            </div>
            {cfg.mode === "timed" ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Time limit</p>
                <Segmented
                  size="sm"
                  label="Time limit in minutes"
                  value={String(cfg.minutes)}
                  onChange={(v) => update({ minutes: Number(v) })}
                  className="w-full [&>*]:flex-1"
                  options={["10", "20", "30", "60"].map((n) => ({ value: n, label: `${n} min` }))}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted">Feedback</p>
                <Segmented
                  size="sm"
                  label="Feedback"
                  value={cfg.feedback}
                  onChange={(v) => update({ feedback: v })}
                  className="w-full [&>*]:flex-1"
                  options={[
                    { value: "instant", label: "After each" },
                    { value: "end", label: "At the end" },
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
        {needsHistory && (
          <p className="mt-5 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-[13px] text-fg">
            Weak-area practice uses your own answer history. You have {attempts.length} recorded answer{attempts.length === 1 ? "" : "s"} — untested topics are prioritised until you answer more.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Button onClick={onStart} loading={loading} disabled={available === 0}>
            <Play /> Start {Math.min(cfg.count, available || cfg.count)}-question set
          </Button>
          <p className="text-[13px] text-muted">
            {available} published question{available === 1 ? "" : "s"} match{available === 1 ? "es" : ""}
            {cfg.mode === "random" || cfg.mode === "weakness" ? " across all subjects" : ""}.
          </p>
        </div>
      </Card>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 font-display text-[14px] font-semibold">
          <Layers className="size-4 text-primary-text" /> Question bank
        </h3>
        <ul className="mt-3 space-y-2.5">
          {subjects.map((s) => {
            const n = catalog.filter((c) => c.subject === s.id).length;
            return (
              <li key={s.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate">
                  <span className="font-mono text-[11px] text-faint">{s.code}</span> {s.shortName}
                </span>
                <span className="font-mono tabular text-muted">{n}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-faint">
          Every answer is recomputed by an independent script before publishing. Items are still awaiting review by a licensed civil engineer; report anything that looks wrong.
        </p>
        <Link href="/exams" className="mt-3 inline-block text-[13px] font-medium text-primary-text hover:underline">
          Want board conditions? Take a mock exam →
        </Link>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Running a set                                                      */
/* ------------------------------------------------------------------ */

function useCountdown(deadline: number | null, running: boolean) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!deadline || !running) return;
    const tick = () => setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [deadline, running]);
  return deadline ? left : null;
}

function SetRunner({ set, setSet, onRestart }: { set: ActiveSet; setSet: React.Dispatch<React.SetStateAction<ActiveSet | null>>; onRestart: () => void }) {
  const reduce = useReducedMotion();
  const record = useProgress((s) => s.recordAttempt);
  const bookmarks = useProgress((s) => s.bookmarks);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const [busy, setBusy] = useState(false);
  const { start, index, answers, flags, checked, finished } = set;
  const questions = start.questions;
  const q = questions[index];
  const instant = start.feedback === "instant";
  const check = checked[q.id];
  const elapsed = useElapsed(start.sessionId, !finished);
  const left = useCountdown(start.deadline, !finished);
  const questionStart = useRef(0);
  const marked = bookmarks.some((b) => b.kind === "question" && b.refId === q.id);
  const answeredCount = instant ? Object.keys(checked).length : Object.keys(answers).length;
  const update = useCallback((fn: (s: ActiveSet) => ActiveSet) => setSet((s) => (s ? fn(s) : s)), [setSet]);

  useEffect(() => {
    questionStart.current = Date.now();
  }, [index, start.sessionId]);

  const spent = useCallback(() => Math.max(0, Math.round((Date.now() - questionStart.current) / 1000)), []);

  const select = useCallback(
    (c: ChoiceKey) => {
      if (finished || checked[q.id]) return;
      update((s) => ({ ...s, answers: { ...s.answers, [q.id]: c } }));
    },
    [finished, checked, q.id, update],
  );

  const checkAnswer = useCallback(async () => {
    const choice = answers[q.id];
    if (!choice || checked[q.id] || busy) return;
    setBusy(true);
    try {
      const seconds = spent();
      const r = await qbankApi.check(start.token, q.id, choice);
      update((s) => ({ ...s, checked: { ...s.checked, [q.id]: { item: r.item, review: r.review, revealToken: r.revealToken } }, times: { ...s.times, [q.id]: seconds }, revealToken: r.revealToken }));
      record({ questionId: q.id, subjectId: q.subject, topic: q.topic, subtopic: q.subtopic, difficulty: q.difficulty, selected: choice, correct: r.item.isCorrect, seconds, mode: "practice" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [answers, checked, busy, q, start.token, spent, update, record]);

  const finish = useCallback(
    async (auto = false) => {
      if (finished || busy) return;
      setBusy(true);
      const times = { ...set.times, [q.id]: (set.times[q.id] ?? 0) + spent() };
      try {
        const result = await qbankApi.submit({ token: start.token, answers, flagged: flags, times, auto });
        const review = result.revealSolutions ? await qbankApi.review(result.resultToken) : null;
        const reviews = new Map(review?.items.map((it) => [it.graded.id, it.question as ReviewQuestion]) ?? []);
        for (const it of result.items) {
          if (!it.selected) continue;
          record({ questionId: it.id, subjectId: it.subject, topic: it.topic, subtopic: it.subtopic, difficulty: it.difficulty, selected: it.selected, correct: it.isCorrect, seconds: times[it.id] ?? 0, mode: "practice" });
        }
        update((s) => ({
          ...s,
          finished: true,
          index: 0,
          revealToken: result.revealToken,
          score: { correct: result.score.correct, total: result.score.total, percent: result.score.percent },
          checked: Object.fromEntries(
            result.items.filter((it) => reviews.has(it.id)).map((it) => [it.id, { item: { isCorrect: it.isCorrect, answer: it.answer!, selected: it.selected }, review: reviews.get(it.id)!, revealToken: review?.revealToken ?? result.revealToken }]),
          ),
        }));
        if (auto) toast("Time's up — your set was submitted automatically");
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Couldn't submit the set. Your answers are still here — try again.");
      } finally {
        setBusy(false);
      }
    },
    [finished, busy, set.times, q.id, spent, start.token, answers, flags, record, update],
  );

  // Auto-submit timed sets when the clock reaches zero.
  useEffect(() => {
    if (left !== 0 || finished || !start.autoSubmit) return;
    const t = window.setTimeout(() => void finish(true), 0);
    return () => window.clearTimeout(t);
  }, [left, finished, start.autoSubmit, finish]);

  const go = useCallback(
    (d: number) => {
      const seconds = spent();
      update((s) => {
        const next = Math.max(0, Math.min(s.start.questions.length - 1, s.index + d));
        if (next === s.index) return s;
        return { ...s, index: next, times: s.checked[q.id] || s.finished ? s.times : { ...s.times, [q.id]: (s.times[q.id] ?? 0) + seconds } };
      });
    },
    [spent, update, q.id],
  );
  const jump = (i: number) => go(i - index);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input[type=text],input[type=search],textarea,[role=combobox],[role=dialog],[role=menu]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 }[e.key.toLowerCase()];
      if (n !== undefined && q.choices[n]) {
        select(q.choices[n].id);
        e.preventDefault();
      } else if (e.key === "Enter" && instant && !(t instanceof HTMLButtonElement) && !(t instanceof HTMLAnchorElement)) void checkAnswer();
      else if (e.key === "ArrowRight" && !(t instanceof HTMLInputElement)) go(1);
      else if (e.key === "ArrowLeft" && !(t instanceof HTMLInputElement)) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, select, checkAnswer, go, instant]);

  const status = (x: PublicQuestion) => {
    const c = checked[x.id];
    if (c) return c.item.isCorrect ? "correct" : c.item.selected ? "wrong" : "skipped";
    if (finished) return "skipped";
    return answers[x.id] ? "selected" : "todo";
  };
  const lowTime = left !== null && left <= 60;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <section aria-label="Question" className="min-w-0">
        {finished && set.score && (
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-lg font-semibold">
                Set complete: {set.score.correct}/{set.score.total} correct ({set.score.percent}%)
              </p>
              <p className="text-[13px] text-muted">Step through each item — solutions are now visible.</p>
            </div>
            <Button variant="outline" onClick={onRestart}>
              <Shuffle /> Another set like this
            </Button>
          </Card>
        )}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
            <p className="font-mono text-[13px] font-medium tabular">
              {String(index + 1).padStart(2, "0")} <span className="text-faint">/ {String(questions.length).padStart(2, "0")}</span>
            </p>
            <QuestionMeta q={q} className="hidden sm:flex" />
            <div className="ml-auto flex items-center gap-1">
              {left !== null && !finished ? (
                <span
                  className={cn("mr-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs tabular", lowTime ? "border-danger/40 text-danger" : "border-line")}
                  role="timer"
                  aria-label={`Time remaining ${formatDuration(left)}`}
                >
                  <Timer className="size-3.5" /> {formatDuration(left)}
                </span>
              ) : (
                !finished && (
                  <span className="mr-1 inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-xs tabular text-muted" aria-label={`Elapsed time ${formatDuration(elapsed)}`}>
                    <Timer className="size-3.5 text-primary-text" /> {formatDuration(elapsed)}
                  </span>
                )
              )}
              <Tooltip content={marked ? "Remove bookmark" : "Bookmark question"}>
                <Button variant="ghost" size="icon-sm" aria-pressed={marked} aria-label={marked ? "Remove bookmark" : "Bookmark question"} onClick={() => toast(toggleBookmark("question", q.id) ? "Question bookmarked" : "Bookmark removed")}>
                  {marked ? <BookmarkCheck className="text-primary-text" /> : <Bookmark />}
                </Button>
              </Tooltip>
              <Tooltip content={flags.includes(q.id) ? "Unflag" : "Flag for review"}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={flags.includes(q.id)}
                  aria-label={flags.includes(q.id) ? "Remove review flag" : "Flag for review"}
                  onClick={() => update((s) => ({ ...s, flags: s.flags.includes(q.id) ? s.flags.filter((x) => x !== q.id) : [...s.flags, q.id] }))}
                >
                  <Flag className={flags.includes(q.id) ? "fill-warning text-warning" : undefined} />
                </Button>
              </Tooltip>
            </div>
          </div>
          <ProgressBar value={pct(answeredCount, questions.length)} size="sm" className="rounded-none" label="Set progress" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={q.id}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: ease.outQuart }}
              className="p-4 sm:p-6"
            >
              <QuestionMeta q={q} className="mb-4 sm:hidden" />
              <h2 className="sr-only">{q.title}</h2>
              <QuestionBody q={q} name={`practice-${start.sessionId}-${q.id}`} selected={check?.item.selected ?? answers[q.id]} onSelect={select} answer={check?.item.answer} disabled={finished} size="lg" />
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/30 px-4 py-3 sm:px-5">
            <Button variant="ghost" onClick={() => go(-1)} disabled={index === 0}>
              <ArrowLeft /> <span className="hidden xs:inline">Previous</span>
            </Button>
            <div className="flex items-center gap-2">
              {instant && !check && !finished && (
                <Button onClick={checkAnswer} disabled={!answers[q.id]} loading={busy}>
                  Check answer
                </Button>
              )}
              {!instant && !finished && (index === questions.length - 1 || answeredCount === questions.length) && (
                <Button onClick={() => finish(false)} variant="iris" loading={busy}>
                  Finish set ({answeredCount}/{questions.length})
                </Button>
              )}
            </div>
            <Button variant={check ? "primary" : "ghost"} onClick={() => go(1)} disabled={index >= questions.length - 1}>
              <span className="hidden xs:inline">Next</span> <ArrowRight />
            </Button>
          </div>
        </Card>

        {check && (
          <Card className="mt-4 p-4 sm:p-6">
            <SolutionPanel q={check.review} selected={check.item.selected} revealToken={check.revealToken} />
          </Card>
        )}
        {finished && !check && <Card className="mt-4 p-5 text-[13px] text-muted">The solution for this item isn&apos;t available right now.</Card>}
        {instant && Object.keys(checked).length === questions.length && (
          <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="font-display font-semibold">
              Set complete: {Object.values(checked).filter((c) => c.item.isCorrect).length}/{questions.length} correct
            </p>
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw /> Another set like this
            </Button>
          </Card>
        )}
        <p className="mt-4 hidden items-center gap-2 text-xs text-faint sm:flex">
          <Keyboard className="size-3.5" aria-hidden /> <Kbd>1</Kbd>–<Kbd>4</Kbd> select · {instant && (<><Kbd>Enter</Kbd> check · </>)}
          <Kbd>←</Kbd>
          <Kbd>→</Kbd> navigate
        </p>
      </section>

      <aside aria-label="Question navigator">
        <Card className="sticky top-24 p-4">
          <p className="text-xs font-medium text-muted">{start.title}</p>
          <p className="mt-0.5 text-[11px] text-faint">{instant ? "Feedback after each answer" : finished ? "Graded" : "Answers revealed when you finish"}</p>
          <div className="mt-3 grid grid-cols-6 gap-1.5 xl:grid-cols-5">
            {questions.map((x, i) => {
              const st = status(x);
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Question ${i + 1}${st === "correct" ? ", correct" : st === "wrong" ? ", incorrect" : st === "selected" ? ", answered" : st === "skipped" ? ", not answered" : ""}${flags.includes(x.id) ? ", flagged" : ""}`}
                  aria-current={i === index ? "step" : undefined}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-md font-mono text-[11px] transition-colors",
                    (st === "todo" || st === "skipped") && "border border-line text-muted hover:border-line-strong",
                    st === "selected" && "bg-primary-soft text-primary-text",
                    st === "correct" && "bg-success-soft text-success",
                    st === "wrong" && "bg-danger-soft text-danger",
                    i === index && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                  )}
                >
                  {i + 1}
                  {flags.includes(x.id) && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-warning" aria-hidden />}
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
          {!instant && !finished && (
            <Button className="mt-4 w-full" variant="outline" size="sm" onClick={() => finish(false)} loading={busy}>
              <Crosshair /> Finish now ({answeredCount}/{questions.length})
            </Button>
          )}
        </Card>
      </aside>
      {questions.length === 0 && (
        <Card>
          <EmptyState icon={SearchX} title="No questions in this set" description="Try a different selection." />
        </Card>
      )}
      {!instant && !finished && (
        <p className="text-center xl:col-span-2">
          <Badge tone="iris">Answers and solutions appear after you finish the set</Badge>
        </p>
      )}
    </div>
  );
}
