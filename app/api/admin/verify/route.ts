import { connection } from "next/server";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import { getStore } from "@/lib/server/qbank";
import { requireStaff } from "@/lib/server/staff-auth";
import { assertSameOrigin, errorResponse, json, readJson } from "@/lib/server/http";

const run = promisify(execFile);

/**
 * Runs the independent Python verification harness and records results in the bank files.
 * Only available with the writable file store (local content authoring); in database
 * deployments verification runs in the export → verify → import pipeline.
 */
export async function POST(req: Request) {
  await connection();
  try {
    assertSameOrigin(req);
    await requireStaff(["admin", "reviewer"]);
    const store = await getStore();
    if (store.kind !== "file" || !store.writable) return json({ error: "In-app verification is only available when editing the file-based bank locally." }, 409);
    const { subject } = z.object({ subject: z.enum(["mste", "hge", "psad"]).optional() }).parse(await readJson(req, 1000));
    const script = path.join(process.cwd(), "data", "question-bank", "verify", "run.py");
    const args = [script, "--write", ...(subject ? ["--subject", subject] : [])];
    try {
      const { stdout } = await run("python3", args, { timeout: 120_000 });
      return json({ ok: true, output: stdout.trim().split("\n").slice(-40) });
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string; code?: number };
      if (err.code === undefined && !err.stdout) return json({ error: "python3 is not available on this machine" }, 501);
      return json({ ok: false, output: `${err.stdout ?? ""}${err.stderr ?? ""}`.trim().split("\n").slice(-40) });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
