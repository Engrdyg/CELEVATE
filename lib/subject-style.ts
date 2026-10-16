import type { SubjectId } from "@/config/cele";

/** Color follows the entity: each subject keeps the same categorical slot everywhere. */
export const SUBJECT_COLOR: Record<SubjectId, string> = {
  mste: "var(--chart-1)",
  hge: "var(--chart-2)",
  psad: "var(--chart-3)",
};

export const MASTERY_LABEL = {
  "not-started": "Not started",
  building: "Building",
  developing: "Developing",
  proficient: "Proficient",
} as const;

export const MASTERY_TONE = {
  "not-started": "neutral",
  building: "warning",
  developing: "info",
  proficient: "success",
} as const;
