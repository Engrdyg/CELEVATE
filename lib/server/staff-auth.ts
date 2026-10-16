import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { sign, verify } from "./tokens";
import { StoreError, type Actor, type StaffRole } from "./qbank/types";

/*
 * Staff accounts are configured on the server only:
 *   CELEVATE_STAFF="Jane Cruz:admin:<long-random-token>;Mark Reyes:reviewer:<token>;Ana Lim:author:<token>"
 *   (or CELEVATE_ADMIN_TOKEN=<token> for a single administrator)
 * Tokens must be at least 24 characters. Without configuration the admin area is disabled.
 */

const COOKIE = "celevate_staff";
const TTL = 12 * 3600_000;

interface StaffAccount {
  name: string;
  role: StaffRole;
  token: string;
}

export function staffAccounts(): StaffAccount[] {
  const list: StaffAccount[] = [];
  for (const entry of (process.env.CELEVATE_STAFF ?? "").split(";")) {
    const [name, role, token] = entry.split(":").map((s) => s?.trim());
    if (name && token && token.length >= 24 && (role === "admin" || role === "reviewer" || role === "author")) list.push({ name, role, token });
  }
  const single = process.env.CELEVATE_ADMIN_TOKEN;
  if (single && single.length >= 24) list.push({ name: "Administrator", role: "admin", token: single });
  return list;
}

export const staffConfigured = () => staffAccounts().length > 0;

const attempts = new Map<string, { n: number; until: number }>();

export function login(token: string, ip: string): Actor {
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.n >= 8 && a.until > now) throw new StoreError("Too many attempts. Try again later.", 429);
  const given = Buffer.from(token);
  const match = staffAccounts().find((acc) => {
    const want = Buffer.from(acc.token);
    return want.length === given.length && timingSafeEqual(want, given);
  });
  if (!match) {
    attempts.set(ip, { n: (a && a.until > now ? a.n : 0) + 1, until: now + 15 * 60_000 });
    throw new StoreError("Invalid access token", 401);
  }
  attempts.delete(ip);
  return { name: match.name, role: match.role };
}

export async function setStaffCookie(actor: Actor) {
  const jar = await cookies();
  jar.set(COOKIE, sign({ v: 1, kind: "staff", name: actor.name, role: actor.role, exp: Date.now() + TTL }), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL / 1000,
  });
}

export async function clearStaffCookie() {
  (await cookies()).delete(COOKIE);
}

export async function currentStaff(): Promise<Actor | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const p = verify<{ name: string; role: StaffRole }>(raw, "staff");
    // Revoked accounts lose access immediately.
    if (!staffAccounts().some((a) => a.name === p.name && a.role === p.role)) return null;
    return { name: p.name, role: p.role };
  } catch {
    return null;
  }
}

export async function requireStaff(roles?: StaffRole[]): Promise<Actor> {
  const actor = await currentStaff();
  if (!actor) throw new StoreError("Sign in to the admin area", 401);
  if (roles && !roles.includes(actor.role as StaffRole)) throw new StoreError("Your role does not allow this action", 403);
  return actor;
}
