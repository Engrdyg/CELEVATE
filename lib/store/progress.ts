"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChoiceId, SubjectId } from "@/lib/content/types";
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
  topic: string;
  selected: ChoiceId | null;
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

export interface ExamConfig {
  title: string;
  subjects: SubjectId[];
  questionCount: number;
  minutes: number;
  /** When true the exam auto-submits at the deadline. */
  autoSubmit: boolean;
  /** Whether results show the correct answers & solutions. */
  revealSolutions: boolean;
  shuffle: boolean;
}

export interface ExamSession {
  id: string;
  config: ExamConfig;
  questionIds: string[];
  answers: Record<string, ChoiceId>;
  flagged: string[];
  visited: string[];
  currentIndex: number;
  startedAt: string;
  deadline: string;
  submittedAt?: string;
  autoSubmitted?: boolean;
  status: "in-progress" | "submitted";
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
  startExam: (config: ExamConfig, questionIds: string[]) => string;
  answerExam: (examId: string, questionId: string, choice: ChoiceId | null) => void;
  toggleExamFlag: (examId: string, questionId: string) => void;
  setExamIndex: (examId: string, index: number) => void;
  submitExam: (examId: string, auto?: boolean) => void;
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

      startExam: (config, questionIds) => {
        const id = uid("exam");
        const started = new Date();
        const session: ExamSession = {
          id,
          config,
          questionIds,
          answers: {},
          flagged: [],
          visited: questionIds.length ? [questionIds[0]] : [],
          currentIndex: 0,
          startedAt: started.toISOString(),
          deadline: new Date(started.getTime() + config.minutes * 60_000).toISOString(),
          status: "in-progress",
        };
        // Only one active session at a time: discard any unfinished one.
        set((s) => ({ exams: [...s.exams.filter((e) => e.status === "submitted"), session] }));
        return id;
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
              ? {
                  ...e,
                  flagged: e.flagged.includes(questionId)
                    ? e.flagged.filter((q) => q !== questionId)
                    : [...e.flagged, questionId],
                }
              : e,
          ),
        })),

      setExamIndex: (examId, index) =>
        set((s) => ({
          exams: s.exams.map((e) => {
            if (e.id !== examId || e.status !== "in-progress") return e;
            const qid = e.questionIds[index];
            return {
              ...e,
              currentIndex: index,
              visited: qid && !e.visited.includes(qid) ? [...e.visited, qid] : e.visited,
            };
          }),
        })),

      submitExam: (examId, auto) => {
        const exam = get().exams.find((e) => e.id === examId);
        if (!exam || exam.status === "submitted") return;
        const submittedAt = auto ? exam.deadline : now();
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId ? { ...e, status: "submitted", submittedAt, autoSubmitted: !!auto } : e,
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
    { name: PROGRESS_KEY, version: 1, skipHydration: true },
  ),
);

/* ------------------------------------------------------------------ */
/*  Hydration                                                          */
/* ------------------------------------------------------------------ */

export const useHydrated = create<{ hydrated: boolean; set: () => void }>()((set) => ({
  hydrated: false,
  set: () => set({ hydrated: true }),
}));
