import { connection } from "next/server";
import { z } from "zod";
import { csvToRawQuestions } from "@/lib/qbank/csv";
import { questionCoreSchema, type QuestionCore } from "@/lib/qbank/schema";
import { validateQuestion } from "@/lib/qbank/validate";
import { findDuplicates } from "@/lib/qbank/duplicates";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

const body = z.object({
  format: z.enum(["json", "csv"]),
  content: z.string().max(5_000_000),
  commit: z.boolean().default(false),
  reason: z.string().min(3).max(300).default("Bulk import"),
});

/**
 * Bulk import. Every record is schema-validated, checked against the taxonomy, KaTeX
 * and existing questions (ids and near-duplicates) before anything is written.
 * Imported questions always enter the workflow as unpublished drafts.
 */
export async function POST(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff(["admin"]);
    const { format, content, commit, reason } = body.parse(await readJson(req, 6_000_000));
    let raw: unknown[] = [];
    const errors: { row: number; id?: string; messages: string[] }[] = [];
    if (format === "json") {
      try {
        const parsed = JSON.parse(content);
        raw = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [];
        if (!raw.length) errors.push({ row: 0, messages: ["Expected an array of questions or { questions: [...] }"] });
      } catch {
        errors.push({ row: 0, messages: ["Invalid JSON"] });
      }
    } else {
      const res = csvToRawQuestions(content);
      raw = res.raw;
      if (res.errors.length) errors.push({ row: 0, messages: res.errors });
    }

    const store = await getStore();
    const existing = await store.all();
    const existingIds = new Set(existing.map((q) => q.id));
    const valid: QuestionCore[] = [];
    const seen = new Set<string>();
    raw.forEach((r, i) => {
      const now = new Date().toISOString();
      const candidate = {
        ...(r as object),
        status: { validation: "draft", publication: "unpublished", smeReview: "pending" },
        meta: { author: actor.name, createdAt: now, updatedAt: now, version: 1, reviewedBy: null },
      };
      const parsed = questionCoreSchema.safeParse(candidate);
      const id = (r as { id?: string })?.id;
      if (!parsed.success) {
        errors.push({ row: i + 1, id, messages: parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`) });
        return;
      }
      const msgs = validateQuestion({ ...parsed.data, history: [] }, { taxonomy }).filter((x) => x.level === "error").map((x) => x.message);
      if (existingIds.has(parsed.data.id)) msgs.push("A question with this id already exists");
      if (seen.has(parsed.data.id)) msgs.push("Duplicate id within the import");
      seen.add(parsed.data.id);
      if (msgs.length) errors.push({ row: i + 1, id, messages: msgs });
      else valid.push(parsed.data);
    });
    const dupes = findDuplicates([...existing, ...valid].map((q) => ({ id: q.id, stem: q.stem }))).filter((d) => valid.some((v) => v.id === d.a || v.id === d.b));
    const exact = dupes.filter((d) => d.kind === "exact");
    for (const d of exact) errors.push({ row: 0, id: d.a, messages: [`Exact duplicate of ${d.b}`] });

    let imported = 0;
    if (commit && !errors.length) {
      for (const q of valid) {
        await store.save(q, actor, reason);
        imported++;
      }
    }
    return json({ total: raw.length, valid: valid.length, errors, warnings: dupes.filter((d) => d.kind !== "exact"), imported, committed: commit && !errors.length });
  } catch (e) {
    return errorResponse(e);
  }
}
