import { connection } from "next/server";
import { z } from "zod";
import { toReviewQuestion } from "@/lib/qbank/engine";
import { revealedQuestion } from "@/lib/server/qbank/sessions";
import { errorResponse, json, readJson } from "@/lib/server/http";

const bodySchema = z.object({ questionId: z.string().max(20), revealToken: z.string().max(4000) });

/** Verified solution for a question the learner has already answered or submitted (needs a reveal token). */
export async function POST(req: Request) {
  await connection();
  try {
    const { questionId, revealToken } = bodySchema.parse(await readJson(req, 8_000));
    const q = await revealedQuestion(revealToken, questionId);
    return json({ question: toReviewQuestion(q, "ABCD") });
  } catch (e) {
    return errorResponse(e);
  }
}
