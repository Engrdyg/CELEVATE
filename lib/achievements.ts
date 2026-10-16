import { SUBJECT_IDS } from "@/config/cele";
import type { ProgressState } from "@/lib/store/progress";
import { lessonCompletion, scoreExam, studyStreak, submittedExams, totalStudyMinutes } from "@/lib/analytics";

export type AchievementIcon = "book" | "target" | "flame" | "trophy" | "compass" | "timer" | "layers" | "sparkles" | "bookmark" | "award";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  tier: "bronze" | "silver" | "gold";
  /** current / target progress */
  measure: (s: ProgressState) => { current: number; target: number; earnedAt?: string };
}

const sortedAttempts = (s: ProgressState) => [...s.attempts].sort((a, b) => a.at.localeCompare(b.at));

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-lesson",
    title: "Groundbreaking",
    description: "Complete your first lesson.",
    icon: "book",
    tier: "bronze",
    measure: (s) => {
      const done = Object.values(s.lessons).filter((l) => l.status === "completed" && l.completedAt).map((l) => l.completedAt!).sort();
      return { current: Math.min(1, done.length), target: 1, earnedAt: done[0] };
    },
  },
  {
    id: "first-answer",
    title: "First Calculation",
    description: "Answer your first practice question.",
    icon: "target",
    tier: "bronze",
    measure: (s) => ({ current: Math.min(1, s.attempts.length), target: 1, earnedAt: sortedAttempts(s)[0]?.at }),
  },
  {
    id: "fifty-questions",
    title: "Problem Solver",
    description: "Answer 50 questions across practice and exams.",
    icon: "layers",
    tier: "silver",
    measure: (s) => ({ current: Math.min(50, s.attempts.length), target: 50, earnedAt: sortedAttempts(s)[49]?.at }),
  },
  {
    id: "streak-3",
    title: "Steady Footing",
    description: "Study three days in a row.",
    icon: "flame",
    tier: "bronze",
    measure: (s) => ({ current: Math.min(3, studyStreak(s).best), target: 3 }),
  },
  {
    id: "streak-7",
    title: "Load-Bearing Habit",
    description: "Keep a seven-day study streak.",
    icon: "flame",
    tier: "silver",
    measure: (s) => ({ current: Math.min(7, studyStreak(s).best), target: 7 }),
  },
  {
    id: "all-subjects",
    title: "Full Coverage",
    description: "Attempt questions in all three CELE subjects.",
    icon: "compass",
    tier: "silver",
    measure: (s) => ({ current: SUBJECT_IDS.filter((id) => s.attempts.some((a) => a.subjectId === id)).length, target: 3 }),
  },
  {
    id: "first-mock",
    title: "Under Exam Conditions",
    description: "Submit your first mock board exam.",
    icon: "timer",
    tier: "bronze",
    measure: (s) => {
      const ex = submittedExams(s);
      return { current: Math.min(1, ex.length), target: 1, earnedAt: ex[0]?.submittedAt };
    },
  },
  {
    id: "mock-70",
    title: "Passing Mark",
    description: "Score at least 70% on a mock board exam of 10 or more items.",
    icon: "trophy",
    tier: "gold",
    measure: (s) => {
      const hit = submittedExams(s).map(scoreExam).find((r) => r.total >= 10 && r.percent >= 70);
      return { current: hit ? 1 : 0, target: 1, earnedAt: hit?.exam.submittedAt };
    },
  },
  {
    id: "lessons-half",
    title: "Halfway Point",
    description: "Complete half of all available lessons.",
    icon: "award",
    tier: "gold",
    measure: (s) => {
      const lc = lessonCompletion(s);
      const target = Math.max(1, Math.ceil(lc.total / 2));
      return { current: Math.min(target, lc.done), target };
    },
  },
  {
    id: "ten-hours",
    title: "Ten Study Hours",
    description: "Log ten hours of active study time.",
    icon: "sparkles",
    tier: "silver",
    measure: (s) => ({ current: Math.min(600, Math.round(totalStudyMinutes(s))), target: 600 }),
  },
  {
    id: "bookmarks-5",
    title: "Reference Builder",
    description: "Save five formulas, lessons or questions to your library.",
    icon: "bookmark",
    tier: "bronze",
    measure: (s) => ({ current: Math.min(5, s.bookmarks.length), target: 5 }),
  },
];

export function evaluateAchievements(s: ProgressState) {
  return ACHIEVEMENTS.map((a) => {
    const m = a.measure(s);
    return { ...a, ...m, earned: m.current >= m.target };
  });
}
