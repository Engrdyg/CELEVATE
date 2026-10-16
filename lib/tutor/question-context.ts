import type { QuestionCore } from "@/lib/qbank/schema";

/** Formats a verified question as grounding context for CELEVATE AI. */
export function questionContext(q: QuestionCore) {
  const lines = [
    `VERIFIED QUESTION CONTEXT (id ${q.id}, version ${q.meta.version})`,
    `This question and its solution were authored and independently verified by CELEVATE (${q.verification.method}, ${q.verification.status}). Treat the keyed answer and worked solution below as the authoritative reference.`,
    `If your own reasoning disagrees with the keyed answer, do not present your alternative as correct: explain the discrepancy carefully and suggest the learner use "Report an issue" so a reviewer can check it.`,
    `Choice letters below are the original letters; the learner may have seen the choices in a different order, so refer to choices by their content rather than by letter.`,
    "",
    `Title: ${q.title}`,
    `Problem: ${q.stem}`,
    ...q.choices.map((c) => `Choice ${c.key}: ${c.text}${c.key === q.answer ? "  ← keyed correct answer" : ""}`),
    `Given: ${q.given.join("; ") || "—"}`,
    `Required: ${q.required}`,
    `Formulas: ${q.formulas.map((f) => `${f.label}: $$${f.tex}$$`).join("; ")}`,
    "Verified solution:",
    ...q.solution.map((s, i) => `${i + 1}. ${s.title}: ${s.text}${s.tex ? ` $$${s.tex}$$` : ""}`),
    `Final answer: ${q.finalAnswer}`,
    `Engineering insight: ${q.insight}`,
    q.commonErrors.length ? `Common errors: ${q.commonErrors.join(" | ")}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}
