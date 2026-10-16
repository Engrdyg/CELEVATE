import { connection } from "next/server";
import { z } from "zod";
import { questionCoreSchema } from "@/lib/qbank/schema";
import { validateQuestion } from "@/lib/qbank/validate";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

/** Admin list of all questions (every status), lightweight rows. */
export async function GET() {
  await connection();
  try {
    await requireStaff();
    const store = await getStore();
    const questions = await store.all();
    return json({
      storage: store.kind,
      writable: store.writable,
      questions: questions.map((q) => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        subtopic: q.subtopic,
        type: q.type,
        title: q.title,
        stem: q.stem,
        difficulty: q.difficulty,
        status: q.status,
        verification: { status: q.verification.status, method: q.verification.method },
        version: q.meta.version,
        updatedAt: q.meta.updatedAt,
        author: q.meta.author,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Create a new question (always starts as an unpublished draft). */
export async function POST(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff(["admin", "reviewer", "author"]);
    const { question, reason } = z.object({ question: questionCoreSchema, reason: z.string().min(3).max(300) }).parse(await readJson(req));
    const store = await getStore();
    if (await store.get(question.id)) return json({ error: `Question ${question.id} already exists` }, 409);
    const issues = validateQuestion({ ...question, history: [] }, { taxonomy }).filter((i) => i.level === "error");
    if (issues.length) return json({ error: "Validation failed", issues: issues.map((i) => i.message) }, 422);
    return json({ question: await store.save(question, actor, reason) }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
