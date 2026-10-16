import { connection } from "next/server";
import { startSchema, startSession } from "@/lib/server/qbank/sessions";
import { errorResponse, json, readJson } from "@/lib/server/http";

/** Starts a practice set or mock exam. The response never contains answers or solutions. */
export async function POST(req: Request) {
  await connection();
  try {
    const input = startSchema.parse(await readJson(req, 50_000));
    return json(await startSession(input));
  } catch (e) {
    return errorResponse(e);
  }
}
