"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Flame,
  Info,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { Tooltip } from "@/components/ui/tooltip";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ActivityChart } from "@/components/charts/activity-chart";
import { MetricCard } from "./metric-card";
import { useStoreReady } from "@/hooks/use-hydrated";
import { useProgress } from "@/lib/store/progress";
import {
  MIN_READINESS_ATTEMPTS,
  accuracy,
  dailySeries,
  lessonCompletion,
  readiness,
  recommendations,
  scoreExam,
  studyStreak,
  submittedExams,
  subjectMastery,
  totalStudyMinutes,
} from "@/lib/analytics";
import { evaluateAchievements } from "@/lib/achievements";
import { generateDemoState } from "@/lib/demo/generate";
import { getSubject, lessonOutline } from "@/lib/content";
import { CELE_SUBJECTS } from "@/config/cele";
import { MASTERY_LABEL, MASTERY_TONE, SUBJECT_COLOR } from "@/lib/subject-style";
import { addDays, dayKey, formatMinutes, formatRelative, greeting } from "@/lib/utils";

export function DashboardView() {
  const ready = useStoreReady();
  if (!ready) return <DashboardSkeleton />;
  return <Dashboard />;
}

function DashboardSkeleton() {
  return (
    <PageContainer>
      <Skeleton className="h-36 rounded-2xl" />
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CardSkeleton className="h-72" lines={5} />
        <CardSkeleton className="h-72 lg:col-span-2" lines={5} />
      </div>
    </PageContainer>
  );
}

function Dashboard() {
  const state = useProgress();
  const loadState = useProgress((s) => s.loadState);
  const { profile } = state;

  const data = useMemo(() => {
    const today = new Date();
    const lc = lessonCompletion(state);
    const streak = studyStreak(state, today);
    const exams = submittedExams(state).map(scoreExam);
    const week = dailySeries(state, 7);
    const last7 = state.attempts.filter((a) => new Date(a.at) >= addDays(today, -7));
    const prev7 = state.attempts.filter((a) => new Date(a.at) < addDays(today, -7) && new Date(a.at) >= addDays(today, -14));
    const acc7 = accuracy(last7);
    const accPrev = accuracy(prev7);
    return {
      lc,
      streak,
      exams,
      week,
      last7,
      acc: accuracy(state.attempts),
      accDelta: acc7 != null && accPrev != null ? acc7 - accPrev : null,
      minutes: totalStudyMinutes(state),
      todayMinutes: state.studyLog[dayKey(today)] ?? 0,
      mastery: subjectMastery(state),
      ready: readiness(state),
      recs: recommendations(state, 4),
      achievements: evaluateAchievements(state),
    };
  }, [state]);

  const hasActivity = state.attempts.length > 0 || Object.keys(state.lessons).length > 0;
  const firstLesson = lessonOutline.find((l) => l.status === "available")!;
  const resumeHref = state.lastLocation?.href ?? `/subjects/${firstLesson.subjectId}/${firstLesson.id}`;
  const goal = profile?.dailyGoalMinutes ?? 60;
  const goalPct = Math.min(100, Math.round((data.todayMinutes / goal) * 100));
  const daysToExam = profile?.examDate ? Math.ceil((new Date(profile.examDate + "T00:00:00").getTime() - Date.now()) / 86_400_000) : null;
  const latestExam = data.exams.at(-1);
  const prevExam = data.exams.at(-2);
  const earned = data.achievements.filter((a) => a.earned).sort((a, b) => (b.earnedAt ?? "").localeCompare(a.earnedAt ?? ""));
  const nextUp = data.achievements.filter((a) => !a.earned).sort((a, b) => b.current / b.target - a.current / a.target)[0];

  return (
    <PageContainer>
      {/* Welcome */}
      <section aria-labelledby="welcome" className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1">
        <div aria-hidden className="absolute inset-0 blueprint-grid opacity-60 [mask-image:linear-gradient(90deg,transparent_35%,#000_100%)]" />
        <div aria-hidden className="absolute -top-24 right-0 h-64 w-96 bg-[radial-gradient(closest-side,var(--glow-primary),transparent)]" />
        <div className="relative flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.16em] text-primary-text uppercase">
              {profile?.targetExam ?? "Your CELE review"}
              {daysToExam != null && daysToExam >= 0 && <span className="text-muted"> · {daysToExam} days to go</span>}
            </p>
            <h1 id="welcome" className="mt-2 font-display text-display-lg font-semibold">
              {greeting()}, {profile?.name ?? "Future Engineer"}.
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">
              {!profile
                ? "Set up your review plan to personalize goals, or explore with clearly-labelled sample data."
                : hasActivity
                  ? state.lastLocation
                    ? `Pick up where you left off: ${state.lastLocation.title}.`
                    : "Consistency beats intensity. A focused session today moves you forward."
                  : "Every licensed engineer started with a first lesson. Yours is one click away."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile ? (
                <Button asChild>
                  <Link href={resumeHref}>
                    <PlayCircle /> {hasActivity ? "Resume learning" : "Start first lesson"}
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/onboarding">
                    <Sparkles /> Set up your review plan
                  </Link>
                </Button>
              )}
              {!hasActivity && (
                <Button
                  variant="outline"
                  onClick={() => {
                    loadState(generateDemoState(useProgress.getState()));
                    toast.success("Sample data loaded", { description: "Clear it anytime from Settings → Data." });
                  }}
                >
                  Preview with sample data
                </Button>
              )}
              {hasActivity && (
                <Button asChild variant="outline">
                  <Link href="/practice">
                    <Target /> Quick practice
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/70 p-4 backdrop-blur md:w-64">
            <ProgressRing value={goalPct} size={68} stroke={7} label={`Daily goal ${goalPct}% complete`}>
              <span className="font-mono text-[13px] font-semibold">{goalPct}%</span>
            </ProgressRing>
            <div>
              <p className="text-[13px] font-medium">Today&apos;s goal</p>
              <p className="text-xs text-muted">
                {formatMinutes(data.todayMinutes)} of {formatMinutes(goal)}
              </p>
              <p className="mt-1 text-[11px] text-faint">Active study time</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <Stagger className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StaggerItem>
          <MetricCard icon={BookOpen} label="Review progress" value={<AnimatedNumber value={data.lc.percent} suffix="%" />} sub={`${data.lc.done}/${data.lc.total} lessons`}>
            <ProgressBar value={data.lc.percent} className="mt-3" size="sm" label="Lessons completed" />
          </MetricCard>
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            icon={Target}
            label="Questions answered"
            tone="iris"
            value={<AnimatedNumber value={state.attempts.length} />}
            trend={data.last7.length ? { value: `+${data.last7.length}`, direction: "up" } : null}
            sub={data.last7.length ? "this week" : "No attempts yet"}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            icon={CheckCircle2}
            label="Average accuracy"
            tone="success"
            value={data.acc == null ? "—" : <AnimatedNumber value={data.acc} suffix="%" />}
            trend={data.accDelta == null ? null : { value: `${data.accDelta > 0 ? "+" : ""}${data.accDelta} pts`, direction: data.accDelta > 0 ? "up" : data.accDelta < 0 ? "down" : "flat", good: data.accDelta >= 0 }}
            sub={data.accDelta == null ? (data.acc == null ? "Answer questions to see" : "all time") : "vs prior week"}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={Flame} label="Study streak" tone="warning" value={<AnimatedNumber value={data.streak.current} suffix={data.streak.current === 1 ? " day" : " days"} />} sub={`Best ${data.streak.best} days`} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard icon={Clock} label="Total study time" value={formatMinutes(data.minutes)} sub="Active time logged" />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            icon={ClipboardCheck}
            label="Mock exam score"
            tone="iris"
            value={latestExam ? <AnimatedNumber value={latestExam.percent} suffix="%" /> : "—"}
            trend={latestExam && prevExam ? { value: `${latestExam.percent - prevExam.percent >= 0 ? "+" : ""}${latestExam.percent - prevExam.percent} pts`, direction: latestExam.percent >= prevExam.percent ? "up" : "down", good: latestExam.percent >= prevExam.percent } : null}
            sub={latestExam ? `Latest of ${data.exams.length}` : "No exams taken"}
          />
        </StaggerItem>
      </Stagger>

      {/* Readiness + activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>CELE readiness</CardTitle>
              <CardDescription>Internal learning estimate</CardDescription>
            </div>
            <Tooltip content="Blends subject mastery, recent accuracy, mock exams and consistency from your CELEVATE activity. It is not an official prediction of PRC examination results.">
              <button type="button" className="grid size-7 place-items-center rounded-md text-muted hover:bg-subtle hover:text-fg" aria-label="How readiness is calculated">
                <Info className="size-4" />
              </button>
            </Tooltip>
          </CardHeader>
          <CardContent>
            {data.ready.sufficient ? (
              <>
                <div className="flex items-center gap-5">
                  <ProgressRing value={data.ready.score} size={112} stroke={10} label={`Readiness estimate ${data.ready.score} of 100`}>
                    <div className="text-center">
                      <div className="font-display text-3xl font-semibold tabular">{data.ready.score}</div>
                      <div className="text-[10px] text-faint">of 100</div>
                    </div>
                  </ProgressRing>
                  <ul className="min-w-0 flex-1 space-y-2">
                    {data.ready.components
                      .filter((c) => c.weight > 0)
                      .map((c) => (
                        <li key={c.key} className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted">{c.label}</span>
                            <span className="font-mono">{c.value}</span>
                          </div>
                          <ProgressBar value={c.value} size="sm" className="mt-1" label={c.label} />
                        </li>
                      ))}
                  </ul>
                </div>
                <p className="mt-4 rounded-lg bg-subtle px-3 py-2 text-[11px] leading-4 text-muted">
                  For self-assessment only — not an official prediction of your PRC examination result.
                </p>
              </>
            ) : (
              <EmptyState
                compact
                icon={Target}
                title="Not enough data yet"
                description={`Answer at least ${MIN_READINESS_ATTEMPTS} questions to unlock your readiness estimate (${state.attempts.length}/${MIN_READINESS_ATTEMPTS}).`}
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/practice">Start practicing</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
        <ActivityChart data={data.week} title="Weekly activity" />
      </div>

      {/* Mastery + continue/recommend */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Subject mastery</CardTitle>
              <CardDescription>Lesson coverage and practice accuracy per CELE subject</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/subjects">
                All subjects <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {data.mastery.map((m) => {
              const s = getSubject(m.subjectId)!;
              return (
                <Link key={m.subjectId} href={`/subjects/${m.subjectId}`} className="group -mx-2 flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-subtle/60">
                  <ProgressRing value={m.mastery} size={48} stroke={5} color={SUBJECT_COLOR[m.subjectId]} label={`${s.code} mastery ${m.mastery}%`}>
                    <span className="font-mono text-[11px] font-semibold">{m.mastery}</span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[13px] font-medium">{CELE_SUBJECTS[m.subjectId].name}</span>
                      <Badge tone={MASTERY_TONE[m.status]}>{MASTERY_LABEL[m.status]}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                      <span>
                        {m.lessonsDone}/{m.lessonsTotal} lessons
                      </span>
                      <span>{m.attempts} attempts</span>
                      <span>{m.accuracy == null ? "No accuracy yet" : `${m.accuracy}% accuracy`}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle>Continue where you left off</CardTitle>
                <CardDescription>{state.lastLocation ? formatRelative(state.lastLocation.at) : "Suggested starting point"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={resumeHref} className="group flex items-center gap-3 rounded-xl border border-line bg-subtle/50 p-3 transition-colors hover:border-line-strong">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-text">
                  <BookOpen className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{state.lastLocation?.title ?? firstLesson.title}</span>
                  <span className="block truncate text-xs text-muted">{state.lastLocation?.subtitle ?? `${getSubject(firstLesson.subjectId)?.code} · ${firstLesson.minutes} min read`}</span>
                </span>
                <PlayCircle className="size-5 text-primary-text transition-transform group-hover:scale-110" />
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recommended practice</CardTitle>
                <CardDescription>Based on your activity</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <ul className="space-y-1">
                {data.recs.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href} className="group -mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-subtle/60">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: r.subjectId ? SUBJECT_COLOR[r.subjectId] : "var(--iris)" }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{r.title}</span>
                        <span className="block truncate text-xs text-muted">{r.reason}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-faint group-hover:text-fg" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exam + achievements */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming mock exam</CardTitle>
              <CardDescription>Scheduled by you</CardDescription>
            </div>
            <CalendarClock className="size-5 text-muted" aria-hidden />
          </CardHeader>
          <CardContent>
            {state.scheduledExam && new Date(state.scheduledExam.at).getTime() > Date.now() - 3_600_000 ? (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-subtle/50 p-4">
                <div>
                  <p className="text-[13px] font-semibold">{state.scheduledExam.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(state.scheduledExam.at).toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/exams?preset=${state.scheduledExam.presetId}`}>Open</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                compact
                icon={CalendarClock}
                title="No mock exam scheduled"
                description="Schedule a timed exam to build exam-day stamina."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/exams">Schedule or start one</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent achievements</CardTitle>
              <CardDescription>
                {earned.length} of {data.achievements.length} earned
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/achievements">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {earned.length === 0 ? (
              <EmptyState compact icon={Award} title="Your first badge is close" description={nextUp ? `${nextUp.title}: ${nextUp.description}` : undefined} />
            ) : (
              <ul className="space-y-2">
                {earned.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-warning-soft text-warning">
                      <Trophy className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{a.title}</span>
                      <span className="block truncate text-xs text-muted">{a.description}</span>
                    </span>
                  </li>
                ))}
                {nextUp && (
                  <li className="mt-3 rounded-lg border border-dashed border-line-strong p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Next: {nextUp.title}</span>
                      <span className="font-mono">
                        {nextUp.current}/{nextUp.target}
                      </span>
                    </div>
                    <ProgressBar value={(nextUp.current / nextUp.target) * 100} size="sm" tone="iris" className="mt-2" label={`${nextUp.title} progress`} />
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
