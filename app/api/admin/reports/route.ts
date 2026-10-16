import { connection } from "next/server";
import { z } from "zod";
import { getStore, REPORT_STATUSES } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

export async function GET() {
  await connection();
  try {
    await requireStaff(["admin", "reviewer"]);
    const store = await getStore();
    return json({ reports: await store.reports(), writable: store.writable, storage: store.kind });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    const actor = await requireStaff(["admin", "reviewer"]);
    const { id, status, resolution } = z.object({ id: z.string().max(64), status: z.enum(REPORT_STATUSES), resolution: z.string().max(1000).optional() }).parse(await readJson(req, 5000));
    const store = await getStore();
    return json({ report: await store.updateReport(id, { status, resolution }, actor) });
  } catch (e) {
    return errorResponse(e);
  }
}
