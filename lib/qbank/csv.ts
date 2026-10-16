import type { QuestionCore } from "./schema";

/** RFC 4180 CSV parsing/serialisation for bulk question import and export. */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const esc = (v: unknown) => {
  const s = v === undefined || v === null ? "" : typeof v === "string" ? v : JSON.stringify(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const CSV_COLUMNS = [
  "id", "subject", "topic", "subtopic", "type", "title", "stem", "figure",
  "choice_a", "choice_b", "choice_c", "choice_d", "value_a", "value_b", "value_c", "value_d",
  "answer", "difficulty", "estimated_time_seconds", "required", "final_answer", "insight",
  "given_json", "formulas_json", "variables_json", "solution_json", "common_errors_json",
  "related_concepts_json", "related_lesson_ids_json", "formula_ids_json", "references_json", "verification_unit",
] as const;

export function questionsToCsv(questions: QuestionCore[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const q of questions) {
    const ch = (k: string) => q.choices.find((c) => c.key === k);
    lines.push(
      [
        q.id, q.subject, q.topic, q.subtopic, q.type, q.title, q.stem, q.figure ?? "",
        ch("A")?.text, ch("B")?.text, ch("C")?.text, ch("D")?.text,
        ch("A")?.value ?? "", ch("B")?.value ?? "", ch("C")?.value ?? "", ch("D")?.value ?? "",
        q.answer, q.difficulty, q.estimatedTimeSeconds, q.required, q.finalAnswer, q.insight,
        q.given, q.formulas, q.variables, q.solution, q.commonErrors, q.relatedConcepts, q.relatedLessonIds, q.formulaIds, q.references,
        q.verification.unit ?? "",
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n") + "\n";
}

/** Converts CSV rows into raw question objects (still to be validated by the schema). */
export function csvToRawQuestions(text: string, now = new Date().toISOString()): { raw: unknown[]; errors: string[] } {
  const rows = parseCsv(text);
  const errors: string[] = [];
  if (!rows.length) return { raw: [], errors: ["CSV is empty"] };
  const header = rows[0].map((h) => h.trim());
  const missing = CSV_COLUMNS.filter((c) => !header.includes(c) && !["figure", "verification_unit", "references_json", "formula_ids_json", "related_lesson_ids_json"].includes(c));
  if (missing.length) return { raw: [], errors: [`Missing columns: ${missing.join(", ")}`] };
  const raw = rows.slice(1).map((cells, r) => {
    const get = (c: string) => cells[header.indexOf(c)]?.trim() ?? "";
    const parseJson = (c: string, fallback: unknown) => {
      const v = get(c);
      if (!v) return fallback;
      try {
        return JSON.parse(v);
      } catch {
        errors.push(`row ${r + 2}: column ${c} is not valid JSON`);
        return fallback;
      }
    };
    const num = (c: string) => (get(c) === "" ? undefined : Number(get(c)));
    const type = get("type");
    return {
      id: get("id"),
      subject: get("subject"),
      topic: get("topic"),
      subtopic: get("subtopic"),
      type,
      title: get("title"),
      stem: get("stem"),
      ...(get("figure") ? { figure: get("figure") } : {}),
      choices: (["A", "B", "C", "D"] as const).map((k) => ({ key: k, text: get(`choice_${k.toLowerCase()}`), ...(num(`value_${k.toLowerCase()}`) !== undefined ? { value: num(`value_${k.toLowerCase()}`) } : {}) })),
      answer: get("answer"),
      difficulty: get("difficulty"),
      estimatedTimeSeconds: Number(get("estimated_time_seconds")),
      given: parseJson("given_json", []),
      required: get("required"),
      formulas: parseJson("formulas_json", []),
      variables: parseJson("variables_json", []),
      solution: parseJson("solution_json", []),
      finalAnswer: get("final_answer"),
      insight: get("insight"),
      commonErrors: parseJson("common_errors_json", []),
      relatedConcepts: parseJson("related_concepts_json", []),
      relatedLessonIds: parseJson("related_lesson_ids_json", []),
      formulaIds: parseJson("formula_ids_json", []),
      references: parseJson("references_json", []),
      verification: type === "computational" ? { method: "python-recompute", status: "not-run", unit: get("verification_unit") || undefined } : { method: "conceptual-review", status: "not-run" },
      status: { validation: "draft", publication: "unpublished", smeReview: "pending" },
      meta: { author: "import", createdAt: now, updatedAt: now, version: 1, reviewedBy: null },
    };
  });
  return { raw, errors };
}
