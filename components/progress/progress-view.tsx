"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Clock, ClipboardCheck, Target, TrendingDown } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { Tooltip } from "@/components/ui/tooltip";
import { ActivityChart } from "@/components/charts/activity-chart";
import { ChartCard, ChartTooltip, axisProps } from "@/components/charts/chart-card";
import { Heatmap } from "@/components/charts/heatmap";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { dailySeries, recommendations, scoreExam, submittedExams, subjectMastery, topicStats, weakestTopics, weeklySeries } from "@/lib/analytics";
import { subjects, type SubjectId } from "@/lib/content";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { addDays, dayKey, formatDuration, formatMinutes } from "@/lib/utils";

type Range = "7" | "30" | "90";

export function ProgressView() {
  const ready = useStoreReady();
  if (!ready)
    return (
      <PageContainer>
        <Skeleton className="h-10 w-72" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <CardSkeleton className="mt-4 h-72" lines={6} />
      </PageContainer>
    );
  return <Analytics />;
}

function Analytics() {
  const state = useProgress();
  const [range, setRange] = useState<Range>("30");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const sid = subject === "all" ? undefined : subject;
  const days = Number(range);

  const d = useMemo(() => {
    const series = dailySeries(state, days, sid);
    const since = addDays(new Date(), -days);
    const inRange = state.attempts.filter((a) => new Date(a.at) >= since && (!sid || a.subjectId === sid));
    const correct = inRange.filter((a) => a.correct).length;
    const accuracySeries = range === "90" ? weeklySeries(state, 13, sid) : series;
    const topic = topicStats(state);
    const mastery = subjectMastery(state);
    const exams = submittedExams(state).map(scoreExam).reverse();
    // 12-week consistency calendar (minutes per day)
    const start = addDays(new Date(), -83);
    const calendar = Array.from({ length: 84 }, (_, i) => {
      const day = addDays(start, i);
      const k = dayKey(day);
      return { key: k, date: day, minutes: Math.round(state.studyLog[k] ?? 0) };
    });
    return {
      series,
      accuracySeries,
      minutes: series.reduce((a, x) => a + x.minutes, 0),
      questions: inRange.length,
      accuracy: inRange.length ? Math.round((correct / inRange.length) * 100) : null,
      activeDays: series.filter((x) => x.minutes > 0 || x.questions > 0).length,
      topic,
      mastery,
      exams,
      calendar,
      weak: weakestTopics(state, 5).filter((t) => !sid || t.subjectId === sid),
      recs: recommendations(state, 4),
    };
  }, [state, days, sid, range]);

  const hasData = state.attempts.length > 0 || Object.keys(state.studyLog).length > 0;
  const maxMin = Math.max(30, ...d.calendar.map((c) => c.minutes));

  return (
    <PageContainer>
      <PageHeader
        title="My Progress"
        description="Analytics computed from your own CELEVATE activity in this browser."
        actions={
          <>
            <Select
              label="Subject filter"
              value={subject}
              onChange={(v) => setSubject(v as SubjectId | "all")}
              options={[{ value: "all", label: "All subjects" }, ...subjects.map((s) => ({ value: s.id, label: s.code }))]}
            />
            <Segmented
              label="Date range"
              value={range}
              onChange={setRange}
              options={[
                { value: "7", label: "7D" },
                { value: "30", label: "30D" },
                { value: "90", label: "90D" },
              ]}
            />
          </>
        }
      />

      {!hasData && (
        <Card className="mb-4">
          <EmptyState
            icon={BarChart3}
            title="Your analytics will build as you study"
            description="Read lessons, answer practice questions or take a mock exam. Every chart on this page is computed only from your real activity."
            action={
              <Button asChild>
                <Link href="/practice">Start practicing</Link>
              </Button>
            }
          />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Clock} label="Study time" value={formatMinutes(d.minutes)} sub={`last ${days} days`} />
        <MetricCard icon={Target} tone="iris" label="Questions" value={d.questions} sub={`last ${days} days`} />
        <MetricCard icon={CheckCircle2} tone="success" label="Accuracy" value={d.accuracy == null ? "—" : `${d.accuracy}%`} sub={`last ${days} days`} />
        <MetricCard icon={CalendarDays} tone="warning" label="Active days" value={`${d.activeDays}/${days}`} sub="days with activity" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActivityChart data={d.series} title="Study trend" description={range === "7" ? "Daily activity this week" : `Daily activity, last ${days} days`} />
        <ChartCard
          title="Accuracy over time"
          description={range === "90" ? "Weekly accuracy" : "Daily accuracy (days with attempts)"}
          table={{ columns: ["Period", "Questions", "Accuracy"], rows: d.accuracySeries.map((x) => [x.label, x.questions, x.accuracy == null ? "—" : `${x.accuracy}%`]) }}
        >
          <div className="relative h-[220px]" role="img" aria-label="Line chart of accuracy over time">
            {d.accuracySeries.every((x) => x.accuracy == null) && <p className="absolute inset-0 z-10 grid place-items-center text-[13px] text-muted">No answered questions in this range.</p>}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.accuracySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
                <YAxis domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} width={44} />
                <RTooltip cursor={{ stroke: "var(--line-strong)" }} content={<ChartTooltip format={(v) => (v == null ? "—" : `${v}%`)} />} />
                <Line dataKey="accuracy" name="Accuracy" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ChartCard
          title="Subject comparison"
          description="Mastery estimate and practice accuracy"
          legend={[
            { label: "Mastery", color: "var(--chart-1)" },
            { label: "Accuracy", color: "var(--chart-2)" },
          ]}
          table={{ columns: ["Subject", "Mastery", "Accuracy", "Attempts"], rows: d.mastery.map((m) => [subjects.find((s) => s.id === m.subjectId)!.code, `${m.mastery}%`, m.accuracy == null ? "—" : `${m.accuracy}%`, m.attempts]) }}
        >
          <div className="h-[220px]" role="img" aria-label="Grouped bar chart comparing subjects">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.mastery.map((m) => ({ name: subjects.find((s) => s.id === m.subjectId)!.code, mastery: m.mastery, accuracy: m.accuracy ?? 0 }))} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis domain={[0, 100]} {...axisProps} tickFormatter={(v) => `${v}%`} width={44} />
                <RTooltip cursor={{ fill: "var(--subtle)", opacity: 0.5 }} content={<ChartTooltip format={(v) => `${v}%`} />} />
                <Bar dataKey="mastery" name="Mastery" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="accuracy" name="Accuracy" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Topic mastery heatmap</CardTitle>
              <CardDescription>Accuracy per practice topic · hover a cell for details</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Heatmap
              rows={subjects
                .filter((s) => !sid || s.id === sid)
                .map((s) => ({
                  label: s.code,
                  cells: d.topic
                    .filter((t) => t.subjectId === s.id)
                    .map((t) => ({ key: t.topic, label: t.topic, value: t.accuracy, detail: `${t.attempts} attempts` })),
                }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Study consistency</CardTitle>
              <CardDescription>Active minutes per day, last 12 weeks</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-1">
              <div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="grid" aria-label="Study consistency calendar">
                {d.calendar.map((c) => (
                  <Tooltip key={c.key} content={`${c.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}: ${c.minutes ? `${c.minutes} min` : "no study logged"}`}>
                    <span
                      role="gridcell"
                      tabIndex={0}
                      aria-label={`${c.key}: ${c.minutes} minutes`}
                      className="block size-3.5 rounded-[3px] border border-line outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-4"
                      style={{ background: c.minutes ? `color-mix(in srgb, var(--primary) ${Math.round(20 + (c.minutes / maxMin) * 75)}%, var(--subtle))` : "var(--subtle)" }}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-faint">
              Less
              {[0, 25, 50, 75, 100].map((p) => (
                <span key={p} className="size-3 rounded-[3px] border border-line" style={{ background: p ? `color-mix(in srgb, var(--primary) ${20 + p * 0.75}%, var(--subtle))` : "var(--subtle)" }} aria-hidden />
              ))}
              More
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Weakest knowledge areas</CardTitle>
              <CardDescription>Topics under 75% with at least 2 attempts</CardDescription>
            </div>
            <TrendingDown className="size-5 text-muted" aria-hidden />
          </CardHeader>
          <CardContent>
            {d.weak.length === 0 ? (
              <p className="text-[13px] text-muted">No weak areas detected yet. Keep practicing across topics to surface them.</p>
            ) : (
              <ul className="space-y-3">
                {d.weak.map((t) => (
                  <li key={`${t.subjectId}-${t.topic}`}>
                    <Link href={`/practice?subject=${t.subjectId}&topic=${encodeURIComponent(t.topic)}`} className="group block">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ background: SUBJECT_COLOR[t.subjectId] }} aria-hidden />
                          <span className="group-hover:text-primary-text">{t.topic}</span>
                        </span>
                        <span className="font-mono text-xs text-muted">{t.accuracy}%</span>
                      </div>
                      <ProgressBar value={t.accuracy ?? 0} size="sm" tone="warning" className="mt-1.5" label={`${t.topic} accuracy`} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Mock examination history</CardTitle>
              <CardDescription>{d.exams.length} submitted</CardDescription>
            </div>
            <ClipboardCheck className="size-5 text-muted" aria-hidden />
          </CardHeader>
          <CardContent>
            {d.exams.length === 0 ? (
              <EmptyState compact icon={ClipboardCheck} title="No mock exams yet" action={<Button asChild size="sm" variant="outline"><Link href="/exams">Take a mock exam</Link></Button>} />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[30rem] text-left text-[13px]">
                  <caption className="sr-only">Mock examination history</caption>
                  <thead className="bg-subtle text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Date</th>
                      <th scope="col" className="px-3 py-2 font-medium">Exam</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Score</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.exams.map((r) => (
                      <tr key={r.exam.id} className="border-t border-line hover:bg-subtle/40">
                        <td className="px-3 py-2.5 text-muted">{new Date(r.exam.submittedAt!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
                        <td className="px-3 py-2.5">
                          <Link href={`/exams/results?id=${r.exam.id}`} className="font-medium hover:text-primary-text">
                            {r.exam.config.title}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">{r.percent}%</td>
                        <td className="px-3 py-2.5 text-right font-mono text-muted">{formatDuration(r.secondsUsed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recommended next actions</CardTitle>
              <CardDescription>Generated from your results</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {d.recs.map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="flex items-center gap-3 rounded-lg border border-line p-3 text-[13px] transition-colors hover:border-line-strong">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: r.subjectId ? SUBJECT_COLOR[r.subjectId] : "var(--iris)" }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted">{r.reason}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
