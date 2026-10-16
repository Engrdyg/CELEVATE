import { connection } from "next/server";
import { z } from "zod";
import { getStore, REPORT_ISSUES } from "@/lib/server/qbank";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

const body = z.object({
  questionId: z.string().regex(/^(mste|hge|psad)-q\d{3,4}$/),
  issueType: z.enum(REPORT_ISSUES),
  description: z.string().trim().min(5).max(2000),
  learnerId: z.string().max(64).optional(),
});

/** Learners report suspected errors; reports go to the admin triage queue. */
export async function POST(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    const input = body.parse(await readJson(req, 10_000));
    const store = await getStore();
    if (!(await store.get(input.questionId))) return json({ error: "Unknown question" }, 404);
    const report = await store.addReport({ questionId: input.questionId, issueType: input.issueType, description: input.description, reportedBy: input.learnerId ?? "anonymous" });
    if (!report) return json({ stored: false, message: "Error reporting needs a database on this deployment. Please contact the CELEVATE team with the question ID." }, 202);
    return json({ stored: true, id: report.id });
  } catch (e) {
    return errorResponse(e);
  }
}
