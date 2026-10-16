import { connection } from "next/server";
import { z } from "zod";
import { clearStaffCookie, currentStaff, login, setStaffCookie, staffConfigured } from "@/lib/server/staff-auth";
import { getStore } from "@/lib/server/qbank";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

export async function GET() {
  await connection();
  const store = await getStore();
  return json({ configured: staffConfigured(), staff: await currentStaff(), storage: store.kind, writable: store.writable });
}

export async function POST(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    if (!staffConfigured()) return json({ error: "Admin access is not configured on this server." }, 503);
    const { token } = z.object({ token: z.string().min(1).max(200) }).parse(await readJson(req, 2000));
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const actor = login(token, ip);
    await setStaffCookie(actor);
    return json({ staff: actor });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    await clearStaffCookie();
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
