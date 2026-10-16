import { afterEach, describe, expect, it } from "vitest";
import { staffAccounts, staffDiagnostics } from "@/lib/server/staff-auth";

const TOKEN = "j".repeat(30);
afterEach(() => {
  delete process.env.CELEVATE_STAFF;
});

describe("staff configuration", () => {
  it("parses Name:role:token entries, including email names", () => {
    process.env.CELEVATE_STAFF = `someone@example.com:admin:${TOKEN};Ben Cruz:reviewer:${"b".repeat(24)}`;
    expect(staffAccounts().map((a) => [a.name, a.role])).toEqual([
      ["someone@example.com", "admin"],
      ["Ben Cruz", "reviewer"],
    ]);
    expect(staffDiagnostics().issues).toEqual([]);
  });

  it("explains misconfiguration without echoing secrets", () => {
    expect(staffDiagnostics()).toMatchObject({ staffVarPresent: false });
    process.env.CELEVATE_STAFF = `"a@b.c:boss:short"`;
    const d = staffDiagnostics();
    expect(d.issues.join(" ")).toMatch(/quote/);
    expect(d.issues.join(" ")).toMatch(/role/);
    expect(d.issues.join(" ")).toMatch(/at least 24/);
    expect(JSON.stringify(d)).not.toContain("short");
    expect(JSON.stringify(d)).not.toContain("a@b.c");
  });
});
