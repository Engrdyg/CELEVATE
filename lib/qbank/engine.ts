/**
 * Pure question-bank engine: selection, choice shuffling, answer-safe views and scoring.
 * No I/O here so everything is unit-testable and shared by the file and Postgres stores.
 */
import type { ChoiceKey, QDifficulty, QSubjectId, QuestionCore } from "./schema";

/* ------------------------------------------------------------------ */
/*  Randomness                                                         */
/* ------------------------------------------------------------------ */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Proportional apportionment of `total` across weighted buckets, never exceeding a
 * bucket's capacity. Shortfalls from saturated buckets flow to the others.
 */
export function apportion(total: number, weights: Record<string, number>, capacity: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = Object.fromEntries(Object.keys(weights).map((k) => [k, 0]));
  let remaining = total;
  while (remaining > 0) {
    const active = Object.keys(weights).filter((k) => weights[k] > 0 && result[k] < (capacity[k] ?? 0));
    if (!active.length) break;
    const wsum = active.reduce((a, k) => a + weights[k], 0);
    const shares = active.map((k) => ({ k, x: (remaining * weights[k]) / wsum }));
    let given = 0;
    for (const { k, x } of shares) {
      const add = Math.min(Math.floor(x), capacity[k] - result[k]);
      result[k] += add;
      given += add;
    }
    if (given === 0) {
      // Hand out single units by largest fractional share to guarantee progress.
      for (const { k } of shares.sort((a, b) => b.x - Math.floor(b.x) - (a.x - Math.floor(a.x)) || b.x - a.x)) {
        if (given >= remaining) break;
        if (result[k] < capacity[k]) {
          result[k] += 1;
          given += 1;
        }
      }
    }
    remaining -= given;
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Selection                                                          */
/* ------------------------------------------------------------------ */

export interface SelectableQuestion {
  id: string;
  subject: QSubjectId;
  topic: string;
  subtopic: string;
  difficulty: QDifficulty;
}

export interface SelectionOptions {
  count: number;
  subjects?: QSubjectId[];
  topics?: string[];
  subtopics?: string[];
  difficulties?: QDifficulty[];
  /** Proportional allocation across subjects (e.g. CELE weights). */
  subjectWeights?: Partial<Record<QSubjectId, number>>;
  /** Proportional allocation across difficulties inside each subject. */
  difficultyDistribution?: Partial<Record<QDifficulty, number>>;
  /** Topic id → weight (>1 makes the topic more likely). Used for weakness-based practice. */
  topicWeights?: Record<string, number>;
  /** Recently answered ids are only used when nothing else is available. */
  recentIds?: string[];
  /** Ids that must be included first (e.g. "practice this question"). */
  includeIds?: string[];
}

/** Weighted random order (Efraimidis–Spirakis), recent questions pushed to the back. */
function rankCandidates<T extends SelectableQuestion>(items: T[], opts: SelectionOptions, rng: Rng): T[] {
  const recent = new Set(opts.recentIds ?? []);
  return items
    .map((q) => {
      const w = Math.max(0.01, opts.topicWeights?.[q.topic] ?? opts.topicWeights?.[q.subtopic] ?? 1);
      return { q, key: Math.pow(rng(), 1 / w), recent: recent.has(q.id) };
    })
    .sort((a, b) => Number(a.recent) - Number(b.recent) || b.key - a.key)
    .map((x) => x.q);
}

/**
 * Picks `count` unique questions honoring filters, subject weights and the
 * difficulty distribution (each bounded by availability), then shuffles the order.
 */
export function selectQuestions<T extends SelectableQuestion>(pool: T[], opts: SelectionOptions, rng: Rng): T[] {
  const filtered = pool.filter(
    (q) =>
      (!opts.subjects?.length || opts.subjects.includes(q.subject)) &&
      (!opts.topics?.length || opts.topics.includes(q.topic)) &&
      (!opts.subtopics?.length || opts.subtopics.includes(q.subtopic)) &&
      (!opts.difficulties?.length || opts.difficulties.includes(q.difficulty)),
  );
  const unique = Array.from(new Map(filtered.map((q) => [q.id, q])).values());
  const count = Math.max(0, Math.min(opts.count, unique.length));
  const chosen = new Map<string, T>();

  for (const id of opts.includeIds ?? []) {
    const q = unique.find((x) => x.id === id);
    if (q && chosen.size < count) chosen.set(q.id, q);
  }

  const bySubject = new Map<string, T[]>();
  for (const q of unique) if (!chosen.has(q.id)) bySubject.set(q.subject, [...(bySubject.get(q.subject) ?? []), q]);

  const subjectWeights = opts.subjectWeights
    ? Object.fromEntries(Array.from(bySubject.keys()).map((s) => [s, opts.subjectWeights![s as QSubjectId] ?? 0]))
    : Object.fromEntries(Array.from(bySubject.entries()).map(([s, qs]) => [s, qs.length]));
  const subjectCap = Object.fromEntries(Array.from(bySubject.entries()).map(([s, qs]) => [s, qs.length]));
  const perSubject = apportion(count - chosen.size, subjectWeights, subjectCap);

  for (const [subject, qs] of bySubject) {
    let need = perSubject[subject] ?? 0;
    if (need <= 0) continue;
    if (opts.difficultyDistribution) {
      const byDiff = new Map<string, T[]>();
      for (const q of qs) byDiff.set(q.difficulty, [...(byDiff.get(q.difficulty) ?? []), q]);
      const weights = Object.fromEntries((["easy", "moderate", "difficult"] as const).map((d) => [d, opts.difficultyDistribution![d] ?? 0]));
      const caps = Object.fromEntries((["easy", "moderate", "difficult"] as const).map((d) => [d, byDiff.get(d)?.length ?? 0]));
      const perDiff = apportion(need, weights, caps);
      for (const [d, n] of Object.entries(perDiff)) {
        for (const q of rankCandidates(byDiff.get(d) ?? [], opts, rng).slice(0, n)) chosen.set(q.id, q);
      }
      need = (perSubject[subject] ?? 0) - qs.filter((q) => chosen.has(q.id)).length;
    }
    if (need > 0) {
      for (const q of rankCandidates(qs.filter((q) => !chosen.has(q.id)), opts, rng).slice(0, need)) chosen.set(q.id, q);
    }
  }
  // Top up if weights left gaps (e.g. a weighted subject ran out).
  if (chosen.size < count) {
    for (const q of rankCandidates(unique.filter((q) => !chosen.has(q.id)), opts, rng)) {
      if (chosen.size >= count) break;
      chosen.set(q.id, q);
    }
  }
  const included = (opts.includeIds ?? []).filter((id) => chosen.has(id));
  const rest = shuffle(Array.from(chosen.values()).filter((q) => !included.includes(q.id)), rng);
  return [...included.map((id) => chosen.get(id)!), ...rest];
}

/* ------------------------------------------------------------------ */
/*  Answer-safe and review views                                       */
/* ------------------------------------------------------------------ */

const LABELS: ChoiceKey[] = ["A", "B", "C", "D"];

export interface PublicChoice {
  /** Stable original key; does not reveal correctness. */
  id: ChoiceKey;
  /** Letter shown to the learner for this attempt. */
  label: ChoiceKey;
  text: string;
}

/** What the learner's browser receives before answering: no answer, no solution, no numeric values. */
export interface PublicQuestion {
  id: string;
  version: number;
  subject: QSubjectId;
  topic: string;
  subtopic: string;
  type: "computational" | "conceptual";
  title: string;
  stem: string;
  figure?: string;
  difficulty: QDifficulty;
  estimatedTimeSeconds: number;
  choices: PublicChoice[];
}

export function choiceOrder(rng: Rng, shuffleChoices = true): string {
  return (shuffleChoices ? shuffle(LABELS, rng) : LABELS).join("");
}

export function toPublicQuestion(q: QuestionCore, order: string): PublicQuestion {
  const keys = order.split("") as ChoiceKey[];
  return {
    id: q.id,
    version: q.meta.version,
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic,
    type: q.type,
    title: q.title,
    stem: q.stem,
    figure: q.figure,
    difficulty: q.difficulty,
    estimatedTimeSeconds: q.estimatedTimeSeconds,
    choices: keys.map((k, i) => {
      const c = q.choices.find((x) => x.key === k)!;
      return { id: k, label: LABELS[i], text: c.text };
    }),
  };
}

/** Maps original choice key → displayed letter for an attempt's order. */
export function labelMap(order: string): Record<ChoiceKey, ChoiceKey> {
  return Object.fromEntries(order.split("").map((k, i) => [k, LABELS[i]])) as Record<ChoiceKey, ChoiceKey>;
}

/** Rewrites "Choice C" references in authored text to the letters the learner actually saw. */
export function relabel(text: string, order: string) {
  const map = labelMap(order);
  return text.replace(/\b([Cc]hoices?)\s+([A-D])\b/g, (_, word: string, k: ChoiceKey) => `${word} ${map[k] ?? k}`);
}

export interface ReviewQuestion extends PublicQuestion {
  answer: ChoiceKey;
  answerLabel: ChoiceKey;
  given: string[];
  required: string;
  formulas: { label: string; tex: string }[];
  variables: { symbol: string; meaning: string; unit?: string }[];
  solution: { title: string; text: string; tex?: string }[];
  finalAnswer: string;
  insight: string;
  commonErrors: string[];
  relatedConcepts: string[];
  relatedLessonIds: string[];
  formulaIds: string[];
  references: string[];
  verification: { method: string; status: string; checkedAt?: string };
  smeReview: string;
}

/** Full verified solution view, only produced after the rules allow disclosure. */
export function toReviewQuestion(q: QuestionCore, order: string): ReviewQuestion {
  const pub = toPublicQuestion(q, order);
  return {
    ...pub,
    answer: q.answer,
    answerLabel: labelMap(order)[q.answer],
    given: q.given,
    required: q.required,
    formulas: q.formulas,
    variables: q.variables,
    solution: q.solution.map((s) => ({ ...s, text: relabel(s.text, order) })),
    finalAnswer: relabel(q.finalAnswer, order),
    insight: relabel(q.insight, order),
    commonErrors: q.commonErrors.map((e) => relabel(e, order)),
    relatedConcepts: q.relatedConcepts,
    relatedLessonIds: q.relatedLessonIds,
    formulaIds: q.formulaIds,
    references: q.references,
    verification: { method: q.verification.method, status: q.verification.status, checkedAt: q.verification.checkedAt },
    smeReview: q.status.smeReview,
  };
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

export interface GradedItem {
  id: string;
  version: number;
  subject: QSubjectId;
  topic: string;
  subtopic: string;
  difficulty: QDifficulty;
  selected: ChoiceKey | null;
  selectedLabel: ChoiceKey | null;
  answer: ChoiceKey;
  answerLabel: ChoiceKey;
  isCorrect: boolean;
  flagged: boolean;
  seconds?: number;
}

export interface Breakdown {
  key: string;
  correct: number;
  total: number;
  percent: number;
}

export interface ExamScore {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  rawScore: string;
  percent: number;
  bySubject: Breakdown[];
  byTopic: (Breakdown & { subject: QSubjectId })[];
  byDifficulty: Breakdown[];
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

export function gradeItem(q: QuestionCore, order: string, selected: string | null | undefined, flagged = false, seconds?: number): GradedItem {
  const sel = selected && ["A", "B", "C", "D"].includes(selected) ? (selected as ChoiceKey) : null;
  const map = labelMap(order);
  return {
    id: q.id,
    version: q.meta.version,
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic,
    difficulty: q.difficulty,
    selected: sel,
    selectedLabel: sel ? map[sel] : null,
    answer: q.answer,
    answerLabel: map[q.answer],
    isCorrect: sel === q.answer,
    flagged,
    seconds,
  };
}

export function scoreItems(items: GradedItem[]): ExamScore {
  const group = (f: (i: GradedItem) => string) => {
    const m = new Map<string, { correct: number; total: number; subject: QSubjectId }>();
    for (const i of items) {
      const k = f(i);
      const v = m.get(k) ?? { correct: 0, total: 0, subject: i.subject };
      v.total++;
      if (i.isCorrect) v.correct++;
      m.set(k, v);
    }
    return Array.from(m.entries()).map(([key, v]) => ({ key, correct: v.correct, total: v.total, percent: pct(v.correct, v.total), subject: v.subject }));
  };
  const correct = items.filter((i) => i.isCorrect).length;
  const unanswered = items.filter((i) => !i.selected).length;
  return {
    total: items.length,
    correct,
    incorrect: items.length - correct - unanswered,
    unanswered,
    rawScore: `${correct}/${items.length}`,
    percent: pct(correct, items.length),
    bySubject: group((i) => i.subject).map(({ subject: _s, ...b }) => b),
    byTopic: group((i) => i.topic).sort((a, b) => a.percent - b.percent),
    byDifficulty: group((i) => i.difficulty).map(({ subject: _s, ...b }) => b),
  };
}
