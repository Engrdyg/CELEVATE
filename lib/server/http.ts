import { ZodError } from "zod";
import { TokenError } from "./tokens";
import { StoreError } from "./qbank/types";

export function json(data: unknown, init?: number | ResponseInit) {
  const base: ResponseInit = typeof init === "number" ? { status: init } : (init ?? {});
  return Response.json(data, { ...base, headers: { "Cache-Control": "no-store", ...(base.headers ?? {}) } });
}

export function errorResponse(e: unknown) {
  if (e instanceof ZodError) return json({ error: "Invalid request", issues: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, 400);
  if (e instanceof TokenError) return json({ error: e.message }, 401);
  if (e instanceof StoreError) return json({ error: e.message }, e.status);
  console.error("[api]", e);
  return json({ error: "Unexpected server error" }, 500);
}

export async function readJson(req: Request, maxBytes = 1_000_000) {
  const text = await req.text();
  if (text.length > maxBytes) throw new StoreError("Request body too large", 413);
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new StoreError("Body must be valid JSON");
  }
}

/** Rejects cross-site state-changing requests (defence in depth on top of SameSite cookies). */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new StoreError("Cross-origin request rejected", 403);
  } catch (e) {
    if (e instanceof StoreError) throw e;
    throw new StoreError("Bad origin", 403);
  }
}
