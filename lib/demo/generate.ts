import { SUBJECT_IDS } from "@/config/cele";
import { allQuestions, lessonOutline } from "@/lib/content";
import type { Attempt, ExamSession, ProgressState } from "@/lib/store/progress";
import { addDays, dayKey } from "@/lib/utils";
import type { ChoiceId } from "@/lib/content/types";

/** Small deterministic PRNG so the sample dataset looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CHOICES: ChoiceId[] = ["A", "B", "C", "D"];

/**
 * Builds ~6 weeks of clearly-labelled SAMPLE activity so visitors can preview
 * dashboards and analytics. The store is flagged `dataMode: "demo"` and the UI
 * shows a persistent banner while it is active.
 */
export function generateDemoState(existing: ProgressState): Partial<ProgressState> {
  const rand = mulberry32(20261016);
  const today = new Date();
  const DAYS = 42;
  const studyLog: Record<string, number> = {};
  const attempts: Attempt[] = [];
  const subjectSkill: Record<string, number> = { mste: 0.62, hge: 0.5, psad: 0.56 };

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const restDay = rand() < (i > 14 ? 0.22 : 0.08) && i !== 0;
    if (restDay) continue;
    const progress = 1 - i / DAYS;
    const minutes = Math.round(25 + rand() * 70 + progress * 30);
    studyLog[dayKey(d)] = minutes;
    const n = Math.round(4 + rand() * 10);
    for (let k = 0; k < n; k++) {
      const q = allQuestions[Math.floor(rand() * allQuestions.length)];
      const topicPenalty = (q.topic.length % 5) * 0.035;
      const p = Math.min(0.92, subjectSkill[q.subjectId] + progress * 0.22 - topicPenalty + (q.difficulty === "easy" ? 0.12 : q.difficulty === "hard" ? -0.12 : 0));
      const correct = rand() < p;
      const wrong = CHOICES.filter((c) => c !== q.answer);
      const at = new Date(d);
      at.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60));
      attempts.push({
        questionId: q.id,
        subjectId: q.subjectId,
        topic: q.topic,
        selected: correct ? q.answer : wrong[Math.floor(rand() * 3)],
        correct,
        at: at.toISOString(),
        seconds: Math.round(50 + rand() * 160),
        mode: "practice",
      });
    }
  }

  const available = lessonOutline.filter((l) => l.status === "available");
  const lessons: ProgressState["lessons"] = {};
  available.forEach((l, i) => {
    const r = rand();
    if (r < 0.62) {
      const when = addDays(today, -Math.floor(rand() * 35)).toISOString();
      lessons[l.id] = { status: "completed", lastVisitedAt: when, completedAt: when };
    } else if (r < 0.85 || i === 0) {
      lessons[l.id] = { status: "in-progress", lastVisitedAt: addDays(today, -Math.floor(rand() * 5)).toISOString() };
    }
  });
  const inProgress = available.find((l) => lessons[l.id]?.status === "in-progress") ?? available[0];

  const mkExam = (daysAgo: number, count: number, skill: number, id: string): ExamSession => {
    const qs = [...allQuestions].sort(() => rand() - 0.5).slice(0, count);
    const start = addDays(today, -daysAgo);
    start.setHours(8, 0, 0, 0);
    const answers: Record<string, ChoiceId> = {};
    qs.forEach((q) => {
      if (rand() < 0.94) answers[q.id] = rand() < skill ? q.answer : CHOICES.filter((c) => c !== q.answer)[Math.floor(rand() * 3)];
    });
    const minutes = count * 2;
    return {
      id,
      config: { title: `Mixed diagnostic · ${count} items`, subjects: [...SUBJECT_IDS], questionCount: count, minutes, autoSubmit: true, revealSolutions: true, shuffle: true },
      questionIds: qs.map((q) => q.id),
      answers,
      flagged: [],
      visited: qs.map((q) => q.id),
      currentIndex: 0,
      startedAt: start.toISOString(),
      deadline: new Date(start.getTime() + minutes * 60_000).toISOString(),
      submittedAt: new Date(start.getTime() + minutes * 60_000 * (0.7 + rand() * 0.25)).toISOString(),
      status: "submitted",
    };
  };

  const nextSat = addDays(today, ((6 - today.getDay() + 7) % 7) || 7);
  nextSat.setHours(8, 0, 0, 0);

  return {
    dataMode: "demo",
    profile: existing.profile ?? {
      name: "Future Engineer",
      targetExam: "Upcoming CELE",
      dailyGoalMinutes: 60,
      focusSubjects: ["hge"],
      experience: "graduate",
      createdAt: addDays(today, -DAYS).toISOString(),
    },
    lessons,
    attempts: attempts.sort((a, b) => a.at.localeCompare(b.at)),
    studyLog,
    exams: [mkExam(24, 20, 0.58, "demo-exam-1"), mkExam(9, 30, 0.67, "demo-exam-2"), mkExam(2, 30, 0.73, "demo-exam-3")],
    bookmarks: [
      ...allQuestions.slice(0, 3).map((q, i) => ({ kind: "question" as const, refId: q.id, createdAt: addDays(today, -i - 2).toISOString() })),
      ...available.slice(0, 2).map((l, i) => ({ kind: "lesson" as const, refId: l.id, createdAt: addDays(today, -i - 4).toISOString() })),
    ],
    notes: [],
    lastLocation: { href: `/subjects/${inProgress.subjectId}/${inProgress.id}`, title: inProgress.title, subtitle: "Lesson", kind: "lesson", at: addDays(today, -1).toISOString() },
    scheduledExam: { title: "Mixed diagnostic · 30 items", at: nextSat.toISOString(), presetId: "mixed-30" },
    readNotificationIds: [],
  };
}
