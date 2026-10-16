import katex from "katex";
import { bankFileSchema, questionSchema, type Question } from "./schema";
import { findDuplicates, type DuplicatePair } from "./duplicates";
import type { Taxonomy } from "./taxonomy";

export interface ValidationIssue {
  id: string;
  level: "error" | "warning";
  message: string;
}

export interface ValidationContext {
  taxonomy: Taxonomy;
  knownLessonIds?: Set<string>;
  knownFormulaIds?: Set<string>;
}

function texErrors(tex: string, display: boolean) {
  try {
    katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: "ignore" });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

function inlineMath(text: string) {
  return Array.from(text.matchAll(/\$([^$]+)\$/g)).map((m) => m[1]);
}

/** First number in a rich-text choice (ignores LaTeX commands, handles 1,234.5 and unicode minus). */
export function firstNumber(text: string): number | null {
  const cleaned = text
    .replace(/\\text\{[^}]*\}/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/−/g, "-")
    .replace(/(\d),(\d{3})/g, "$1$2");
  const m = cleaned.match(/-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Validate a single question beyond the zod schema (taxonomy, TeX, internal consistency). */
export function validateQuestion(q: Question, ctx: ValidationContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (message: string) => issues.push({ id: q.id, level: "error", message });
  const warn = (message: string) => issues.push({ id: q.id, level: "warning", message });

  const subject = ctx.taxonomy.subjects.find((s) => s.id === q.subject);
  const topic = subject?.topics.find((t) => t.id === q.topic);
  if (!topic) err(`Unknown topic ${q.topic} for subject ${q.subject}`);
  else if (!topic.subtopics.some((s) => s.id === q.subtopic)) err(`Unknown subtopic ${q.subtopic} under ${q.topic}`);

  const richFields: [string, string][] = [
    ["stem", q.stem],
    ["required", q.required],
    ["finalAnswer", q.finalAnswer],
    ["insight", q.insight],
    ...q.choices.map((c) => [`choice ${c.key}`, c.text] as [string, string]),
    ...q.given.map((g, i) => [`given[${i}]`, g] as [string, string]),
    ...q.commonErrors.map((g, i) => [`commonErrors[${i}]`, g] as [string, string]),
    ...q.solution.map((s, i) => [`solution[${i}].text`, s.text] as [string, string]),
  ];
  for (const [field, text] of richFields) {
    if ((text.match(/\$/g)?.length ?? 0) % 2 !== 0) err(`${field}: unbalanced $ delimiters`);
    for (const tex of inlineMath(text)) {
      const e = texErrors(tex, false);
      if (e) err(`${field}: KaTeX error in "${tex}": ${e}`);
    }
  }
  const displayTex: [string, string][] = [
    ...q.formulas.map((f, i) => [`formulas[${i}]`, f.tex] as [string, string]),
    ...q.solution.filter((s) => s.tex).map((s, i) => [`solution[${i}].tex`, s.tex!] as [string, string]),
    ...q.variables.map((v, i) => [`variables[${i}].symbol`, v.symbol] as [string, string]),
  ];
  for (const [field, tex] of displayTex) {
    const e = texErrors(tex, true);
    if (e) err(`${field}: KaTeX error: ${e}`);
  }

  if (q.type === "computational") {
    for (const c of q.choices) {
      if (c.value === undefined) continue;
      const n = firstNumber(c.text);
      if (n === null) err(`choice ${c.key}: no number in text but value=${c.value}`);
      else if (Math.abs(n - c.value) > Math.max(1e-9, Math.abs(c.value) * 0.006)) err(`choice ${c.key}: text number ${n} does not match value ${c.value}`);
    }
    if (q.verification.computedValue !== undefined) {
      const keyed = q.choices.find((c) => c.key === q.answer)?.value;
      const tol = q.verification.tolerance ?? 0.005;
      if (keyed !== undefined && Math.abs(keyed - q.verification.computedValue) > Math.abs(keyed) * tol + 1e-9) err(`verification.computedValue ${q.verification.computedValue} disagrees with keyed value ${keyed}`);
    }
  }
  if (!q.finalAnswer.includes(q.answer)) warn(`finalAnswer does not mention choice ${q.answer}`);
  if (ctx.knownLessonIds) for (const l of q.relatedLessonIds) if (!ctx.knownLessonIds.has(l)) err(`Unknown related lesson ${l}`);
  if (ctx.knownFormulaIds) for (const f of q.formulaIds) if (!ctx.knownFormulaIds.has(f)) err(`Unknown formula id ${f}`);
  if (q.status.publication === "published" && q.verification.method === "conceptual-review" && q.status.smeReview !== "approved")
    err("Conceptual questions can only be published after human SME approval");
  return issues;
}

export interface BankReport {
  issues: ValidationIssue[];
  duplicates: DuplicatePair[];
  counts: ReturnType<typeof countQuestions>;
}

export function countQuestions(questions: Question[]) {
  const by = <K extends string>(f: (q: Question) => K) =>
    questions.reduce<Record<string, number>>((acc, q) => ((acc[f(q)] = (acc[f(q)] ?? 0) + 1), acc), {});
  const published = questions.filter((q) => q.status.publication === "published");
  return {
    generated: questions.length,
    verificationPassed: questions.filter((q) => q.verification.status === "passed").length,
    validated: questions.filter((q) => q.status.validation === "verified").length,
    awaitingHumanReview: questions.filter((q) => q.status.smeReview !== "approved").length,
    smeApproved: questions.filter((q) => q.status.smeReview === "approved").length,
    published: published.length,
    bySubject: by((q) => q.subject),
    publishedBySubject: published.reduce<Record<string, number>>((a, q) => ((a[q.subject] = (a[q.subject] ?? 0) + 1), a), {}),
    byDifficulty: by((q) => q.difficulty),
    byValidation: by((q) => q.status.validation),
    byType: by((q) => q.type),
  };
}

/** Validate whole bank files (raw JSON) — used by the CLI, the importer and tests. */
export function validateBank(rawFiles: unknown[], ctx: ValidationContext): BankReport & { questions: Question[] } {
  const issues: ValidationIssue[] = [];
  const questions: Question[] = [];
  rawFiles.forEach((raw, fi) => {
    const parsed = bankFileSchema.safeParse(raw);
    if (!parsed.success) {
      // Fall back to per-question parsing for precise messages.
      const qs = (raw as { questions?: unknown[] })?.questions ?? [];
      if (!Array.isArray(qs)) issues.push({ id: `file#${fi}`, level: "error", message: "Missing questions array" });
      qs.forEach((qr, i) => {
        const r = questionSchema.safeParse(qr);
        const id = (qr as { id?: string })?.id ?? `file#${fi}[${i}]`;
        if (!r.success) for (const iss of r.error.issues) issues.push({ id, level: "error", message: `${iss.path.join(".")}: ${iss.message}` });
        else questions.push(r.data);
      });
      return;
    }
    for (const q of parsed.data.questions) {
      if (q.subject !== parsed.data.subject) issues.push({ id: q.id, level: "error", message: `Question subject ${q.subject} in ${parsed.data.subject} file` });
      questions.push(q);
    }
  });
  const seen = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) issues.push({ id: q.id, level: "error", message: "Duplicate question id" });
    seen.add(q.id);
    issues.push(...validateQuestion(q, ctx));
  }
  const duplicates = findDuplicates(questions.map((q) => ({ id: q.id, stem: q.stem })));
  for (const d of duplicates) {
    if (d.kind === "exact") issues.push({ id: d.a, level: "error", message: `Exact duplicate of ${d.b}` });
    else issues.push({ id: d.a, level: "warning", message: `${d.kind === "numeric-variant" ? "Numeric variant" : "Similar"} to ${d.b} (score ${d.score})` });
  }
  return { issues, duplicates, counts: countQuestions(questions), questions };
}
