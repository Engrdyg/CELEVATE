import { connection } from "next/server";
import { getStore } from "@/lib/server/qbank";
import { toCatalog } from "@/lib/server/qbank/catalog";
import { errorResponse, json } from "@/lib/server/http";

/** Published question metadata (no answers, no solutions). */
export async function GET() {
  await connection();
  try {
    const store = await getStore();
    const questions = await store.published();
    return json({ source: store.kind, count: questions.length, questions: toCatalog(questions) });
  } catch (e) {
    return errorResponse(e);
  }
}
