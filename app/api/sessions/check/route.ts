import { connection } from "next/server";
import { z } from "zod";
import { checkAnswer } from "@/lib/server/qbank/sessions";
import { errorResponse, json, readJson } from "@/lib/server/http";

const body = z.object({ token: z.string(), questionId: z.string().max(20), choice: z.enum(["A", "B", "C", "D"]) });

/** Practice (instant-feedback) answer check: grades one item and returns its verified solution. */
export async function POST(req: Request) {
  await connection();
  try {
    const { token, questionId, choice } = body.parse(await readJson(req, 30_000));
    return json(await checkAnswer(token, questionId, choice));
  } catch (e) {
    return errorResponse(e);
  }
}
