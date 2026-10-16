import type { SubjectId } from "@/config/cele";

export type { SubjectId };

/**
 * Rich text strings support a tiny inline syntax:
 *  - `$...$`   inline KaTeX math (write strings with String.raw so backslashes survive)
 *  - `**...**` bold emphasis
 * Nothing else (no HTML, no markdown links).
 */
export type RichText = string;

/** Engineering diagrams rendered as themed inline SVG components. */
export type FigureId =
  | "right-triangle"
  | "simple-curve"
  | "differential-leveling"
  | "closed-traverse"
  | "vertical-curve"
  | "soil-phase-diagram"
  | "hydrostatic-plane"
  | "pipe-flow"
  | "simple-beam-udl"
  | "cantilever-point-load"
  | "rc-beam-section"
  | "column-buckling";

export type Difficulty = "easy" | "medium" | "hard";

export interface Step {
  /** Explanation of the step (rich text). */
  text: RichText;
  /** Optional display equation for the step (KaTeX, display mode). */
  tex?: string;
}

export type LessonBlock =
  | { type: "heading"; id: string; text: string }
  | { type: "paragraph"; text: RichText }
  | { type: "math"; tex: string; label?: string }
  | {
      type: "callout";
      tone: "concept" | "tip" | "warning" | "exam";
      title: string;
      text: RichText;
    }
  | { type: "list"; ordered?: boolean; items: RichText[] }
  | { type: "table"; caption?: string; head: string[]; rows: RichText[][] }
  | {
      type: "example";
      title: string;
      problem: RichText;
      given?: RichText[];
      steps: Step[];
      answer: RichText;
    }
  | { type: "figure"; figure: FigureId; caption: string }
  /** Embeds a practice question (by id) as an inline self-check. */
  | { type: "check"; questionId: string };

export interface LessonMeta {
  id: string;
  title: string;
  summary: string;
  /** Estimated reading time in minutes. */
  minutes: number;
  /** "in-preparation" lessons are listed in the outline but not yet readable. */
  status: "available" | "in-preparation";
  topics: string[];
}

export interface Lesson extends LessonMeta {
  subjectId: SubjectId;
  chapterId: string;
  blocks: LessonBlock[];
  /** Formula ids shown in the reference panel. */
  formulaIds: string[];
  /** Practice question ids recommended after the lesson. */
  questionIds: string[];
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  number: number;
  title: string;
  summary: string;
  lessons: LessonMeta[];
}

export type ChoiceId = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  topic: string;
  difficulty: Difficulty;
  stem: RichText;
  figure?: FigureId;
  choices: { id: ChoiceId; text: RichText }[];
  answer: ChoiceId;
  solution: {
    summary: RichText;
    steps: Step[];
    formulaIds: string[];
    commonErrors: RichText[];
  };
  relatedLessonIds: string[];
}

export interface Formula {
  id: string;
  subjectId: SubjectId;
  /** Grouping inside the formula library, e.g. "Horizontal Curves". */
  category: string;
  name: string;
  tex: string;
  description: RichText;
  variables: { symbol: string; meaning: string; unit?: string }[];
  notes?: RichText;
  relatedLessonIds: string[];
}

export interface SubjectContent {
  chapters: Chapter[];
  lessons: Lesson[];
  questions: Question[];
  formulas: Formula[];
}
