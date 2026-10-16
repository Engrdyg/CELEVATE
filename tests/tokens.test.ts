import { describe, expect, it } from "vitest";
import { sign, TokenError, verify } from "@/lib/server/tokens";

describe("signed tokens", () => {
  it("round-trips a payload", () => {
    const t = sign({ kind: "session", items: [["mste-q001", 1, "ABCD"]] });
    expect(verify<{ items: unknown[] }>(t, "session").items).toHaveLength(1);
  });

  it("rejects tampering, wrong kinds and expiry", () => {
    const t = sign({ kind: "session", n: 1 });
    const [body, mac] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ kind: "session", n: 2 })).toString("base64url");
    expect(() => verify(`${forged}.${mac}`, "session")).toThrow(TokenError);
    expect(() => verify(`${body}.${mac.slice(0, -2)}xx`, "session")).toThrow(TokenError);
    expect(() => verify(t, "result")).toThrow(TokenError);
    expect(() => verify(sign({ kind: "reveal", exp: Date.now() - 1000 }), "reveal")).toThrow(TokenError);
    expect(() => verify("garbage", "session")).toThrow(TokenError);
  });
});
