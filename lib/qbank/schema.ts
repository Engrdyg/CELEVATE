import { z } from "zod";

/*
 * CELEVATE question-bank record schema.
 *
 * Rich text fields support inline KaTeX as `$...$` and `**bold**`.
 * `*Tex` fields hold raw KaTeX source (display mode) without `$` delimiters.
 */

export const SUBJECT_IDS = ["mste", "hge", "psad"] as const;
export const DIFFICULTIES = ["easy", "moderate", "difficult"] as const;
export const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

/** Workflow: draft → technical_review → verified → (published). `rejected` / `needs_review` never publish. */
export const VALIDATION_STATUSES = ["draft", "technical_review", "verified", "needs_review", "rejected"] as const;
export const PUBLICATION_STATUSES = ["unpublished", "published", "archived"] as const;
export const SME_STATUSES = ["pending", "approved", "changes_requested"] as const;

export const FIGURE_IDS = [
  "right-triangle",
  "simple-curve",
  "differential-leveling",
  "closed-traverse",
  "vertical-curve",
  "soil-phase-diagram",
  "hydrostatic-plane",
  "pipe-flow",
  "simple-beam-udl",
  "cantilever-point-load",
  "rc-beam-section",
  "column-buckling",
] as const;

const PLACEHOLDER = /(insert question|sample engineering problem|solution to be generated|answer tbd|\btbd\b|lorem ipsum|placeholder|todo\b)/i;
const richText = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !PLACEHOLDER.test(s), { message: "Contains placeholder text" });

export const choiceSchema = z.object({
  key: z.enum(CHOICE_KEYS),
  text: richText,
  /** Numeric value of the choice (in `verification.unit`) for computational questions. */
  value: z.number().finite().optional(),
});

export const stepSchema = z.object({
  title: z.string().trim().min(1),
  text: richText,
  tex: z.string().trim().min(1).optional(),
});

export const variableSchema = z.object({
  symbol: z.string().trim().min(1),
  meaning: z.string().trim().min(1),
  unit: z.string().trim().optional(),
});

export const formulaSchema = z.object({
  label: z.string().trim().min(1),
  tex: z.string().trim().min(1),
});

export const verificationSchema = z.object({
  /** python-recompute: independent deterministic script; conceptual-review: requires a human reviewer. */
  method: z.enum(["python-recompute", "conceptual-review"]),
  /** For python-recompute: "verify/<subject>.py::<function>" */
  script: z.string().optional(),
  computedValue: z.number().finite().optional(),
  unit: z.string().optional(),
  /** Relative tolerance used when comparing the computed value with the keyed choice. */
  tolerance: z.number().positive().max(0.05).optional(),
  status: z.enum(["passed", "failed", "not-run"]),
  checkedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const statusSchema = z.object({
  validation: z.enum(VALIDATION_STATUSES),
  publication: z.enum(PUBLICATION_STATUSES),
  smeReview: z.enum(SME_STATUSES),
});

export const metaSchema = z.object({
  author: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  version: z.number().int().positive(),
  reviewedBy: z.string().nullable(),
  smeReviewer: z.string().nullable().optional(),
  /** Who saved this version (the original author for version 1). */
  updatedBy: z.string().optional(),
  /** Why this version was saved. */
  changeReason: z.string().optional(),
});

export const questionCoreSchema = z.object({
  id: z.string().regex(/^(mste|hge|psad)-q\d{3,4}$/, "id must look like mste-q001"),
  subject: z.enum(SUBJECT_IDS),
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  type: z.enum(["computational", "conceptual"]),
  title: z.string().trim().min(4).max(120),
  stem: richText,
  figure: z.enum(FIGURE_IDS).optional(),
  choices: z.array(choiceSchema).length(4),
  answer: z.enum(CHOICE_KEYS),
  difficulty: z.enum(DIFFICULTIES),
  estimatedTimeSeconds: z.number().int().min(30).max(900),
  given: z.array(richText),
  required: richText,
  formulas: z.array(formulaSchema),
  variables: z.array(variableSchema),
  solution: z.array(stepSchema).min(2),
  finalAnswer: richText,
  insight: richText,
  commonErrors: z.array(richText),
  relatedConcepts: z.array(z.string().min(1)).min(1),
  relatedLessonIds: z.array(z.string()),
  formulaIds: z.array(z.string()),
  references: z.array(z.string()),
  verification: verificationSchema,
  status: statusSchema,
  meta: metaSchema,
});

export const questionSchema = questionCoreSchema
  .extend({
    /** Snapshots of earlier versions (newest last). Exam attempts pin a version number. */
    history: z.array(z.object({ version: z.number().int().positive(), snapshot: z.unknown(), changedBy: z.string(), changeReason: z.string(), changedAt: z.string() })).default([]),
  })
  .superRefine((q, ctx) => {
    const keys = q.choices.map((c) => c.key);
    if (new Set(keys).size !== 4 || CHOICE_KEYS.some((k) => !keys.includes(k))) ctx.addIssue({ code: "custom", message: "Choices must be exactly A, B, C, D", path: ["choices"] });
    const texts = q.choices.map((c) => c.text.replace(/\s+/g, " ").trim().toLowerCase());
    if (new Set(texts).size !== 4) ctx.addIssue({ code: "custom", message: "Duplicate choice text", path: ["choices"] });
    if (!q.subtopic.startsWith(q.topic) && !q.subtopic.startsWith(q.subject)) ctx.addIssue({ code: "custom", message: "Subtopic id must belong to the subject", path: ["subtopic"] });
    if (!q.id.startsWith(q.subject + "-")) ctx.addIssue({ code: "custom", message: "Question id prefix must match subject", path: ["id"] });
    if (q.type === "computational") {
      if (q.verification.method !== "python-recompute") ctx.addIssue({ code: "custom", message: "Computational questions need python-recompute verification", path: ["verification", "method"] });
      if (q.given.length === 0) ctx.addIssue({ code: "custom", message: "Computational questions must list given values", path: ["given"] });
      if (q.formulas.length === 0) ctx.addIssue({ code: "custom", message: "Computational questions must list at least one formula", path: ["formulas"] });
      if (q.choices.some((c) => c.value === undefined)) ctx.addIssue({ code: "custom", message: "Computational questions need a numeric value on every choice", path: ["choices"] });
    }
    if (q.status.publication === "published") {
      if (q.status.validation !== "verified") ctx.addIssue({ code: "custom", message: "Only verified questions can be published", path: ["status", "publication"] });
      if (q.verification.status !== "passed") ctx.addIssue({ code: "custom", message: "Published questions must have passed verification", path: ["verification", "status"] });
    }
  });

export type QuestionCore = z.infer<typeof questionCoreSchema>;
export type Question = z.infer<typeof questionSchema>;
export type ChoiceKey = (typeof CHOICE_KEYS)[number];
export type QDifficulty = (typeof DIFFICULTIES)[number];
export type QSubjectId = (typeof SUBJECT_IDS)[number];
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export const bankFileSchema = z.object({
  subject: z.enum(SUBJECT_IDS),
  title: z.string(),
  questions: z.array(questionSchema),
});
export type BankFile = z.infer<typeof bankFileSchema>;

/** Allowed workflow transitions. */
export const TRANSITIONS: Record<ValidationStatus, ValidationStatus[]> = {
  draft: ["technical_review", "rejected"],
  technical_review: ["verified", "needs_review", "rejected", "draft"],
  needs_review: ["technical_review", "draft", "rejected"],
  verified: ["technical_review", "needs_review"],
  rejected: ["draft"],
};
