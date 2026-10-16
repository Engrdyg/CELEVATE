import type { ProgressState } from "@/lib/store/progress";
import { evaluateAchievements } from "@/lib/achievements";
import { activeExam, studyStreak } from "@/lib/analytics";
import { dayKey } from "@/lib/utils";

export interface AppNotification {
  id: string;
  kind: "achievement" | "exam" | "streak" | "welcome" | "schedule";
  title: string;
  body: string;
  href: string;
  at: string;
}

/** Notifications are derived only from the learner's own activity — nothing is invented. */
export function deriveNotifications(state: ProgressState, now = new Date()): AppNotification[] {
  const list: AppNotification[] = [];
  if (state.profile) {
    list.push({
      id: "welcome",
      kind: "welcome",
      title: "Welcome to CELEVATE",
      body: "Your review plan is set. Start with a lesson or a short practice set.",
      href: "/subjects",
      at: state.profile.createdAt,
    });
  }
  const exam = activeExam(state);
  if (exam) {
    list.push({
      id: `exam-${exam.id}`,
      kind: "exam",
      title: "Unfinished mock exam",
      body: `${exam.config.title} is still in progress. Your answers are autosaved.`,
      href: "/exams/take",
      at: exam.startedAt,
    });
  }
  if (state.scheduledExam) {
    const at = new Date(state.scheduledExam.at);
    const days = (at.getTime() - now.getTime()) / 86_400_000;
    if (days >= -0.5 && days <= 7) {
      list.push({
        id: `sched-${state.scheduledExam.at}`,
        kind: "schedule",
        title: "Upcoming mock exam",
        body: `${state.scheduledExam.title} · ${at.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`,
        href: "/exams",
        at: now.toISOString(),
      });
    }
  }
  const streak = studyStreak(state, now);
  if (streak.current > 0 && !streak.activeToday) {
    list.push({
      id: `streak-${dayKey(now)}`,
      kind: "streak",
      title: `Keep your ${streak.current}-day streak`,
      body: "A short practice set today keeps it going.",
      href: "/practice",
      at: now.toISOString(),
    });
  }
  for (const a of evaluateAchievements(state)) {
    if (a.earned && a.earnedAt) {
      list.push({ id: `ach-${a.id}`, kind: "achievement", title: `Achievement: ${a.title}`, body: a.description, href: "/achievements", at: a.earnedAt });
    }
  }
  return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
}
