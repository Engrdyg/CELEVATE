import { connection } from "next/server";
import { z } from "zod";
import { reviewSession } from "@/lib/server/qbank/sessions";
import { errorResponse, json, readJson } from "@/lib/server/http";

/** Detailed item review for a submitted session (solutions only if the exam rules allow it). */
export async function POST(req: Request) {
  await connection();
  try {
    const { resultToken } = z.object({ resultToken: z.string() }).parse(await readJson(req, 50_000));
    return json(await reviewSession(resultToken));
  } catch (e) {
    return errorResponse(e);
  }
}
