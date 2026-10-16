import { connection } from "next/server";
import { questionsToCsv } from "@/lib/qbank/csv";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { errorResponse } from "@/lib/server/http";

export async function GET(req: Request) {
  await connection();
  try {
    await requireStaff(["admin", "reviewer"]);
    const url = new URL(req.url);
    const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
    const scope = url.searchParams.get("scope") === "published" ? "published" : "all";
    const store = await getStore();
    const questions = scope === "published" ? await store.published() : await store.all();
    const stamp = new Date().toISOString().slice(0, 10);
    const body = format === "csv" ? questionsToCsv(questions) : JSON.stringify({ exportedAt: new Date().toISOString(), source: store.kind, count: questions.length, questions }, null, 2);
    return new Response(body, {
      headers: {
        "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "application/json",
        "Content-Disposition": `attachment; filename="celevate-questions-${scope}-${stamp}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
