import { connection } from "next/server";
import { countQuestions } from "@/lib/qbank/validate";
import { findDuplicates } from "@/lib/qbank/duplicates";
import { taxonomy, examConfig } from "@/lib/qbank/taxonomy";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { errorResponse, json } from "@/lib/server/http";

/** Dashboard numbers — always computed from the actual stored records. */
export async function GET() {
  await connection();
  try {
    await requireStaff();
    const store = await getStore();
    const questions = await store.all();
    const reports = await store.reports();
    const coverage = taxonomy.subjects.map((s) => ({
      subject: s.id,
      code: s.code,
      topics: s.topics.map((t) => ({
        id: t.id,
        title: t.title,
        total: questions.filter((q) => q.topic === t.id).length,
        published: questions.filter((q) => q.topic === t.id && q.status.publication === "published").length,
      })),
    }));
    return json({
      storage: store.kind,
      writable: store.writable,
      counts: countQuestions(questions),
      target: 3000,
      duplicates: findDuplicates(questions.map((q) => ({ id: q.id, stem: q.stem }))),
      openReports: reports.filter((r) => r.status === "open" || r.status === "investigating").length,
      coverage,
      audit: await store.audit(25),
      taxonomyVerification: taxonomy.verification,
      config: examConfig,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
