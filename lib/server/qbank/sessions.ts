import { z } from "zod";
import {
  choiceOrder,
  gradeItem,
  mulberry32,
  scoreItems,
  selectQuestions,
  toPublicQuestion,
  toReviewQuestion,
  type GradedItem,
  type PublicQuestion,
  type ReviewQuestion,
} from "@/lib/qbank/engine";
import { DIFFICULTIES, SUBJECT_IDS, type QuestionCore } from "@/lib/qbank/schema";
import { examConfig } from "@/lib/qbank/taxonomy";
import { randomId, randomSeed, sign, verify, TokenError } from "@/lib/server/tokens";
import { getStore } from "./index";
import { StoreError } from "./types";

/* ------------------------------------------------------------------ */
/*  Requests                                                           */
/* ------------------------------------------------------------------ */

export const MODES = ["topic", "subject", "random", "weakness", "timed", "mock"] as const;

export const startSchema = z
  .object({
    mode: z.enum(MODES),
    subjects: z.array(z.enum(SUBJECT_IDS)).max(3).optional(),
    topics: z.array(z.string().max(60)).max(30).optional(),
    subtopics: z.array(z.string().max(60)).max(60).optional(),
    difficulties: z.array(z.enum(DIFFICULTIES)).max(3).optional(),
    count: z.number().int().min(1).max(100).default(10),
    minutes: z.number().int().min(1).max(300).optional(),
    feedback: z.enum(["instant", "end"]).default("instant"),
    presetId: z.string().max(40).optional(),
    title: z.string().max(80).optional(),
    autoSubmit: z.boolean().optional(),
    revealSolutions: z.boolean().optional(),
    useDifficultyDistribution: z.boolean().optional(),
    topicWeights: z.record(z.string().max(60), z.number().min(0).max(10)).optional(),
    recentIds: z.array(z.string().max(20)).max(500).optional(),
    includeIds: z.array(z.string().max(20)).max(5).optional(),
    shuffleChoices: z.boolean().default(true),
  })
  .strict();
export type StartRequest = z.infer<typeof startSchema>;

/* ------------------------------------------------------------------ */
/*  Token payloads                                                     */
/* ------------------------------------------------------------------ */

type Item = [id: string, version: number, order: string];

interface SessionPayload {
  v: 1;
  kind: "session";
  sid: string;
  mode: (typeof MODES)[number];
  feedback: "instant" | "end";
  title: string;
  presetId?: string;
  startedAt: number;
  deadline?: number;
  autoSubmit: boolean;
  reveal: boolean;
  items: Item[];
}

interface ResultPayload {
  v: 1;
  kind: "result";
  sid: string;
  title: string;
  mode: SessionPayload["mode"];
  startedAt: number;
  submittedAt: number;
  deadline?: number;
  autoSubmitted: boolean;
  late: boolean;
  reveal: boolean;
  items: Item[];
  answers: Record<string, string>;
  flagged: string[];
}

interface RevealPayload {
  v: 1;
  kind: "reveal";
  ids: string[];
  exp: number;
}

const GRACE_MS = 120_000;

/** A graded item as sent to the learner; the key is withheld when the rules hide solutions. */
export type LearnerGradedItem = Omit<GradedItem, "answer" | "answerLabel"> & { answer: GradedItem["answer"] | null; answerLabel: GradedItem["answerLabel"] | null };
const withhold = (g: GradedItem, reveal: boolean): LearnerGradedItem => (reveal ? g : { ...g, answer: null, answerLabel: null });
const DAY = 86_400_000;

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

export interface StartResponse {
  token: string;
  sessionId: string;
  mode: SessionPayload["mode"];
  feedback: SessionPayload["feedback"];
  title: string;
  startedAt: number;
  deadline: number | null;
  autoSubmit: boolean;
  revealSolutions: boolean;
  questions: PublicQuestion[];
  available: number;
}

export async function startSession(input: StartRequest): Promise<StartResponse> {
  const store = await getStore();
  const pool = await store.published();
  const rng = mulberry32(randomSeed());

  let title = input.title ?? "Practice set";
  let count = input.count;
  let minutes = input.minutes;
  let feedback = input.feedback;
  let autoSubmit = input.autoSubmit ?? true;
  let reveal = input.revealSolutions ?? true;
  let subjects = input.subjects;
  let subjectWeights: Record<string, number> | undefined;
  let difficultyDistribution = input.useDifficultyDistribution ? examConfig.difficultyDistribution : undefined;

  switch (input.mode) {
    case "topic":
      if (!input.topics?.length && !input.subtopics?.length) throw new StoreError("Choose a topic or subtopic for topic practice");
      title = input.title ?? "Topic practice";
      break;
    case "subject":
      if (!subjects?.length) throw new StoreError("Choose a subject for subject practice");
      title = input.title ?? "Subject practice";
      break;
    case "weakness":
      if (!input.topicWeights || !Object.keys(input.topicWeights).length) throw new StoreError("Weakness practice needs topic performance data");
      title = input.title ?? "Weak-area practice";
      break;
    case "timed":
      if (!minutes) throw new StoreError("Timed practice needs a time limit");
      title = input.title ?? "Timed practice";
      break;
    case "mock": {
      const preset = input.presetId ? examConfig.presets.find((p) => p.id === input.presetId) : undefined;
      if (input.presetId && !preset) throw new StoreError("Unknown exam preset");
      if (preset) {
        title = preset.title;
        subjects = preset.subjects;
        count = preset.questionCount;
        minutes = preset.minutes;
        autoSubmit = preset.autoSubmit;
        reveal = preset.revealSolutions;
        if (preset.useDifficultyDistribution) difficultyDistribution = examConfig.difficultyDistribution;
      } else {
        title = input.title ?? "Custom mock exam";
        if (!minutes) throw new StoreError("Mock exams need a time limit");
      }
      subjectWeights = Object.fromEntries((subjects ?? SUBJECT_IDS).map((s) => [s, examConfig.subjectWeights[s]]));
      feedback = "end";
      break;
    }
  }

  const chosen = selectQuestions(
    pool,
    {
      count,
      subjects,
      topics: input.topics,
      subtopics: input.subtopics,
      difficulties: input.difficulties,
      subjectWeights,
      difficultyDistribution,
      topicWeights: input.topicWeights,
      recentIds: input.recentIds,
      includeIds: input.includeIds,
    },
    rng,
  );
  if (!chosen.length) throw new StoreError("No published questions match this selection yet", 404);

  const now = Date.now();
  const items: Item[] = chosen.map((q) => [q.id, q.meta.version, choiceOrder(rng, input.shuffleChoices)]);
  const payload: SessionPayload = {
    v: 1,
    kind: "session",
    sid: randomId("ses"),
    mode: input.mode,
    feedback,
    title,
    presetId: input.presetId,
    startedAt: now,
    deadline: minutes ? now + minutes * 60_000 : undefined,
    autoSubmit,
    reveal,
    items,
  };
  return {
    token: sign(payload),
    sessionId: payload.sid,
    mode: payload.mode,
    feedback,
    title,
    startedAt: now,
    deadline: payload.deadline ?? null,
    autoSubmit,
    revealSolutions: reveal,
    questions: chosen.map((q, i) => toPublicQuestion(q, items[i][2])),
    available: pool.filter((q) => !subjects?.length || subjects.includes(q.subject)).length,
  };
}

/* ------------------------------------------------------------------ */
/*  Instant feedback (practice)                                        */
/* ------------------------------------------------------------------ */

async function loadPinned(id: string, version: number): Promise<QuestionCore> {
  const store = await getStore();
  const q = (await store.getVersion(id, version)) ?? (await store.get(id));
  if (!q) throw new StoreError(`Question ${id} is no longer available`, 410);
  return q;
}

export function revealToken(ids: string[]) {
  const payload: RevealPayload = { v: 1, kind: "reveal", ids, exp: Date.now() + DAY };
  return sign(payload);
}

export function verifyReveal(token: string, id: string) {
  const p = verify<RevealPayload>(token, "reveal");
  if (!p.ids.includes(id)) throw new TokenError("This question has not been revealed in your session");
  return p;
}

export async function checkAnswer(token: string, questionId: string, choice: string) {
  const s = verify<SessionPayload>(token, "session");
  if (s.feedback !== "instant") throw new StoreError("Answers are hidden until this session is submitted", 403);
  if (s.deadline && Date.now() > s.deadline + GRACE_MS) throw new StoreError("This timed session has ended", 403);
  const item = s.items.find((i) => i[0] === questionId);
  if (!item) throw new StoreError("Question is not part of this session", 400);
  const q = await loadPinned(item[0], item[1]);
  const graded = gradeItem(q, item[2], choice);
  return { item: graded, review: toReviewQuestion(q, item[2]), revealToken: revealToken([questionId]) };
}

/* ------------------------------------------------------------------ */
/*  Submit & review                                                    */
/* ------------------------------------------------------------------ */

export const submitSchema = z.object({
  token: z.string(),
  answers: z.record(z.string().max(20), z.enum(["A", "B", "C", "D"])).default({}),
  flagged: z.array(z.string().max(20)).max(200).default([]),
  times: z.record(z.string().max(20), z.number().min(0).max(36_000)).optional(),
  auto: z.boolean().default(false),
  learnerId: z.string().max(64).optional(),
});

export interface SessionResult {
  sessionId: string;
  title: string;
  mode: SessionPayload["mode"];
  startedAt: number;
  submittedAt: number;
  deadline: number | null;
  autoSubmitted: boolean;
  late: boolean;
  durationSeconds: number;
  revealSolutions: boolean;
  score: ReturnType<typeof scoreItems>;
  items: (LearnerGradedItem & { position: number; title: string })[];
  resultToken: string;
  revealToken: string | null;
  stored: boolean;
}

export async function submitSession(input: z.infer<typeof submitSchema>): Promise<SessionResult> {
  const s = verify<SessionPayload>(input.token, "session");
  const now = Date.now();
  const late = !!s.deadline && now > s.deadline + GRACE_MS;
  const submittedAt = s.deadline ? Math.min(now, s.deadline + GRACE_MS) : now;
  const ids = new Set(s.items.map((i) => i[0]));
  const answers = Object.fromEntries(Object.entries(input.answers).filter(([k]) => ids.has(k)));
  const flagged = input.flagged.filter((k) => ids.has(k));

  const items = await Promise.all(
    s.items.map(async (it, idx) => {
      const q = await loadPinned(it[0], it[1]);
      return { ...gradeItem(q, it[2], answers[it[0]], flagged.includes(it[0]), input.times?.[it[0]]), position: idx + 1, title: q.title, order: it[2] };
    }),
  );
  const score = scoreItems(items);
  const resultPayload: ResultPayload = {
    v: 1,
    kind: "result",
    sid: s.sid,
    title: s.title,
    mode: s.mode,
    startedAt: s.startedAt,
    submittedAt,
    deadline: s.deadline,
    autoSubmitted: input.auto || late,
    late,
    reveal: s.reveal,
    items: s.items,
    answers,
    flagged,
  };
  const store = await getStore();
  const stored = await store
    .recordAttempt({
      id: s.sid,
      learnerId: input.learnerId ?? "anonymous",
      examId: s.presetId ?? null,
      title: s.title,
      startedAt: new Date(s.startedAt).toISOString(),
      deadlineAt: s.deadline ? new Date(s.deadline).toISOString() : null,
      submittedAt: new Date(submittedAt).toISOString(),
      percent: score.percent,
      correct: score.correct,
      total: score.total,
      durationSeconds: Math.round((submittedAt - s.startedAt) / 1000),
      autoSubmitted: resultPayload.autoSubmitted,
      items,
    })
    .catch((e) => {
      console.error("[qbank] failed to record attempt", e);
      return false;
    });

  return {
    sessionId: s.sid,
    title: s.title,
    mode: s.mode,
    startedAt: s.startedAt,
    submittedAt,
    deadline: s.deadline ?? null,
    autoSubmitted: resultPayload.autoSubmitted,
    late,
    durationSeconds: Math.round((submittedAt - s.startedAt) / 1000),
    revealSolutions: s.reveal,
    score,
    items: items.map(({ order: _o, position, title, ...g }) => ({ ...withhold(g, s.reveal), position, title })),
    resultToken: sign(resultPayload),
    revealToken: s.reveal ? revealToken(s.items.map((i) => i[0])) : null,
    stored,
  };
}

export interface ReviewItem {
  position: number;
  graded: LearnerGradedItem;
  question: PublicQuestion | ReviewQuestion;
  solutionAvailable: boolean;
}

/** Re-derives the graded review for a submitted session from the pinned question versions. */
export async function reviewSession(resultToken: string): Promise<{ title: string; reveal: boolean; revealToken: string | null; items: ReviewItem[] }> {
  const r = verify<ResultPayload>(resultToken, "result");
  const items = await Promise.all(
    r.items.map(async (it, idx) => {
      const q = await loadPinned(it[0], it[1]);
      const graded = gradeItem(q, it[2], r.answers[it[0]], r.flagged.includes(it[0]));
      return {
        position: idx + 1,
        graded: withhold(graded, r.reveal),
        question: r.reveal ? toReviewQuestion(q, it[2]) : toPublicQuestion(q, it[2]),
        solutionAvailable: r.reveal,
      } satisfies ReviewItem;
    }),
  );
  return { title: r.title, reveal: r.reveal, revealToken: r.reveal ? revealToken(r.items.map((i) => i[0])) : null, items };
}

/** Verified question context for the AI tutor (only for revealed questions). */
export async function revealedQuestion(token: string, id: string): Promise<QuestionCore> {
  verifyReveal(token, id);
  const store = await getStore();
  const q = await store.get(id);
  if (!q || q.status.publication !== "published") throw new StoreError("Question not available", 404);
  return q;
}
