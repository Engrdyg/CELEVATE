import { SUBJECT_IDS, type SubjectId } from "@/config/cele";
import { allQuestions } from "@/lib/content";
import type { ExamConfig } from "@/lib/store/progress";

export interface ExamPreset {
  id: string;
  title: string;
  description: string;
  config: ExamConfig;
}

const base = { autoSubmit: true, revealSolutions: true, shuffle: true };

export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: "mixed-30",
    title: "Mixed diagnostic",
    description: "All three subject areas under time pressure — a broad readiness check.",
    config: { ...base, title: "Mixed diagnostic · 30 items", subjects: [...SUBJECT_IDS], questionCount: 30, minutes: 60 },
  },
  {
    id: "mste-15",
    title: "MSTE sprint",
    description: "Mathematics, surveying and transportation engineering.",
    config: { ...base, title: "MSTE sprint · 15 items", subjects: ["mste"], questionCount: 15, minutes: 30 },
  },
  {
    id: "hge-15",
    title: "HGE sprint",
    description: "Hydraulics and geotechnical engineering.",
    config: { ...base, title: "HGE sprint · 15 items", subjects: ["hge"], questionCount: 15, minutes: 30 },
  },
  {
    id: "psad-15",
    title: "PSAD sprint",
    description: "Structural engineering and construction.",
    config: { ...base, title: "PSAD sprint · 15 items", subjects: ["psad"], questionCount: 15, minutes: 30 },
  },
];

export function poolSize(subjects: SubjectId[]) {
  return allQuestions.filter((q) => subjects.includes(q.subjectId)).length;
}

/** Picks questions, balanced across the chosen subjects. */
export function pickQuestions(config: ExamConfig): string[] {
  const shuffle = <T,>(a: T[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const per = config.subjects.map((s) => (config.shuffle ? shuffle : (x: typeof allQuestions) => x)(allQuestions.filter((q) => q.subjectId === s)));
  const out: string[] = [];
  let i = 0;
  while (out.length < config.questionCount && per.some((p) => p.length)) {
    const bucket = per[i % per.length];
    const q = bucket.shift();
    if (q) out.push(q.id);
    i++;
  }
  return config.shuffle ? shuffle(out) : out;
}
