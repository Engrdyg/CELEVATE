import taxonomy from "@/data/question-bank/taxonomy.json";
import examConfig from "@/data/question-bank/exam-config.json";

/**
 * CELE examination configuration, derived from the administrator-editable
 * files in data/question-bank/ (taxonomy.json and exam-config.json).
 * Subject titles and weights follow the PRC examination program; always
 * re-verify against the latest PRC Board of Civil Engineering issuance.
 */
type SubjectEntry = { code: string; name: string; officialTitle: string; shortName: string; weight: number };

export const CELE_SUBJECTS = Object.fromEntries(
  taxonomy.subjects.map((s) => [s.id, { code: s.code, name: s.name, officialTitle: s.officialTitle, shortName: s.shortName, weight: s.weight }]),
) as Record<"mste" | "hge" | "psad", SubjectEntry>;

export type SubjectId = "mste" | "hge" | "psad";
export const SUBJECT_IDS: SubjectId[] = ["mste", "hge", "psad"];

/** Commonly cited rating rules. Treat as configurable reference values. */
export const CELE_RULES = {
  passingAverage: examConfig.passingReference.generalAverage,
  minimumSubjectGrade: examConfig.passingReference.minimumSubjectGrade,
  note: examConfig.passingReference.note,
};
