/**
 * Validate the CELEVATE question bank.
 *   npx tsx scripts/qbank/validate.ts [--subject hge] [--strict] [--write-reports]
 * Exit code 1 on any error (or any warning with --strict).
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { validateBank } from "@/lib/qbank/validate";
import { questionCoreSchema } from "@/lib/qbank/schema";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { lessonOutline, allFormulas } from "@/lib/content";
import { BANK_DIR, readBankFiles } from "./files";

const args = process.argv.slice(2);
const subject = args.includes("--subject") ? args[args.indexOf("--subject") + 1] : undefined;
const strict = args.includes("--strict");
const files = readBankFiles(subject ? [subject] : undefined).filter((f) => f.raw);
if (!files.length) {
  console.error("No question bank files found.");
  process.exit(1);
}

const report = validateBank(
  files.map((f) => f.raw),
  { taxonomy, knownLessonIds: new Set(lessonOutline.map((l) => l.id)), knownFormulaIds: new Set(allFormulas.map((f) => f.id)) },
);

const errors = report.issues.filter((i) => i.level === "error");
const warnings = report.issues.filter((i) => i.level === "warning");
for (const i of errors) console.log(`ERROR   ${i.id}: ${i.message}`);
for (const i of warnings) console.log(`warning ${i.id}: ${i.message}`);
console.log(JSON.stringify(report.counts, null, 2));
console.log(`${errors.length} errors, ${warnings.length} warnings`);

if (args.includes("--write-reports")) {
  const dir = path.join(BANK_DIR, "reports");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "question-count-report.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), counts: report.counts, errors: errors.length, warnings: warnings.length, duplicates: report.duplicates }, null, 2) + "\n",
  );

  // Machine-readable record schema for external authoring tools.
  fs.mkdirSync(path.join(BANK_DIR, "schema"), { recursive: true });
  fs.writeFileSync(path.join(BANK_DIR, "schema", "question.schema.json"), JSON.stringify(z.toJSONSchema(questionCoreSchema, { io: "input" }), null, 2) + "\n");

  // Progress manifest: actual counts only, derived from the stored records.
  if (!subject) {
    const qs = report.questions;
    const TARGET = 3000;
    const perSubjectTarget = TARGET / taxonomy.subjects.length;
    const manifest = {
      generatedAt: new Date().toISOString(),
      target: { total: TARGET, perSubject: perSubjectTarget, batchSize: "30-50 questions per subject batch" },
      phases: [
        { id: "phase-1", goal: "150 verified questions (50 per subject)", required: 150 },
        { id: "phase-2", goal: "Expand to 3,000 approved, unique questions in reviewed batches", required: TARGET },
      ],
      totals: {
        generated: report.counts.generated,
        verificationPassed: report.counts.verificationPassed,
        published: report.counts.published,
        awaitingHumanReview: report.counts.awaitingHumanReview,
        smeApproved: report.counts.smeApproved,
        remainingToTarget: Math.max(0, TARGET - report.counts.published),
      },
      phaseStatus: {
        "phase-1": report.counts.published >= 150 && taxonomy.subjects.every((s) => (report.counts.publishedBySubject[s.id] ?? 0) >= 50) ? report.counts.smeApproved >= 150
            ? "complete"
            : "complete-pending-licensed-engineer-review"
          : "in-progress",
        "phase-2": report.counts.published >= TARGET ? "complete" : report.counts.generated > 150 ? "in-progress" : "not-started",
      },
      subjects: taxonomy.subjects.map((s) => ({
        id: s.id,
        published: report.counts.publishedBySubject[s.id] ?? 0,
        stored: report.counts.bySubject[s.id] ?? 0,
        remainingToSubjectTarget: Math.max(0, perSubjectTarget - (report.counts.publishedBySubject[s.id] ?? 0)),
        topics: s.topics.map((t) => ({
          id: t.id,
          published: qs.filter((q) => q.topic === t.id && q.status.publication === "published").length,
          subtopicsWithoutQuestions: t.subtopics.filter((st) => !qs.some((q) => q.subtopic === st.id)).map((st) => st.id),
        })),
      })),
      notes: [
        "Counts are recomputed from data/question-bank/*.json on every `npm run qbank:validate -- --write-reports`.",
        "Published computational items passed an independent Python recomputation; none are counted as licensed-engineer reviewed unless smeReview = approved.",
      ],
    };
    fs.writeFileSync(path.join(BANK_DIR, "progress-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  }
}
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
