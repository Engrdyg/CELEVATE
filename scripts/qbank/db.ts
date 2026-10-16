import fs from "node:fs";
import path from "node:path";
import type { Sql } from "@/lib/server/qbank/pg-store";

export const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

/** Minimal stand-ins for Supabase's roles and auth.uid() so the migration runs on plain Postgres / PGlite. */
export const SUPABASE_SHIM = `
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $fn$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$fn$;
`;

export async function applyMigrations(sql: { exec?: (s: string) => Promise<unknown> } & Sql, opts: { shim?: boolean } = {}) {
  const run = async (text: string) => (sql.exec ? sql.exec(text) : sql.query(text));
  if (opts.shim) await run(SUPABASE_SHIM);
  for (const f of fs.readdirSync(MIGRATIONS_DIR).filter((x) => x.endsWith(".sql")).sort()) {
    await run(fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"));
  }
}

export async function pgliteSql(dataDir?: string) {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(dataDir);
  const wrap = (q: { query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }): Sql => ({
    query: async <T,>(text: string, params?: unknown[]) => (await q.query(text, params)) as { rows: T[] },
    transaction: async <T,>(fn: (tx: Sql) => Promise<T>) => db.transaction(async (tx) => fn(wrap(tx))) as Promise<T>,
  });
  return { db, sql: { ...wrap(db), exec: (s: string) => db.exec(s) } };
}

export async function pgSql(url: string) {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url });
  const wrap = (q: { query: (t: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }): Sql => ({
    query: async <T,>(text: string, params?: unknown[]) => (await q.query(text, params)) as { rows: T[] },
    transaction: async <T,>(fn: (tx: Sql) => Promise<T>) => {
      const c = await pool.connect();
      try {
        await c.query("begin");
        const r = await fn(wrap(c));
        await c.query("commit");
        return r;
      } catch (e) {
        await c.query("rollback");
        throw e;
      } finally {
        c.release();
      }
    },
  });
  return { pool, sql: wrap(pool) };
}
