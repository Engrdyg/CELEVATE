import { CELE_SUBJECTS, SUBJECT_IDS, type SubjectId } from "@/config/cele";
import { allQuestions, getQuestion, lessonOutline, subjects } from "@/lib/content";
import type { Attempt, ExamSession, ProgressState } from "@/lib/store/progress";
import { addDays, dayKey, pct } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Basic counters                                                     */
/* ------------------------------------------------------------------ */

export function lessonCompletion(state: ProgressState, subjectId?: SubjectId) {
  const list = lessonOutline.filter((l) => l.status === "available" && (!subjectId || l.subjectId === subjectId));
  const done = list.filter((l) => state.lessons[l.id]?.status === "completed").length;
  return { done, total: list.length, percent: pct(done, list.length) };
}

export function accuracy(attempts: Attempt[]) {
  if (!attempts.length) return null;
  return Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100);
}

export function totalStudyMinutes(state: ProgressState) {
  return Object.values(state.studyLog).reduce((a, b) => a + b, 0);
}

/** Consecutive days (ending today or yesterday) with any study activity. */
export function studyStreak(state: ProgressState, today = new Date()) {
  const active = activeDays(state);
  let d = today;
  if (!active.has(dayKey(d))) d = addDays(d, -1);
  let streak = 0;
  while (active.has(dayKey(d))) {
    streak++;
    d = addDays(d, -1);
  }
  const best = bestStreak(active);
  return { current: streak, best: Math.max(best, streak), activeToday: active.has(dayKey(today)) };
}

function activeDays(state: ProgressState) {
  const set = new Set<string>();
  for (const [k, v] of Object.entries(state.studyLog)) if (v > 0) set.add(k);
  for (const a of state.attempts) set.add(dayKey(new Date(a.at)));
  for (const l of Object.values(state.lessons)) set.add(dayKey(new Date(l.lastVisitedAt)));
  return set;
}

function bestStreak(active: Set<string>) {
  const days = Array.from(active).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const d = new Date(k + "T00:00:00");
    run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Exams                                                              */
/* ------------------------------------------------------------------ */

export interface ExamResult {
  exam: ExamSession;
  correct: number;
  total: number;
  answered: number;
  percent: number;
  secondsUsed: number;
  bySubject: { subjectId: SubjectId; correct: number; total: number; percent: number }[];
  byTopic: { subjectId: SubjectId; topic: string; correct: number; total: number; percent: number }[];
}

export function scoreExam(exam: ExamSession): ExamResult {
  let correct = 0;
  const subj = new Map<SubjectId, { c: number; t: number }>();
  const top = new Map<string, { subjectId: SubjectId; topic: string; c: number; t: number }>();
  for (const qid of exam.questionIds) {
    const q = getQuestion(qid);
    if (!q) continue;
    const ok = exam.answers[qid] === q.answer;
    if (ok) correct++;
    const s = subj.get(q.subjectId) ?? { c: 0, t: 0 };
    s.t++;
    if (ok) s.c++;
    subj.set(q.subjectId, s);
    const key = `${q.subjectId}::${q.topic}`;
    const t = top.get(key) ?? { subjectId: q.subjectId, topic: q.topic, c: 0, t: 0 };
    t.t++;
    if (ok) t.c++;
    top.set(key, t);
  }
  const total = exam.questionIds.length;
  const end = exam.submittedAt ? new Date(exam.submittedAt).getTime() : Date.now();
  return {
    exam,
    correct,
    total,
    answered: Object.keys(exam.answers).length,
    percent: pct(correct, total),
    secondsUsed: Math.max(0, Math.round((end - new Date(exam.startedAt).getTime()) / 1000)),
    bySubject: Array.from(subj.entries()).map(([subjectId, v]) => ({ subjectId, correct: v.c, total: v.t, percent: pct(v.c, v.t) })),
    byTopic: Array.from(top.values())
      .map((v) => ({ subjectId: v.subjectId, topic: v.topic, correct: v.c, total: v.t, percent: pct(v.c, v.t) }))
      .sort((a, b) => a.percent - b.percent),
  };
}

export function submittedExams(state: ProgressState) {
  return state.exams
    .filter((e) => e.status === "submitted")
    .sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime());
}

export function activeExam(state: ProgressState) {
  return state.exams.find((e) => e.status === "in-progress") ?? null;
}

/* ------------------------------------------------------------------ */
/*  Mastery & readiness                                                */
/* ------------------------------------------------------------------ */

export interface SubjectMastery {
  subjectId: SubjectId;
  lessonsDone: number;
  lessonsTotal: number;
  attempts: number;
  accuracy: number | null;
  /** 0–100 blended learning estimate (coverage + accuracy). */
  mastery: number;
  status: "not-started" | "building" | "developing" | "proficient";
}

export function subjectMastery(state: ProgressState): SubjectMastery[] {
  return SUBJECT_IDS.map((id) => {
    const lc = lessonCompletion(state, id);
    const att = state.attempts.filter((a) => a.subjectId === id);
    const acc = accuracy(att);
    const questionPool = allQuestions.filter((q) => q.subjectId === id).length || 1;
    const practiceCoverage = Math.min(1, new Set(att.map((a) => a.questionId)).size / questionPool);
    const mastery =
      att.length === 0 && lc.done === 0
        ? 0
        : Math.round(lc.percent * 0.3 + (acc ?? 0) * 0.5 * Math.min(1, att.length / 10) + practiceCoverage * 100 * 0.2);
    const status: SubjectMastery["status"] =
      mastery === 0 ? "not-started" : mastery < 40 ? "building" : mastery < 70 ? "developing" : "proficient";
    return { subjectId: id, lessonsDone: lc.done, lessonsTotal: lc.total, attempts: att.length, accuracy: acc, mastery, status };
  });
}

export const MIN_READINESS_ATTEMPTS = 15;

export interface Readiness {
  sufficient: boolean;
  score: number;
  components: { key: string; label: string; value: number; weight: number }[];
  bySubject: { subjectId: SubjectId; value: number; weight: number }[];
}

/**
 * Internal learning estimate — NOT a prediction of PRC examination results.
 * Weighted blend of subject mastery (using configured subject weights), recent
 * accuracy, mock exam performance and study consistency.
 */
export function readiness(state: ProgressState): Readiness {
  const mastery = subjectMastery(state);
  const bySubject = mastery.map((m) => ({ subjectId: m.subjectId, value: m.mastery, weight: CELE_SUBJECTS[m.subjectId].weight }));
  const weightedMastery = bySubject.reduce((a, s) => a + s.value * s.weight, 0);

  const recent = state.attempts.slice(-60);
  const recentAcc = accuracy(recent) ?? 0;

  const exams = submittedExams(state).slice(-3).map(scoreExam);
  const examAvg = exams.length ? exams.reduce((a, r) => a + r.percent, 0) / exams.length : 0;

  const last14 = Array.from({ length: 14 }, (_, i) => dayKey(addDays(new Date(), -i)));
  const activeDays = last14.filter((k) => (state.studyLog[k] ?? 0) > 0 || state.attempts.some((a) => dayKey(new Date(a.at)) === k)).length;
  const consistency = Math.round((activeDays / 14) * 100);

  const components = [
    { key: "mastery", label: "Subject mastery", value: Math.round(weightedMastery), weight: 0.4 },
    { key: "accuracy", label: "Recent accuracy", value: recentAcc, weight: 0.25 },
    { key: "exams", label: "Mock exams", value: Math.round(examAvg), weight: exams.length ? 0.25 : 0 },
    { key: "consistency", label: "Consistency", value: consistency, weight: 0.1 },
  ];
  const wsum = components.reduce((a, c) => a + c.weight, 0);
  const score = Math.round(components.reduce((a, c) => a + c.value * c.weight, 0) / wsum);
  return { sufficient: state.attempts.length >= MIN_READINESS_ATTEMPTS, score, components, bySubject };
}

/* ------------------------------------------------------------------ */
/*  Time series                                                        */
/* ------------------------------------------------------------------ */

export interface DayPoint {
  key: string;
  label: string;
  minutes: number;
  questions: number;
  correct: number;
  accuracy: number | null;
}

export function dailySeries(state: ProgressState, days: number, subjectId?: SubjectId): DayPoint[] {
  const today = new Date();
  const byDay = new Map<string, { q: number; c: number }>();
  for (const a of state.attempts) {
    if (subjectId && a.subjectId !== subjectId) continue;
    const k = dayKey(new Date(a.at));
    const v = byDay.get(k) ?? { q: 0, c: 0 };
    v.q++;
    if (a.correct) v.c++;
    byDay.set(k, v);
  }
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(today, -(days - 1 - i));
    const k = dayKey(d);
    const v = byDay.get(k);
    return {
      key: k,
      label: days <= 7 ? d.toLocaleDateString(undefined, { weekday: "short" }) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: Math.round(state.studyLog[k] ?? 0),
      questions: v?.q ?? 0,
      correct: v?.c ?? 0,
      accuracy: v && v.q ? Math.round((v.c / v.q) * 100) : null,
    };
  });
}

export function weeklySeries(state: ProgressState, weeks: number, subjectId?: SubjectId) {
  const days = dailySeries(state, weeks * 7, subjectId);
  return Array.from({ length: weeks }, (_, w) => {
    const slice = days.slice(w * 7, w * 7 + 7);
    const q = slice.reduce((a, d) => a + d.questions, 0);
    const c = slice.reduce((a, d) => a + d.correct, 0);
    const start = new Date(slice[0].key + "T00:00:00");
    return {
      key: slice[0].key,
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: slice.reduce((a, d) => a + d.minutes, 0),
      questions: q,
      accuracy: q ? Math.round((c / q) * 100) : null,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Topics & recommendations                                           */
/* ------------------------------------------------------------------ */

export interface TopicStat {
  subjectId: SubjectId;
  topic: string;
  attempts: number;
  correct: number;
  accuracy: number | null;
  poolSize: number;
}

export function topicStats(state: ProgressState): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const q of allQuestions) {
    const k = `${q.subjectId}::${q.topic}`;
    if (!map.has(k)) map.set(k, { subjectId: q.subjectId, topic: q.topic, attempts: 0, correct: 0, accuracy: null, poolSize: 0 });
    map.get(k)!.poolSize++;
  }
  for (const a of state.attempts) {
    const k = `${a.subjectId}::${a.topic}`;
    const t = map.get(k);
    if (!t) continue;
    t.attempts++;
    if (a.correct) t.correct++;
  }
  for (const t of map.values()) t.accuracy = t.attempts ? Math.round((t.correct / t.attempts) * 100) : null;
  return Array.from(map.values());
}

export function weakestTopics(state: ProgressState, n = 4) {
  return topicStats(state)
    .filter((t) => t.attempts >= 2 && (t.accuracy ?? 100) < 75)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .slice(0, n);
}

export function strongestTopics(state: ProgressState, n = 3) {
  return topicStats(state)
    .filter((t) => t.attempts >= 2 && (t.accuracy ?? 0) >= 70)
    .sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0))
    .slice(0, n);
}

export interface Recommendation {
  id: string;
  kind: "practice" | "lesson" | "exam" | "start";
  title: string;
  reason: string;
  href: string;
  subjectId?: SubjectId;
}

export function recommendations(state: ProgressState, limit = 4): Recommendation[] {
  const recs: Recommendation[] = [];
  for (const t of weakestTopics(state, 3)) {
    recs.push({
      id: `topic-${t.subjectId}-${t.topic}`,
      kind: "practice",
      title: `Practice: ${t.topic}`,
      reason: `${t.accuracy}% accuracy across ${t.attempts} attempts`,
      href: `/practice?subject=${t.subjectId}&topic=${encodeURIComponent(t.topic)}`,
      subjectId: t.subjectId,
    });
  }
  const mastery = subjectMastery(state).sort((a, b) => a.mastery - b.mastery);
  for (const m of mastery) {
    const next = lessonOutline.find((l) => l.subjectId === m.subjectId && l.status === "available" && state.lessons[l.id]?.status !== "completed");
    if (next) {
      recs.push({
        id: `lesson-${next.id}`,
        kind: "lesson",
        title: next.title,
        reason: m.lessonsDone === 0 ? `Start ${CELE_SUBJECTS[m.subjectId].code}` : `Next lesson in ${CELE_SUBJECTS[m.subjectId].code}`,
        href: `/subjects/${next.subjectId}/${next.id}`,
        subjectId: next.subjectId,
      });
    }
  }
  const untouched = SUBJECT_IDS.find((id) => !state.attempts.some((a) => a.subjectId === id));
  if (untouched) {
    recs.push({
      id: `practice-${untouched}`,
      kind: "practice",
      title: `First practice set: ${CELE_SUBJECTS[untouched].code}`,
      reason: "No attempts recorded in this subject yet",
      href: `/practice?subject=${untouched}`,
      subjectId: untouched,
    });
  }
  if (state.attempts.length >= 20 && submittedExams(state).length === 0) {
    recs.push({ id: "first-exam", kind: "exam", title: "Take a diagnostic mock exam", reason: "Benchmark yourself under timed conditions", href: "/exams" });
  }
  const seen = new Set<string>();
  return recs.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, limit);
}

export function subjectName(id: SubjectId) {
  return subjects.find((s) => s.id === id)?.name ?? id;
}
