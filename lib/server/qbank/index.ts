import { FileStore } from "./file-store";
import { PostgresStore, type Sql } from "./pg-store";
import type { QuestionStore } from "./types";

export * from "./types";

let store: QuestionStore | null = null;

async function pgSql(url: string): Promise<Sql> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, max: 5, ssl: process.env.DATABASE_SSL === "0" ? undefined : url.includes("localhost") ? undefined : { rejectUnauthorized: false } });
  const wrap = (q: { query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }): Sql => ({
    query: async <T,>(text: string, params?: unknown[]) => (await q.query(text, params)) as { rows: T[] },
    transaction: async <T,>(fn: (tx: Sql) => Promise<T>) => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const out = await fn(wrap(client));
        await client.query("commit");
        return out;
      } catch (e) {
        await client.query("rollback").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },
  });
  return wrap(pool);
}

/**
 * Returns the configured question store:
 *  - DATABASE_URL set → PostgreSQL (Supabase-compatible schema in supabase/migrations)
 *  - otherwise        → the version-controlled JSON files in data/question-bank
 */
export async function getStore(): Promise<QuestionStore> {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  store = url ? new PostgresStore(await pgSql(url)) : new FileStore();
  return store;
}

/** Test hook. */
export function setStore(s: QuestionStore | null) {
  store = s;
}
