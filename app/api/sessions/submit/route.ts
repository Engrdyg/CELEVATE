import { connection } from "next/server";
import { submitSchema, submitSession } from "@/lib/server/qbank/sessions";
import { errorResponse, json, readJson } from "@/lib/server/http";

/** Grades a whole session server-side (mock exams, end-of-set practice). Idempotent per session. */
export async function POST(req: Request) {
  await connection();
  try {
    return json(await submitSession(submitSchema.parse(await readJson(req, 100_000))));
  } catch (e) {
    return errorResponse(e);
  }
}
