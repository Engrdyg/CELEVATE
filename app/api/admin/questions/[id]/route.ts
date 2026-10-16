import { connection } from "next/server";
import { z } from "zod";
import { questionCoreSchema, VALIDATION_STATUSES } from "@/lib/qbank/schema";
import { validateQuestion } from "@/lib/qbank/validate";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  await connection();
  try {
    await requireStaff();
    const { id } = await params;
    const store = await getStore();
    const question = await store.get(id);
    if (!question) return json({ error: "Not found" }, 404);
    const reports = (await store.reports()).filter((r) => r.questionId === id);
    return json({ question, versions: await store.versions(id), reports, issues: validateQuestion(question, { taxonomy }), writable: store.writable });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Save edits as a new version. Content changes send the question back through review. */
export async function PUT(req: Request, { params }: Ctx) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff(["admin", "reviewer", "author"]);
    const { id } = await params;
    const { question, reason } = z.object({ question: questionCoreSchema, reason: z.string().min(3).max(300) }).parse(await readJson(req));
    if (question.id !== id) return json({ error: "Question id mismatch" }, 400);
    const store = await getStore();
    if (!(await store.get(id))) return json({ error: "Not found" }, 404);
    const issues = validateQuestion({ ...question, history: [] }, { taxonomy }).filter((i) => i.level === "error");
    if (issues.length) return json({ error: "Validation failed", issues: issues.map((i) => i.message) }, 422);
    return json({ question: await store.save(question, actor, reason) });
  } catch (e) {
    return errorResponse(e);
  }
}

const action = z.discriminatedUnion("type", [
  z.object({ type: z.literal("transition"), to: z.enum(VALIDATION_STATUSES), note: z.string().max(300).optional() }),
  z.object({ type: z.literal("publish") }),
  z.object({ type: z.literal("unpublish") }),
  z.object({ type: z.literal("archive") }),
  z.object({ type: z.literal("restore") }),
  z.object({ type: z.literal("sme"), decision: z.enum(["approved", "changes_requested"]), note: z.string().max(300).optional(), attestLicensed: z.boolean().optional() }),
]);

/** Workflow: Draft → Technical Review → Verified → Published (plus reject / archive / SME decisions). */
export async function POST(req: Request, { params }: Ctx) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff();
    const { id } = await params;
    const store = await getStore();
    return json({ question: await store.workflow(id, action.parse(await readJson(req, 5000)), actor) });
  } catch (e) {
    return errorResponse(e);
  }
}

/** "Delete" archives the question so historical attempts stay gradable. */
export async function DELETE(req: Request, { params }: Ctx) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff(["admin"]);
    const { id } = await params;
    const store = await getStore();
    return json({ question: await store.workflow(id, { type: "archive" }, actor) });
  } catch (e) {
    return errorResponse(e);
  }
}
