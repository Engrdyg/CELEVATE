import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/*
 * Signed, tamper-evident tokens (HMAC-SHA256). Exam and practice sessions are
 * stateless: the server signs the selected question ids, pinned versions and
 * choice orders, so the answer key never needs to leave the server and the
 * client cannot alter which questions it is graded on.
 */

let cached: Buffer | null = null;

function secret(): Buffer {
  if (cached) return cached;
  const env = process.env.CELEVATE_SIGNING_SECRET;
  if (env && env.length >= 32) {
    cached = Buffer.from(env, "utf8");
  } else if (process.env.NODE_ENV === "production") {
    // A per-process secret keeps tokens unforgeable but invalidates sessions across
    // server instances and restarts. Configure CELEVATE_SIGNING_SECRET in production.
    console.warn("[celevate] CELEVATE_SIGNING_SECRET is not set (min 32 chars); using an ephemeral signing key.");
    cached = randomBytes(32);
  } else {
    cached = Buffer.from("celevate-development-signing-secret-do-not-use-in-prod", "utf8");
  }
  return cached;
}

const b64 = (b: Buffer) => b.toString("base64url");

export function sign<T extends object>(payload: T): string {
  const body = b64(Buffer.from(JSON.stringify(payload), "utf8"));
  const mac = createHmac("sha256", secret()).update(body).digest();
  return `${body}.${b64(mac)}`;
}

export class TokenError extends Error {}

export function verify<T>(token: unknown, kind?: string): T {
  if (typeof token !== "string" || token.length > 20000) throw new TokenError("Malformed token");
  const [body, mac] = token.split(".");
  if (!body || !mac) throw new TokenError("Malformed token");
  const expected = createHmac("sha256", secret()).update(body).digest();
  const given = Buffer.from(mac, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new TokenError("Invalid token signature");
  let payload: { kind?: string; exp?: number };
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    throw new TokenError("Malformed token");
  }
  if (kind && payload.kind !== kind) throw new TokenError(`Expected a ${kind} token`);
  if (payload.exp && Date.now() > payload.exp) throw new TokenError("Token expired");
  return payload as T;
}

export function randomId(prefix: string) {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

export function randomSeed() {
  return randomBytes(4).readUInt32LE(0);
}
