/**
 * Validate the JSON question bank and load it into PostgreSQL.
 *   DATABASE_URL=postgres://… npx tsx scripts/qbank/db-import.ts [--migrate] [--shim]
 *   npx tsx scripts/qbank/db-import.ts --pglite ./.pglite --migrate --shim     # local embedded Postgres
 * Aborts without writing if validation reports any error.
 */
import { validateBank } from "@/lib/qbank/validate";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { lessonOutline, allFormulas } from "@/lib/content";
import { PostgresStore } from "@/lib/server/qbank/pg-store";
import { readBankFiles } from "./files";
import { applyMigrations, pgSql, pgliteSql } from "./db";

const args = process.argv.slice(2);
async function main() {
  const report = validateBank(readBankFiles().filter((f) => f.raw).map((f) => f.raw), {
    taxonomy,
    knownLessonIds: new Set(lessonOutline.map((l) => l.id)),
    knownFormulaIds: new Set(allFormulas.map((f) => f.id)),
  });
  const errors = report.issues.filter((i) => i.level === "error");
  if (errors.length) {
    for (const e of errors) console.error(`ERROR ${e.id}: ${e.message}`);
    console.error(`Aborting import: ${errors.length} validation errors.`);
    process.exit(1);
  }
  const pglite = args.includes("--pglite") ? args[args.indexOf("--pglite") + 1] : null;
  const conn = pglite ? await pgliteSql(pglite) : process.env.DATABASE_URL ? await pgSql(process.env.DATABASE_URL) : null;
  if (!conn) throw new Error("Set DATABASE_URL or pass --pglite <dir>");
  if (args.includes("--migrate")) await applyMigrations(conn.sql as never, { shim: args.includes("--shim") });
  const store = new PostgresStore(conn.sql);
  await store.syncTaxonomy();
  const n = await store.importQuestions(report.questions, { name: "db-import script", role: "system" }, "Import from data/question-bank");
  const published = (await store.published()).length;
  console.log(`Imported ${n} questions (${published} published).`);
  if ("pool" in conn) await conn.pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
