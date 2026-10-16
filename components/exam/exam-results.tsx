"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Cell } from "recharts";
import { ArrowLeft, ArrowRight, Clock, Flag, Info, RotateCcw, Target, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { PageContainer } from "@/components/shell/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard, ChartTooltip, axisProps } from "@/components/charts/chart-card";
import { QuestionBody, SolutionPanel } from "@/components/practice/question-card";
import { getSubject, type SubjectId } from "@/lib/content";
import { topicTitle } from "@/lib/qbank/taxonomy";
import { qbankApi, type ReviewItem, type ReviewQuestion } from "@/lib/qbank/client";
import { submittedExams } from "@/lib/analytics";
import { useProgress, type ExamSession, type StoredResult } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { CELE_RULES } from "@/config/cele";
import { cn, formatDuration } from "@/lib/utils";

type ReviewFilter = "all" | "incorrect" | "skipped" | "flagged";
const DIFF_ORDER = ["easy", "moderate", "difficult"];

export function ExamResults() {
  const params = useSearchParams();
  const ready = useStoreReady();
  const id = params.get("id");
  const exams = useProgress((s) => s.exams);

  const data = useMemo(() => {
    if (!ready) return null;
    const history = submittedExams({ exams } as Parameters<typeof submittedExams>[0]);
    const exam = history.find((e) => e.id === id) ?? history.at(-1);
    if (!exam?.result) return null;
    const i = history.findIndex((h) => h.id === exam.id);
    return { exam, result: exam.result, history, prev: i > 0 ? history[i - 1] : undefined };
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

  return <Results key={data.exam.id} {...data} />;
}

function Results({ exam, result, history, prev }: { exam: ExamSession; result: StoredResult; history: ExamSession[]; prev?: ExamSession }) {
  const delta = prev?.result ? Math.round((result.percent - prev.result.percent) * 10) / 10 : null;
  const limitMinutes = exam.deadline ? Math.round((new Date(exam.deadline).getTime() - new Date(exam.startedAt).getTime()) / 60000) : null;
  const byTopic = result.byTopic.filter((t) => t.total > 0);
  const strongest = [...byTopic].sort((a, b) => b.percent - a.percent || b.total - a.total).filter((t) => t.percent >= 60).slice(0, 3);
  const weakest = [...byTopic].sort((a, b) => a.percent - b.percent || b.total - a.total).filter((t) => t.percent < 60).slice(0, 3);
  const sample = !result.resultToken;
  const byDifficulty = [...result.byDifficulty].sort((a, b) => DIFF_ORDER.indexOf(a.key) - DIFF_ORDER.indexOf(b.key));

  return (
    <PageContainer>
      <Link href="/exams" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Mock Board Exams
      </Link>

      {/* Score hero */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1" aria-labelledby="result-title">
        <div aria-hidden className="absolute inset-0 blueprint-grid opacity-50 [mask-image:linear-gradient(90deg,transparent_45%,#000)]" />
        <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_1fr] md:items-center">
          <ProgressRing
            value={result.percent}
            size={136}
            stroke={11}
            color={result.percent >= CELE_RULES.passingAverage ? "var(--success)" : result.percent >= 50 ? "var(--warning)" : "var(--danger)"}
            label={`Score ${result.percent} percent`}
          >
            <div className="text-center">
              <div className="font-display text-4xl font-semibold tabular">{Math.round(result.percent)}%</div>
              <div className="font-mono text-xs text-muted">{result.rawScore}</div>
            </div>
          </ProgressRing>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="iris">Mock board result</Badge>
              {exam.autoSubmitted && <Badge tone="warning">Auto-submitted at time limit</Badge>}
              {result.late && <Badge tone="danger">Submitted after the time limit</Badge>}
              {sample && <Badge tone="outline">Sample data</Badge>}
            </div>
            <h1 id="result-title" className="mt-2 font-display text-display-lg font-semibold">
              {exam.title}
            </h1>
            <p className="mt-1 text-[13px] text-muted">Submitted {new Date(exam.submittedAt!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {[
                ["Correct", String(result.correct), "text-success"],
                ["Incorrect", String(result.incorrect), "text-danger"],
                ["Unanswered", String(result.unanswered), ""],
                ["Raw score", result.rawScore, ""],
                ["Time used", `${formatDuration(result.durationSeconds)}${limitMinutes ? ` / ${limitMinutes}m` : ""}`, ""],
                ["vs previous", delta == null ? "First attempt" : `${delta >= 0 ? "+" : ""}${delta} pts`, delta == null ? "" : delta >= 0 ? "text-success" : "text-danger"],
              ].map(([k, v, tone]) => (
                <div key={k} className="rounded-xl border border-line bg-surface/70 px-3 py-2.5">
                  <dt className="text-[11px] text-muted">{k}</dt>
                  <dd className={cn("mt-0.5 font-mono text-sm font-semibold", tone)}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] leading-4 text-faint">
              The {CELE_RULES.passingAverage}% line is a study reference only, not a prediction of your board result. {CELE_RULES.note}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Subject breakdown"
          description="Percentage correct per subject"
          table={{ columns: ["Subject", "Correct", "Items", "Score"], rows: result.bySubject.map((s) => [getSubject(s.key as SubjectId)?.code ?? s.key, s.correct, s.total, `${s.percent}%`]) }}
        >
          <div className="h-56" role="img" aria-label="Bar chart of percentage correct by subject">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.bySubject.map((s) => ({ name: getSubject(s.key as SubjectId)?.code ?? s.key, score: s.percent, id: s.key }))} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                <XAxis type="number" domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" {...axisProps} width={56} />
                <ReferenceLine x={CELE_RULES.passingAverage} stroke="var(--fg-subtle)" strokeDasharray="4 4" label={{ value: `${CELE_RULES.passingAverage}%`, fill: "var(--fg-subtle)", fontSize: 10, position: "top" }} />
                <RTooltip cursor={{ fill: "var(--subtle)", opacity: 0.5 }} content={<ChartTooltip format={(v) => `${v}%`} />} />
                <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {result.bySubject.map((s) => (
                    <Cell key={s.key} fill={SUBJECT_COLOR[s.key as SubjectId]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Previous examinations"
          description={history.length > 1 ? `${history.length} exams · this one highlighted` : "Take more exams to see your trend"}
          table={{ columns: ["Date", "Exam", "Score"], rows: history.map((h) => [new Date(h.submittedAt!).toLocaleDateString(), h.title, `${h.result!.percent}%`]) }}
        >
          <div className="h-56" role="img" aria-label="Line chart of mock exam scores over time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.map((h, i) => ({ name: `#${i + 1}`, score: h.result!.percent, current: h.id === exam.id }))} margin={{ top: 8, right: 12, left: 0 }}>
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
              <CardDescription>Sorted from weakest to strongest · small samples are noisy</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[...byTopic]
                .sort((a, b) => a.percent - b.percent)
                .map((t) => (
                  <li key={t.key}>
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="size-2 shrink-0 rounded-full" style={{ background: SUBJECT_COLOR[t.subject] }} aria-hidden />
                        <span className="truncate">{topicTitle(t.key)}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted">
                        {t.correct}/{t.total} · {t.percent}%
                      </span>
                    </div>
                    <ProgressBar value={t.percent} size="sm" tone={t.percent >= 70 ? "success" : t.percent >= 50 ? "warning" : "danger"} className="mt-1.5" label={`${topicTitle(t.key)} accuracy`} />
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-5">
            <p className="text-[13px] font-semibold">By difficulty</p>
            <ul className="mt-3 space-y-2.5">
              {byDifficulty.map((d) => (
                <li key={d.key}>
                  <div className="flex justify-between text-[13px]">
                    <span className="capitalize">{d.key}</span>
                    <span className="font-mono text-xs text-muted">
                      {d.correct}/{d.total} · {d.percent}%
                    </span>
                  </div>
                  <ProgressBar value={d.percent} size="sm" className="mt-1.5" label={`${d.key} accuracy`} />
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
              <TrendingUp className="size-4" /> Strongest areas
            </p>
            {strongest.length ? (
              <ul className="mt-2 space-y-1 text-[13px]">
                {strongest.map((t) => (
                  <li key={t.key} className="flex justify-between gap-3">
                    <span className="truncate">{topicTitle(t.key)}</span>
                    <span className="font-mono text-xs text-muted">{t.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">No topic reached 60% in this exam.</p>
            )}
            <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-danger">
              <TrendingDown className="size-4" /> Weakest areas
            </p>
            {weakest.length ? (
              <ul className="mt-2 space-y-1 text-[13px]">
                {weakest.map((t) => (
                  <li key={t.key} className="flex justify-between gap-3">
                    <span className="truncate">{topicTitle(t.key)}</span>
                    <span className="font-mono text-xs text-muted">{t.percent}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-muted">No topic fell below 60% in this exam.</p>
            )}
            <ul className="mt-5 space-y-2 border-t border-line pt-4">
              {(weakest.length ? weakest : byTopic.slice(0, 2)).map((t) => (
                <li key={t.key}>
                  <Link href={`/practice?mode=topic&topic=${encodeURIComponent(t.key)}`} className="flex items-center gap-3 rounded-lg border border-line p-2.5 text-[13px] transition-colors hover:border-line-strong">
                    <Target className="size-4 shrink-0 text-primary-text" />
                    <span className="flex-1">Practice {topicTitle(t.key)}</span>
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

      <ItemReview result={result} sample={sample} />
    </PageContainer>
  );
}

function ItemReview({ result, sample }: { result: StoredResult; sample: boolean }) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [review, setReview] = useState<{ items: ReviewItem[]; revealToken: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sample) return;
    let cancelled = false;
    qbankApi
      .review(result.resultToken)
      .then((r) => !cancelled && setReview({ items: r.items, revealToken: r.revealToken }))
      .catch((e) => !cancelled && setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [result.resultToken, sample]);

  const items = result.items.filter((i) =>
    filter === "all" ? true : filter === "incorrect" ? !i.isCorrect && i.selectedLabel : filter === "skipped" ? !i.selectedLabel : i.flagged,
  );
  const reviewById = new Map(review?.items.map((r) => [r.graded.id, r]) ?? []);
  const incorrect = result.incorrect;
  const flagged = result.items.filter((i) => i.flagged).length;

  return (
    <Card className="mt-4">
      <CardHeader className="flex-wrap">
        <div>
          <CardTitle>Item review</CardTitle>
          <CardDescription>
            {incorrect} incorrect · {result.unanswered} unanswered · {flagged} marked for review
          </CardDescription>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ReviewFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
            <TabsTrigger value="skipped">Unanswered</TabsTrigger>
            <TabsTrigger value="flagged">
              <Flag /> Flagged
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {sample && (
          <p className="mb-4 flex items-start gap-2 rounded-lg bg-subtle px-3 py-2 text-xs text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" /> This is generated sample data, so there are no questions to review. Take a real mock exam to see item-by-item solutions.
          </p>
        )}
        {!sample && !result.revealSolutions && (
          <p className="mb-4 rounded-lg bg-subtle px-3 py-2 text-xs text-muted">Solutions are hidden for this exam by its configured rules. Correctness is still shown.</p>
        )}
        {error && <p className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">Couldn&apos;t load the item review: {error}</p>}
        {items.length === 0 ? (
          <EmptyState compact icon={Clock} title="Nothing in this view" />
        ) : (
          <Accordion type="multiple" className="rounded-xl border border-line px-4">
            {items.map((i) => {
              const r = reviewById.get(i.id);
              return (
                <AccordionItem key={i.id} value={i.id}>
                  <AccordionTrigger>
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-md font-mono text-[11px] font-semibold",
                          i.isCorrect ? "bg-success-soft text-success" : i.selectedLabel ? "bg-danger-soft text-danger" : "bg-subtle text-muted",
                        )}
                      >
                        {i.position}
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="line-clamp-1 text-[13px] font-normal">{i.title}</span>
                        <span className="block text-[11px] font-normal text-faint">
                          {getSubject(i.subject)?.code} · {topicTitle(i.topic)} · <span className="capitalize">{i.difficulty}</span>
                          {i.selectedLabel ? ` · You: ${i.selectedLabel}` : " · Not answered"}
                          {i.answerLabel && !i.isCorrect ? ` · Key: ${i.answerLabel}` : ""}
                        </span>
                      </span>
                      {i.flagged && <Flag className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Marked for review" />}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-fg">
                    {sample ? (
                      <p className="text-[13px] text-muted">Sample item — no question content.</p>
                    ) : !r ? (
                      error ? (
                        <p className="text-[13px] text-muted">Unavailable.</p>
                      ) : (
                        <div role="status" aria-label="Loading question">
                          <Skeleton className="h-24" />
                        </div>
                      )
                    ) : (
                      <>
                        <QuestionBody q={r.question} name={`review-${i.id}`} selected={r.graded.selected} onSelect={() => {}} answer={r.solutionAvailable ? r.graded.answer : null} disabled />
                        {r.solutionAvailable ? (
                          <div className="mt-5 border-t border-line pt-5">
                            <SolutionPanel q={r.question as ReviewQuestion} selected={r.graded.selected} revealToken={review?.revealToken} />
                          </div>
                        ) : (
                          <p className="mt-3 text-[13px]">{i.isCorrect ? "Correct" : i.selectedLabel ? "Incorrect" : "Not answered"}</p>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
