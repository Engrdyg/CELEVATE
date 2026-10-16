import { lessonOutline } from "@/lib/content";
import { catalog } from "@/lib/qbank/catalog";
import type { Attempt, ExamSession, ProgressState, StoredResult } from "@/lib/store/progress";
import { addDays, dayKey } from "@/lib/utils";

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
      if (!catalog.length) break;
      const q = catalog[Math.floor(rand() * catalog.length)];
      const topicPenalty = (q.topic.length % 5) * 0.035;
      const p = Math.min(0.92, subjectSkill[q.subject] + progress * 0.22 - topicPenalty + (q.difficulty === "easy" ? 0.12 : q.difficulty === "difficult" ? -0.12 : 0));
      const correct = rand() < p;
      const at = new Date(d);
      at.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60));
      attempts.push({
        questionId: q.id,
        subjectId: q.subject,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        // Sample data never touches the answer key, so the chosen letter is not recorded.
        selected: null,
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
    const qs = [...catalog].sort(() => rand() - 0.5).slice(0, count);
    const start = addDays(today, -daysAgo);
    start.setHours(8, 0, 0, 0);
    const minutes = Math.round(count * 2.5);
    const items: StoredResult["items"] = qs.map((q, i) => {
      const answered = rand() < 0.94;
      const isCorrect = answered && rand() < skill;
      return { id: q.id, position: i + 1, title: q.title, subject: q.subject, topic: q.topic, difficulty: q.difficulty, selectedLabel: null, answerLabel: null, isCorrect, flagged: false };
    });
    const correct = items.filter((i) => i.isCorrect).length;
    const group = (key: (i: (typeof items)[number]) => string) =>
      Array.from(new Set(items.map(key))).map((k) => {
        const g = items.filter((i) => key(i) === k);
        const c = g.filter((i) => i.isCorrect).length;
        return { key: k, correct: c, total: g.length, percent: Math.round((c / g.length) * 1000) / 10 };
      });
    const durationSeconds = Math.round(minutes * 60 * (0.7 + rand() * 0.25));
    return {
      id,
      token: null,
      title: `Mixed diagnostic · ${count} items (sample)`,
      questions: [],
      answers: {},
      flagged: [],
      visited: [],
      times: {},
      currentIndex: 0,
      startedAt: start.toISOString(),
      deadline: new Date(start.getTime() + minutes * 60_000).toISOString(),
      autoSubmit: true,
      revealSolutions: true,
      status: "submitted",
      submittedAt: new Date(start.getTime() + durationSeconds * 1000).toISOString(),
      result: {
        percent: Math.round((correct / Math.max(1, count)) * 1000) / 10,
        correct,
        incorrect: items.filter((i) => !i.isCorrect).length,
        unanswered: 0,
        total: items.length,
        rawScore: `${correct}/${items.length}`,
        durationSeconds,
        late: false,
        bySubject: group((i) => i.subject),
        byTopic: group((i) => i.topic).map((t) => ({ ...t, subject: items.find((i) => i.topic === t.key)!.subject })).sort((a, b) => a.percent - b.percent),
        byDifficulty: group((i) => i.difficulty),
        items,
        resultToken: "",
        revealSolutions: true,
      },
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
      ...catalog.slice(0, 3).map((q, i) => ({ kind: "question" as const, refId: q.id, createdAt: addDays(today, -i - 2).toISOString() })),
      ...available.slice(0, 2).map((l, i) => ({ kind: "lesson" as const, refId: l.id, createdAt: addDays(today, -i - 4).toISOString() })),
    ],
    notes: [],
    lastLocation: { href: `/subjects/${inProgress.subjectId}/${inProgress.id}`, title: inProgress.title, subtitle: "Lesson", kind: "lesson", at: addDays(today, -1).toISOString() },
    scheduledExam: { title: "Full mock board", at: nextSat.toISOString(), presetId: "mock-full" },
    readNotificationIds: [],
  };
}
