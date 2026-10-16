"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Cell } from "recharts";
import { ArrowLeft, ArrowRight, Clock, Flag, RotateCcw, Target, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { PageContainer } from "@/components/shell/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard, ChartTooltip, axisProps } from "@/components/charts/chart-card";
import { QuestionBody, SolutionPanel } from "@/components/practice/question-card";
import { plainText } from "@/components/math/rich-text";
import { getQuestion, getSubject } from "@/lib/content";
import { scoreExam, submittedExams } from "@/lib/analytics";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { CELE_RULES } from "@/config/cele";
import { cn, formatDuration } from "@/lib/utils";

type ReviewFilter = "all" | "incorrect" | "skipped" | "flagged";

export function ExamResults() {
  const params = useSearchParams();
  const ready = useStoreReady();
  const id = params.get("id");
  const exams = useProgress((s) => s.exams);
  const state = useProgress();
  const [filter, setFilter] = useState<ReviewFilter>("all");

  const data = useMemo(() => {
    if (!ready) return null;
    const exam = exams.find((e) => e.id === id && e.status === "submitted") ?? submittedExams(state).at(-1);
    if (!exam) return null;
    const result = scoreExam(exam);
    const history = submittedExams(state).map(scoreExam);
    const i = history.findIndex((h) => h.exam.id === exam.id);
    return { result, history, prev: i > 0 ? history[i - 1] : undefined };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, exams, id]);

  if (!ready)
    return (
      <PageContainer>
        <CardSkeleton className="h-48" />
      </PageContainer>
    );
  if (!data)
    return (
      <PageContainer>
        <EmptyState
          icon={Trophy}
          title="No results found"
          description="This exam result isn't available in this browser. Take a mock exam to see a full breakdown."
          action={
            <Button asChild>
              <Link href="/exams">Go to Mock Board Exams</Link>
            </Button>
          }
        />
      </PageContainer>
    );

  const { result, history, prev } = data;
  const { exam } = result;
  const reveal = exam.config.revealSolutions;
  const skipped = exam.questionIds.filter((qid) => !exam.answers[qid]);
  const incorrect = exam.questionIds.filter((qid) => exam.answers[qid] && exam.answers[qid] !== getQuestion(qid)?.answer);
  const delta = prev ? result.percent - prev.percent : null;
  const strongest = [...result.byTopic].sort((a, b) => b.percent - a.percent).filter((t) => t.percent >= 60).slice(0, 3);
  const weakest = result.byTopic.filter((t) => t.percent < 60).slice(0, 3);
  const reviewIds = exam.questionIds.filter((qid) =>
    filter === "all" ? true : filter === "incorrect" ? incorrect.includes(qid) : filter === "skipped" ? skipped.includes(qid) : exam.flagged.includes(qid),
  );

  return (
    <PageContainer>
      <Link href="/exams" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Mock Board Exams
      </Link>

      {/* Score hero */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1" aria-labelledby="result-title">
        <div aria-hidden className="absolute inset-0 blueprint-grid opacity-50 [mask-image:linear-gradient(90deg,transparent_45%,#000)]" />
        <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_1fr] md:items-center">
          <ProgressRing value={result.percent} size={136} stroke={11} color={result.percent >= CELE_RULES.passingAverage ? "var(--success)" : result.percent >= 50 ? "var(--warning)" : "var(--danger)"} label={`Score ${result.percent} percent`}>
            <div className="text-center">
              <div className="font-display text-4xl font-semibold tabular">{result.percent}%</div>
              <div className="font-mono text-xs text-muted">
                {result.correct}/{result.total}
              </div>
            </div>
          </ProgressRing>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="iris">Mock board result</Badge>
              {exam.autoSubmitted && <Badge tone="warning">Auto-submitted at time limit</Badge>}
            </div>
            <h1 id="result-title" className="mt-2 font-display text-display-lg font-semibold">
              {exam.config.title}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              Submitted {new Date(exam.submittedAt!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Raw score", `${result.correct} / ${result.total}`],
                ["Answered", `${result.answered} / ${result.total}`],
                ["Time used", `${formatDuration(result.secondsUsed)} / ${exam.config.minutes}:00`],
                ["vs previous", delta == null ? "First attempt" : `${delta >= 0 ? "+" : ""}${delta} pts`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-surface/70 px-3 py-2.5">
                  <dt className="text-[11px] text-muted">{k}</dt>
                  <dd className={cn("mt-0.5 font-mono text-sm font-semibold", k === "vs previous" && delta != null && (delta >= 0 ? "text-success" : "text-danger"))}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] text-faint">
              The {CELE_RULES.passingAverage}% line is shown as a study reference only. {CELE_RULES.note}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Subject breakdown"
          description="Percentage correct per subject"
          table={{ columns: ["Subject", "Correct", "Items", "Score"], rows: result.bySubject.map((s) => [getSubject(s.subjectId)!.code, s.correct, s.total, `${s.percent}%`]) }}
        >
          <div className="h-56" role="img" aria-label="Bar chart of percentage correct by subject">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.bySubject.map((s) => ({ name: getSubject(s.subjectId)!.code, score: s.percent, id: s.subjectId }))} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                <XAxis type="number" domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" {...axisProps} width={48} />
                <ReferenceLine x={CELE_RULES.passingAverage} stroke="var(--fg-subtle)" strokeDasharray="4 4" label={{ value: `${CELE_RULES.passingAverage}%`, fill: "var(--fg-subtle)", fontSize: 10, position: "top" }} />
                <RTooltip cursor={{ fill: "var(--subtle)", opacity: 0.5 }} content={<ChartTooltip format={(v) => `${v}%`} />} />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {result.bySubject.map((s) => (
                    <Cell key={s.subjectId} fill={SUBJECT_COLOR[s.subjectId]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Previous examinations"
          description={history.length > 1 ? `${history.length} exams · this one highlighted` : "Take more exams to see your trend"}
          table={{ columns: ["Date", "Exam", "Score"], rows: history.map((h) => [new Date(h.exam.submittedAt!).toLocaleDateString(), h.exam.config.title, `${h.percent}%`]) }}
        >
          <div className="h-56" role="img" aria-label="Line chart of mock exam scores over time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.map((h, i) => ({ name: `#${i + 1}`, score: h.percent, current: h.exam.id === exam.id }))} margin={{ top: 8, right: 12, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} width={48} />
                <ReferenceLine y={CELE_RULES.passingAverage} stroke="var(--fg-subtle)" strokeDasharray="4 4" />
                <RTooltip cursor={{ stroke: "var(--line-strong)" }} content={<ChartTooltip format={(v) => `${v}%`} />} />
                <Line
                  dataKey="score"
                  name="Score"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={(p: { cx?: number; cy?: number; payload?: { current: boolean }; index?: number }) => (
                    <circle key={p.index} cx={p.cx} cy={p.cy} r={p.payload?.current ? 6 : 4} fill={p.payload?.current ? "var(--chart-2)" : "var(--card)"} stroke="var(--chart-2)" strokeWidth={2} />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Accuracy by topic</CardTitle>
              <CardDescription>Sorted from weakest to strongest</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.byTopic.map((t) => (
                <li key={`${t.subjectId}-${t.topic}`}>
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: SUBJECT_COLOR[t.subjectId] }} aria-hidden />
                      <span className="truncate">{t.topic}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {t.correct}/{t.total} · {t.percent}%
                    </span>
                  </div>
                  <ProgressBar value={t.percent} size="sm" tone={t.percent >= 70 ? "success" : t.percent >= 50 ? "warning" : "danger"} className="mt-1.5" label={`${t.topic} accuracy`} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
              <TrendingUp className="size-4" /> Strongest areas
            </p>
            {strongest.length ? (
              <ul className="mt-2 space-y-1 text-[13px]">
                {strongest.map((t) => (
                  <li key={t.topic} className="flex justify-between">
                    <span>{t.topic}</span>
                    <span className="font-mono text-xs text-muted">{t.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">No topic reached 60% yet — keep going.</p>
            )}
            <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-danger">
              <TrendingDown className="size-4" /> Weakest areas
            </p>
            {weakest.length ? (
              <ul className="mt-2 space-y-1 text-[13px]">
                {weakest.map((t) => (
                  <li key={t.topic} className="flex justify-between">
                    <span>{t.topic}</span>
                    <span className="font-mono text-xs text-muted">{t.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">No topics below 60%. Excellent.</p>
            )}
          </Card>
          <Card className="p-5">
            <p className="text-[13px] font-semibold">Review recommendations</p>
            <ul className="mt-3 space-y-2">
              {(weakest.length ? weakest : result.byTopic.slice(0, 2)).map((t) => (
                <li key={t.topic}>
                  <Link href={`/practice?subject=${t.subjectId}&topic=${encodeURIComponent(t.topic)}`} className="flex items-center gap-3 rounded-lg border border-line p-2.5 text-[13px] transition-colors hover:border-line-strong">
                    <Target className="size-4 shrink-0 text-primary-text" />
                    <span className="flex-1">Practice {t.topic}</span>
                    <ArrowRight className="size-4 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href="/exams">
                <RotateCcw /> Take another exam
              </Link>
            </Button>
          </Card>
        </div>
      </div>

      {/* Item review */}
      <Card className="mt-4">
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle>Item review</CardTitle>
            <CardDescription>
              {incorrect.length} incorrect · {skipped.length} skipped · {exam.flagged.length} marked for review
            </CardDescription>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ReviewFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
              <TabsTrigger value="skipped">Skipped</TabsTrigger>
              <TabsTrigger value="flagged">
                <Flag /> Flagged
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {!reveal && <p className="mb-4 rounded-lg bg-subtle px-3 py-2 text-xs text-muted">Solutions are hidden for this exam by its configured rules. Correctness is still shown.</p>}
          {reviewIds.length === 0 ? (
            <EmptyState compact icon={Clock} title="Nothing in this view" />
          ) : (
            <Accordion type="multiple" className="rounded-xl border border-line px-4">
              {reviewIds.map((qid) => {
                const q = getQuestion(qid);
                if (!q) return null;
                const n = exam.questionIds.indexOf(qid) + 1;
                const sel = exam.answers[qid];
                const ok = sel === q.answer;
                return (
                  <AccordionItem key={qid} value={qid}>
                    <AccordionTrigger>
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-md font-mono text-[11px] font-semibold",
                            ok ? "bg-success-soft text-success" : sel ? "bg-danger-soft text-danger" : "bg-subtle text-muted",
                          )}
                        >
                          {n}
                        </span>
                        <span className="line-clamp-1 text-left text-[13px] font-normal">{plainText(q.stem)}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-fg">
                      <QuestionBody q={q} name={`review-${qid}`} selected={sel} onSelect={() => {}} revealed={reveal} disabled />
                      {reveal ? (
                        <div className="mt-5 border-t border-line pt-5">
                          <SolutionPanel q={q} selected={sel ?? null} />
                        </div>
                      ) : (
                        <p className="mt-3 text-[13px]">{ok ? "Correct" : sel ? "Incorrect" : "Not answered"}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
