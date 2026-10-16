/**
 * Moves questions through the workflow after automated checks:
 *   technical_review + verification passed + zero validation errors → verified
 *   (--publish) verified → published   (respects exam-config requireSmeApprovalToPublish)
 * Conceptual questions are never promoted automatically: they need a human reviewer.
 *
 *   QBANK_FILE_WRITES=1 npx tsx scripts/qbank/promote.ts [--publish] [--subject hge] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { FileStore, BANK_DIR } from "@/lib/server/qbank/file-store";
import { validateQuestion } from "@/lib/qbank/validate";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { lessonOutline, allFormulas } from "@/lib/content";
import type { Actor } from "@/lib/server/qbank/types";

process.env.QBANK_FILE_WRITES = "1";
const args = process.argv.slice(2);
const publish = args.includes("--publish");
const dry = args.includes("--dry-run");
const subject = args.includes("--subject") ? args[args.indexOf("--subject") + 1] : undefined;
const actor: Actor = { name: "Automated verification pipeline (python-recompute + schema/KaTeX validation)", role: "system" };

async function main() {
  const store = new FileStore();
  const ctx = { taxonomy, knownLessonIds: new Set(lessonOutline.map((l) => l.id)), knownFormulaIds: new Set(allFormulas.map((f) => f.id)) };
  const batch = { at: new Date().toISOString(), subject: subject ?? "all", verified: [] as string[], published: [] as string[], skipped: [] as { id: string; reason: string }[] };
  for (const q of await store.all()) {
    if (subject && q.subject !== subject) continue;
    const errors = validateQuestion(q, ctx).filter((i) => i.level === "error");
    if (q.status.validation === "draft" || q.status.validation === "technical_review") {
      if (q.verification.method !== "python-recompute") batch.skipped.push({ id: q.id, reason: "conceptual question: awaiting human review" });
      else if (q.verification.status !== "passed") batch.skipped.push({ id: q.id, reason: `verification ${q.verification.status}` });
      else if (errors.length) batch.skipped.push({ id: q.id, reason: errors.map((e) => e.message).join("; ") });
      else if (!dry) {
        if (q.status.validation === "draft") await store.workflow(q.id, { type: "transition", to: "technical_review" }, actor);
        await store.workflow(q.id, { type: "transition", to: "verified" }, actor);
        batch.verified.push(q.id);
      } else batch.verified.push(q.id);
    }
  }
  if (publish) {
    for (const q of await store.all()) {
      if (subject && q.subject !== subject) continue;
      if (q.status.validation === "verified" && q.status.publication === "unpublished") {
        if (!dry) await store.workflow(q.id, { type: "publish" }, actor);
        batch.published.push(q.id);
      }
    }
  }
  console.log(`verified: ${batch.verified.length}, published: ${batch.published.length}, skipped: ${batch.skipped.length}`);
  for (const s of batch.skipped) console.log(`  skipped ${s.id}: ${s.reason}`);
  if (!dry) {
    const log = path.join(BANK_DIR, "reports", "batches.json");
    const prev = fs.existsSync(log) ? JSON.parse(fs.readFileSync(log, "utf8")) : [];
    fs.mkdirSync(path.dirname(log), { recursive: true });
    fs.writeFileSync(log, JSON.stringify([...prev, { ...batch, verifiedCount: batch.verified.length, publishedCount: batch.published.length }], null, 2) + "\n");
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
