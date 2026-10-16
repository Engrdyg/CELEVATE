"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubjectId } from "@/lib/content/types";
import type { ChoiceKey, QDifficulty } from "@/lib/qbank/schema";
import type { PublicQuestion, SessionResult } from "@/lib/qbank/client";
import { getCatalogEntry } from "@/lib/qbank/catalog";
import { dayKey, uid } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Profile {
  name: string;
  /** Target examination, e.g. "November 2027 CELE". Free text — not tied to an official schedule. */
  targetExam: string;
  examDate?: string; // ISO date the learner entered themselves
  dailyGoalMinutes: number;
  focusSubjects: SubjectId[];
  experience: "student" | "graduate" | "retaker";
  createdAt: string;
}

export interface Attempt {
  questionId: string;
  subjectId: SubjectId;
  /** Taxonomy topic id (e.g. "hge-statics"). */
  topic: string;
  subtopic?: string;
  difficulty?: QDifficulty;
  selected: ChoiceKey | null;
  correct: boolean;
  at: string;
  seconds: number;
  mode: "practice" | "exam";
}

export interface LessonState {
  status: "in-progress" | "completed";
  lastVisitedAt: string;
  completedAt?: string;
}

export type BookmarkKind = "lesson" | "question" | "formula" | "note";
export interface Bookmark {
  kind: BookmarkKind;
  refId: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  source: "tutor" | "manual";
  createdAt: string;
}

/** Result summary kept on the device after the server grades a session. */
export interface StoredResult {
  percent: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  rawScore: string;
  durationSeconds: number;
  late: boolean;
  bySubject: SessionResult["score"]["bySubject"];
  byTopic: SessionResult["score"]["byTopic"];
  byDifficulty: SessionResult["score"]["byDifficulty"];
  items: { id: string; position: number; title: string; subject: SubjectId; topic: string; difficulty: QDifficulty; selectedLabel: ChoiceKey | null; answerLabel: ChoiceKey | null; isCorrect: boolean; flagged: boolean }[];
  resultToken: string;
  revealSolutions: boolean;
}

export interface ExamSession {
  /** Server-issued session id. */
  id: string;
  /** Signed session token (no answers inside); dropped after submission. */
  token: string | null;
  title: string;
  presetId?: string;
  questions: PublicQuestion[];
  answers: Record<string, ChoiceKey>;
  flagged: string[];
  visited: string[];
  times: Record<string, number>;
  currentIndex: number;
  startedAt: string;
  deadline: string | null;
  autoSubmit: boolean;
  revealSolutions: boolean;
  status: "in-progress" | "submitted";
  submittedAt?: string;
  autoSubmitted?: boolean;
  result?: StoredResult;
}

export interface LastLocation {
  href: string;
  title: string;
  subtitle?: string;
  kind: "lesson" | "practice" | "exam";
  at: string;
}

export interface ScheduledExam {
  title: string;
  at: string; // ISO datetime
  presetId: string;
}

export type DataMode = "personal" | "demo";

export interface ProgressState {
  dataMode: DataMode;
  profile: Profile | null;
  lessons: Record<string, LessonState>;
  attempts: Attempt[];
  bookmarks: Bookmark[];
  notes: Note[];
  /** minutes studied per local day key */
  studyLog: Record<string, number>;
  exams: ExamSession[];
  lastLocation: LastLocation | null;
  scheduledExam: ScheduledExam | null;
  readNotificationIds: string[];
}

interface ProgressActions {
  setProfile: (p: Omit<Profile, "createdAt">) => void;
  updateProfile: (p: Partial<Profile>) => void;
  visitLesson: (lessonId: string, loc: Omit<LastLocation, "at" | "kind">) => void;
  setLessonCompleted: (lessonId: string, completed: boolean) => void;
  toggleBookmark: (kind: BookmarkKind, refId: string) => boolean;
  recordAttempt: (a: Omit<Attempt, "at">) => void;
  addStudyTime: (minutes: number) => void;
  setLastLocation: (loc: Omit<LastLocation, "at">) => void;
  addNote: (n: Omit<Note, "id" | "createdAt">) => string;
  deleteNote: (id: string) => void;
  startExam: (s: { sessionId: string; token: string; title: string; presetId?: string; questions: PublicQuestion[]; startedAt: number; deadline: number | null; autoSubmit: boolean; revealSolutions: boolean }) => string;
  answerExam: (examId: string, questionId: string, choice: ChoiceKey | null) => void;
  toggleExamFlag: (examId: string, questionId: string) => void;
  setExamIndex: (examId: string, index: number) => void;
  addExamTime: (examId: string, questionId: string, seconds: number) => void;
  finishExam: (examId: string, result: SessionResult) => void;
  discardExam: (examId: string) => void;
  scheduleExam: (s: ScheduledExam | null) => void;
  markNotificationsRead: (ids: string[]) => void;
  loadState: (s: Partial<ProgressState>) => void;
  resetAll: () => void;
}

export type ProgressStore = ProgressState & ProgressActions;

export const initialProgress: ProgressState = {
  dataMode: "personal",
  profile: null,
  lessons: {},
  attempts: [],
  bookmarks: [],
  notes: [],
  studyLog: {},
  exams: [],
  lastLocation: null,
  scheduledExam: null,
  readNotificationIds: [],
};

export const PROGRESS_KEY = "celevate-progress";

/** Maps phase-0 ids (mste-q01, psad-q13 …) to question-bank ids (mste-q001, mste-q016 …). */
export function migrateQuestionId(id: string) {
  const m = id.match(/^(mste|hge|psad)-q(\d{2})$/);
  if (!m) return id;
  const n = Number(m[2]);
  if (m[1] === "psad" && n >= 13) return `mste-q${String(n + 3).padStart(3, "0")}`;
  return `${m[1]}-q${String(n).padStart(3, "0")}`;
}

const now = () => new Date().toISOString();

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      setProfile: (p) => set({ profile: { ...p, createdAt: now() } }),
      updateProfile: (p) => set((s) => (s.profile ? { profile: { ...s.profile, ...p } } : s)),

      visitLesson: (lessonId, loc) =>
        set((s) => {
          const prev = s.lessons[lessonId];
          return {
            lessons: {
              ...s.lessons,
              [lessonId]: { status: prev?.status ?? "in-progress", lastVisitedAt: now(), completedAt: prev?.completedAt },
            },
            lastLocation: { ...loc, kind: "lesson", at: now() },
          };
        }),

      setLessonCompleted: (lessonId, completed) =>
        set((s) => ({
          lessons: {
            ...s.lessons,
            [lessonId]: completed
              ? { status: "completed", lastVisitedAt: now(), completedAt: now() }
              : { status: "in-progress", lastVisitedAt: now() },
          },
        })),

      toggleBookmark: (kind, refId) => {
        const exists = get().bookmarks.some((b) => b.kind === kind && b.refId === refId);
        set((s) => ({
          bookmarks: exists
            ? s.bookmarks.filter((b) => !(b.kind === kind && b.refId === refId))
            : [{ kind, refId, createdAt: now() }, ...s.bookmarks],
        }));
        return !exists;
      },

      recordAttempt: (a) => set((s) => ({ attempts: [...s.attempts, { ...a, at: now() }] })),

      addStudyTime: (minutes) =>
        set((s) => {
          const k = dayKey();
          return { studyLog: { ...s.studyLog, [k]: Math.round(((s.studyLog[k] ?? 0) + minutes) * 100) / 100 } };
        }),

      setLastLocation: (loc) => set({ lastLocation: { ...loc, at: now() } }),

      addNote: (n) => {
        const id = uid("note");
        set((s) => ({ notes: [{ ...n, id, createdAt: now() }, ...s.notes] }));
        return id;
      },
      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          bookmarks: s.bookmarks.filter((b) => !(b.kind === "note" && b.refId === id)),
        })),

      startExam: (x) => {
        const session: ExamSession = {
          id: x.sessionId,
          token: x.token,
          title: x.title,
          presetId: x.presetId,
          questions: x.questions,
          answers: {},
          flagged: [],
          visited: x.questions.length ? [x.questions[0].id] : [],
          times: {},
          currentIndex: 0,
          startedAt: new Date(x.startedAt).toISOString(),
          deadline: x.deadline ? new Date(x.deadline).toISOString() : null,
          autoSubmit: x.autoSubmit,
          revealSolutions: x.revealSolutions,
          status: "in-progress",
        };
        // Only one active session at a time: discard any unfinished one.
        set((s) => ({ exams: [...s.exams.filter((e) => e.status === "submitted"), session] }));
        return session.id;
      },

      answerExam: (examId, questionId, choice) =>
        set((s) => ({
          exams: s.exams.map((e) => {
            if (e.id !== examId || e.status !== "in-progress") return e;
            const answers = { ...e.answers };
            if (choice) answers[questionId] = choice;
            else delete answers[questionId];
            return { ...e, answers };
          }),
        })),

      toggleExamFlag: (examId, questionId) =>
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId && e.status === "in-progress"
              ? { ...e, flagged: e.flagged.includes(questionId) ? e.flagged.filter((q) => q !== questionId) : [...e.flagged, questionId] }
              : e,
          ),
        })),

      setExamIndex: (examId, index) =>
        set((s) => ({
          exams: s.exams.map((e) => {
            if (e.id !== examId || e.status !== "in-progress") return e;
            const qid = e.questions[index]?.id;
            return { ...e, currentIndex: index, visited: qid && !e.visited.includes(qid) ? [...e.visited, qid] : e.visited };
          }),
        })),

      addExamTime: (examId, questionId, seconds) =>
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId && e.status === "in-progress" ? { ...e, times: { ...e.times, [questionId]: Math.round(((e.times[questionId] ?? 0) + seconds) * 10) / 10 } } : e,
          ),
        })),

      finishExam: (examId, r) => {
        const exam = get().exams.find((e) => e.id === examId);
        if (!exam || exam.status === "submitted") return;
        const result: StoredResult = {
          percent: r.score.percent,
          correct: r.score.correct,
          incorrect: r.score.incorrect,
          unanswered: r.score.unanswered,
          total: r.score.total,
          rawScore: r.score.rawScore,
          durationSeconds: r.durationSeconds,
          late: r.late,
          bySubject: r.score.bySubject,
          byTopic: r.score.byTopic,
          byDifficulty: r.score.byDifficulty,
          items: r.items.map((i) => ({ id: i.id, position: i.position, title: i.title, subject: i.subject, topic: i.topic, difficulty: i.difficulty, selectedLabel: i.selectedLabel, answerLabel: i.answerLabel, isCorrect: i.isCorrect, flagged: i.flagged })),
          resultToken: r.resultToken,
          revealSolutions: r.revealSolutions,
        };
        const attempts: Attempt[] = r.items.map((i) => ({
          questionId: i.id,
          subjectId: i.subject,
          topic: i.topic,
          subtopic: i.subtopic,
          difficulty: i.difficulty,
          selected: i.selected,
          correct: i.isCorrect,
          at: new Date(r.submittedAt).toISOString(),
          seconds: Math.round(exam.times[i.id] ?? 0),
          mode: "exam",
        }));
        set((s) => ({
          attempts: [...s.attempts, ...attempts],
          exams: s.exams.map((e) =>
            e.id === examId
              ? { ...e, status: "submitted", token: null, questions: [], submittedAt: new Date(r.submittedAt).toISOString(), autoSubmitted: r.autoSubmitted, result }
              : e,
          ),
        }));
      },

      discardExam: (examId) => set((s) => ({ exams: s.exams.filter((e) => e.id !== examId) })),

      scheduleExam: (scheduledExam) => set({ scheduledExam }),

      markNotificationsRead: (ids) =>
        set((s) => ({ readNotificationIds: Array.from(new Set([...s.readNotificationIds, ...ids])) })),

      loadState: (partial) => set({ ...initialProgress, ...partial }),

      resetAll: () => set({ ...initialProgress }),
    }),
    {
      name: PROGRESS_KEY,
      version: 2,
      skipHydration: true,
      // v1 exam sessions graded on the client and referenced retired question ids.
      migrate: (persisted, version) => {
        const s = persisted as ProgressState;
        if (version < 2) {
          return {
            ...s,
            exams: [],
            attempts: (s.attempts ?? []).map((a) => {
              const id = migrateQuestionId(a.questionId);
              const c = getCatalogEntry(id);
              return c ? { ...a, questionId: id, subjectId: c.subject, topic: c.topic, subtopic: c.subtopic, difficulty: c.difficulty } : { ...a, questionId: id };
            }),
            bookmarks: (s.bookmarks ?? []).map((b) => (b.kind === "question" ? { ...b, refId: migrateQuestionId(b.refId) } : b)),
          } as ProgressState;
        }
        return s;
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/*  Hydration                                                          */
/* ------------------------------------------------------------------ */

export const useHydrated = create<{ hydrated: boolean; set: () => void }>()((set) => ({
  hydrated: false,
  set: () => set({ hydrated: true }),
}));
