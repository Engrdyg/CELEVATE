import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FileStore } from "@/lib/server/qbank/file-store";
import { PostgresStore } from "@/lib/server/qbank/pg-store";
import type { Actor } from "@/lib/server/qbank/types";
import { csvToRawQuestions, questionsToCsv } from "@/lib/qbank/csv";
import { questionCoreSchema, type Question } from "@/lib/qbank/schema";
import { applyMigrations, pgliteSql } from "@/scripts/qbank/db";
import { loadBank, tempBank } from "./helpers";

const admin: Actor = { name: "Ana Admin", role: "admin" };
const reviewer: Actor = { name: "Rey Reviewer", role: "reviewer" };
const bank = loadBank();
const core = (q: Question) => {
  const { history: _h, ...c } = q;
  return c;
};

describe("FileStore (temp copy)", () => {
  let tmp: ReturnType<typeof tempBank>;
  let store: FileStore;
  beforeAll(() => {
    process.env.QBANK_FILE_WRITES = "1";
    tmp = tempBank();
    store = new FileStore(tmp.dir);
  });
  afterAll(() => {
    delete process.env.QBANK_FILE_WRITES;
    tmp.cleanup();
  });

  it("serves only published questions to learners", async () => {
    expect((await store.all()).length).toBe(bank.length);
    expect((await store.published()).every((q) => q.status.publication === "published")).toBe(true);
  });

  it("saves versions, pins old versions and audits changes", async () => {
    const q = (await store.get("hge-q004"))!;
    const saved = await store.save({ ...core(q), stem: `${q.stem} Take $g = 9.81$ m/s².` }, admin, "clarify g");
    expect(saved.meta.version).toBe(q.meta.version + 1);
    expect(saved.status.publication).toBe("unpublished");
    expect((await store.getVersion("hge-q004", q.meta.version))?.stem).toBe(q.stem);
    expect((await store.published()).some((x) => x.id === "hge-q004")).toBe(false);
    const versions = await store.versions("hge-q004");
    expect(versions.map((v) => v.version)).toEqual([saved.meta.version, q.meta.version]);
    expect(versions[0]).toMatchObject({ changedBy: "Ana Admin", changeReason: "clarify g" });
    expect((await store.audit(5)).some((a) => a.entityId === "hge-q004")).toBe(true);
  });

  it("stores and triages learner reports", async () => {
    const r = (await store.addReport({ questionId: "mste-q001", reportedBy: "anonymous", issueType: "typo", description: "Unit label reads kN instead of m" }))!;
    expect(r.status).toBe("open");
    const u = await store.updateReport(r.id, { status: "resolved", resolution: "Fixed label" }, reviewer);
    expect(u).toMatchObject({ status: "resolved", reviewedBy: "Rey Reviewer" });
  });
});

describe("CSV import/export", () => {
  it("round-trips every field", () => {
    const sample = bank.slice(0, 5).map(core);
    const { raw, errors } = csvToRawQuestions(questionsToCsv(sample));
    expect(errors).toEqual([]);
    raw.forEach((r, i) => {
      const parsed = questionCoreSchema.parse({ ...(r as object), status: sample[i].status, meta: sample[i].meta, verification: sample[i].verification });
      expect(parsed.stem).toBe(sample[i].stem);
      expect(parsed.choices).toEqual(sample[i].choices);
      expect(parsed.solution).toEqual(sample[i].solution);
    });
  });
});

describe("PostgresStore on PGlite with the Supabase migration", () => {
  let close: () => Promise<void>;
  let store: PostgresStore;
  let sql: Awaited<ReturnType<typeof pgliteSql>>["sql"];

  beforeAll(async () => {
    const r = await pgliteSql();
    sql = r.sql;
    close = () => r.db.close();
    await applyMigrations(sql as never, { shim: true });
    store = new PostgresStore(sql);
    await store.syncTaxonomy();
    await store.importQuestions(bank.slice(0, 20), { name: "import", role: "system" }, "test import");
  });
  afterAll(async () => close?.());

  it("imports questions with choices and solutions", async () => {
    expect((await store.all()).length).toBe(20);
    const q = (await store.get(bank[0].id))!;
    expect(q.choices).toEqual(bank[0].choices);
    expect(q.solution).toEqual(bank[0].solution);
  });

  it("public views never expose the answer key", async () => {
    const cols = (await sql.query<{ column_name: string }>(`select column_name from information_schema.columns where table_name in ('public_questions','public_question_choices')`)).rows.map((r) => r.column_name);
    expect(cols).not.toContain("is_correct");
    expect(cols).not.toContain("correct_answer");
    expect(cols.some((c) => /solution|explanation/.test(c))).toBe(false);
  });

  it("database constraints reject a second correct choice", async () => {
    await expect(sql.query(`update question_choices set is_correct = true where question_id = $1`, [bank[0].id])).rejects.toThrow();
  });

  it("edits version and unpublish through the store", async () => {
    const q = (await store.get(bank[1].id))!;
    const saved = await store.save({ ...core(q), stem: `${q.stem} (Revised.)` }, admin, "revise");
    expect(saved.meta.version).toBe(q.meta.version + 1);
    expect(saved.status.publication).toBe("unpublished");
    expect((await store.getVersion(q.id, q.meta.version))?.stem).toBe(q.stem);
    expect((await store.audit(5)).length).toBeGreaterThan(0);
  });
});
