/** Export questions from PostgreSQL back into data/question-bank/*.json (for git review and verification). */
import fs from "node:fs";
import path from "node:path";
import { PostgresStore } from "@/lib/server/qbank/pg-store";
import { BANK_DIR, BANK_FILES } from "./files";
import { pgSql, pgliteSql } from "./db";

const TITLES = {
  mste: "Applied Mathematics, Surveying, Principles of Transportation and Highway Engineering, Construction Management and Methods",
  hge: "Hydraulics and Principles of Geotechnical Engineering",
  psad: "Principles of Structural Analysis and Design",
} as const;

async function main() {
  const args = process.argv.slice(2);
  const pglite = args.includes("--pglite") ? args[args.indexOf("--pglite") + 1] : null;
  const conn = pglite ? await pgliteSql(pglite) : await pgSql(process.env.DATABASE_URL!);
  const store = new PostgresStore(conn.sql);
  const all = await Promise.all((await store.all()).map(async (q) => (await store.get(q.id))!));
  for (const [subject, file] of Object.entries(BANK_FILES)) {
    const questions = all.filter((q) => q.subject === subject);
    fs.writeFileSync(path.join(BANK_DIR, file), JSON.stringify({ subject, title: TITLES[subject as keyof typeof TITLES], questions }, null, 2) + "\n");
    console.log(`${file}: ${questions.length}`);
  }
  if ("pool" in conn) await conn.pool.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
