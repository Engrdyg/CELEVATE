import { CELE_SUBJECTS, SUBJECT_IDS, type SubjectId } from "@/config/cele";
import type { Chapter, Formula, Lesson, LessonMeta, Question, SubjectContent } from "./types";
import { content as mste } from "./mste";
import { content as hge } from "./hge";
import { content as psad } from "./psad";

export * from "./types";

const bySubject: Record<SubjectId, SubjectContent> = { mste, hge, psad };

export interface SubjectInfo {
  id: SubjectId;
  code: string;
  name: string;
  shortName: string;
  weight: number;
  description: string;
  chapters: Chapter[];
  lessonCount: number;
  availableLessonCount: number;
  questionCount: number;
  formulaCount: number;
}

const DESCRIPTIONS: Record<SubjectId, string> = {
  mste: "Algebra to calculus, plane and route surveying, and highway and traffic engineering fundamentals.",
  hge: "Fluid statics and flow, pipe systems, soil properties, effective stress and foundation behavior.",
  psad: "Statics, strength of materials, structural analysis, concrete and steel design, and construction methods.",
};

export const subjects: SubjectInfo[] = SUBJECT_IDS.map((id) => {
  const c = bySubject[id];
  const metas = c.chapters.flatMap((ch) => ch.lessons);
  return {
    id,
    ...CELE_SUBJECTS[id],
    description: DESCRIPTIONS[id],
    chapters: [...c.chapters].sort((a, b) => a.number - b.number),
    lessonCount: metas.length,
    availableLessonCount: metas.filter((l) => l.status === "available").length,
    questionCount: c.questions.length,
    formulaCount: c.formulas.length,
  };
});

export const allLessons: Lesson[] = SUBJECT_IDS.flatMap((id) => bySubject[id].lessons);
export const allQuestions: Question[] = SUBJECT_IDS.flatMap((id) => bySubject[id].questions);
export const allFormulas: Formula[] = SUBJECT_IDS.flatMap((id) => bySubject[id].formulas);
export const allChapters: Chapter[] = subjects.flatMap((s) => s.chapters);

const lessonMap = new Map(allLessons.map((l) => [l.id, l]));
const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
const formulaMap = new Map(allFormulas.map((f) => [f.id, f]));
const subjectMap = new Map(subjects.map((s) => [s.id, s]));
const chapterMap = new Map(allChapters.map((c) => [c.id, c]));

export const getSubject = (id: string) => subjectMap.get(id as SubjectId);
export const getLesson = (id: string) => lessonMap.get(id);
export const getQuestion = (id: string) => questionMap.get(id);
export const getFormula = (id: string) => formulaMap.get(id);
export const getChapter = (id: string) => chapterMap.get(id);

/** Every lesson meta in syllabus order (including lessons in preparation). */
export const lessonOutline: (LessonMeta & { subjectId: SubjectId; chapterId: string })[] = subjects.flatMap((s) =>
  s.chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, subjectId: s.id, chapterId: ch.id }))),
);

export const availableLessonIds = lessonOutline.filter((l) => l.status === "available").map((l) => l.id);

export function lessonHref(lessonId: string) {
  const l = lessonOutline.find((x) => x.id === lessonId);
  return l ? `/subjects/${l.subjectId}/${l.id}` : "/subjects";
}

/** Next/previous available lesson in syllabus order within the same subject. */
export function adjacentLessons(lessonId: string) {
  const l = lessonOutline.find((x) => x.id === lessonId);
  if (!l) return { prev: undefined, next: undefined };
  const list = lessonOutline.filter((x) => x.subjectId === l.subjectId && x.status === "available");
  const i = list.findIndex((x) => x.id === lessonId);
  return { prev: list[i - 1], next: list[i + 1] };
}

export const topics = Array.from(new Set(allQuestions.map((q) => `${q.subjectId}::${q.topic}`))).map((k) => {
  const [subjectId, topic] = k.split("::") as [SubjectId, string];
  return { subjectId, topic };
});
