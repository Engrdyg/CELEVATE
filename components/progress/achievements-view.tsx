"use client";

import { Award, BookOpen, Bookmark, Compass, Flame, Layers, Lock, Sparkles, Target, Timer, Trophy } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { evaluateAchievements, type AchievementIcon } from "@/lib/achievements";
import { studyStreak } from "@/lib/analytics";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const ICONS: Record<AchievementIcon, typeof Award> = {
  book: BookOpen,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  compass: Compass,
  timer: Timer,
  layers: Layers,
  sparkles: Sparkles,
  bookmark: Bookmark,
  award: Award,
};

const TIER = {
  bronze: { ring: "var(--chart-3)", chip: "bg-warning-soft text-warning", label: "Bronze" },
  silver: { ring: "var(--fg-muted)", chip: "bg-subtle text-muted", label: "Silver" },
  gold: { ring: "var(--warning)", chip: "bg-warning-soft text-warning", label: "Gold" },
} as const;

export function AchievementsView() {
  const ready = useStoreReady();
  const state = useProgress();
  if (!ready)
    return (
      <PageContainer>
        <Skeleton className="h-32 rounded-2xl" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </PageContainer>
    );
  const list = evaluateAchievements(state);
  const earned = list.filter((a) => a.earned);
  const streak = studyStreak(state);
  const pctEarned = Math.round((earned.length / list.length) * 100);

  return (
    <PageContainer>
      <PageHeader title="Achievements" description="Quiet milestones that mark real progress. Every badge is earned from your own activity." />
      <Card className="mb-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <ProgressRing value={pctEarned} size={84} stroke={8} label={`${earned.length} of ${list.length} achievements earned`}>
          <span className="font-mono text-sm font-semibold">
            {earned.length}/{list.length}
          </span>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-display text-lg font-semibold">{earned.length === 0 ? "Your first milestone is close" : `${earned.length} milestone${earned.length === 1 ? "" : "s"} earned`}</p>
          <p className="text-[13px] text-muted">Current streak: {streak.current} {streak.current === 1 ? "day" : "days"} · Best: {streak.best} {streak.best === 1 ? "day" : "days"}</p>
        </div>
      </Card>

      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => {
          const Icon = ICONS[a.icon];
          const tier = TIER[a.tier];
          return (
            <StaggerItem key={a.id}>
              <Card className={cn("relative h-full overflow-hidden p-5", !a.earned && "bg-card/60")}>
                {a.earned && <div aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full bg-[radial-gradient(closest-side,var(--glow-primary),transparent)]" />}
                <div className="relative flex items-start gap-4">
                  <span
                    className={cn("grid size-12 shrink-0 place-items-center rounded-xl border", a.earned ? "border-transparent bg-primary-soft text-primary-text" : "border-dashed border-line-strong text-faint")}
                    style={a.earned ? { boxShadow: `inset 0 0 0 1.5px ${tier.ring}` } : undefined}
                  >
                    {a.earned ? <Icon className="size-5" /> : <Lock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={cn("font-display text-[15px] font-semibold", !a.earned && "text-muted")}>{a.title}</h2>
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", tier.chip)}>{tier.label}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-muted">{a.description}</p>
                  </div>
                </div>
                <div className="relative mt-4">
                  {a.earned ? (
                    <Badge tone="success">Earned{a.earnedAt ? ` · ${new Date(a.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</Badge>
                  ) : (
                    <>
                      <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                        <span>Progress</span>
                        <span className="font-mono">
                          {a.current}/{a.target}
                        </span>
                      </div>
                      <ProgressBar value={(a.current / a.target) * 100} size="sm" tone="iris" label={`${a.title} progress`} />
                    </>
                  )}
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </PageContainer>
  );
}
