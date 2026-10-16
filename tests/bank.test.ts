import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/qbank/catalog";
import { countQuestions, firstNumber, validateBank } from "@/lib/qbank/validate";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { lessonOutline, allFormulas } from "@/lib/content";
import { BANK_FILES } from "@/lib/server/qbank/file-store";
import { BANK_DIR, loadBank } from "./helpers";

const bank = loadBank();

describe("question bank integrity", () => {
  it("validates with zero errors and zero warnings", () => {
    const raw = Object.values(BANK_FILES).map((f) => JSON.parse(fs.readFileSync(path.join(BANK_DIR, f), "utf8")));
    const { issues } = validateBank(raw, {
      taxonomy,
      knownLessonIds: new Set(lessonOutline.map((l) => l.id)),
      knownFormulaIds: new Set(allFormulas.map((f) => f.id)),
    });
    expect(issues.filter((i) => i.level === "error")).toEqual([]);
    expect(issues.filter((i) => i.level === "warning")).toEqual([]);
  });

  it("has unique ids and unique stems", () => {
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    expect(new Set(bank.map((q) => q.stem.trim())).size).toBe(bank.length);
  });

  it("only publishes verified items whose independent check passed", () => {
    for (const q of bank.filter((x) => x.status.publication === "published")) {
      expect(q.status.validation).toBe("verified");
      expect(q.verification.status).toBe("passed");
      if (q.type === "conceptual") expect(q.status.smeReview).toBe("approved");
    }
  });

  it("keyed choice agrees with the recomputed value", () => {
    for (const q of bank.filter((x) => x.type === "computational")) {
      const keyed = q.choices.find((c) => c.key === q.answer)!;
      const tol = q.verification.tolerance ?? 0.005;
      expect(Math.abs((q.verification.computedValue! - keyed.value!) / (keyed.value! || 1)), q.id).toBeLessThanOrEqual(tol + 1e-12);
      expect(firstNumber(keyed.text), q.id).not.toBeNull();
    }
  });

  it("never claims licensed-engineer approval without a recorded human reviewer", () => {
    for (const q of bank) {
      if (q.status.smeReview === "approved") expect(q.meta.smeReviewer, q.id).toBeTruthy();
      expect(q.meta.smeReviewer ?? "", q.id).not.toMatch(/automated|pipeline|system/i);
    }
  });

  it("reports counts that match the stored records", () => {
    const c = countQuestions(bank);
    expect(c.generated).toBe(bank.length);
    expect(c.published).toBe(bank.filter((q) => q.status.publication === "published").length);
    const report = JSON.parse(fs.readFileSync(path.join(BANK_DIR, "reports", "question-count-report.json"), "utf8"));
    expect(report.counts.generated).toBe(c.generated);
    expect(report.counts.published).toBe(c.published);
  });

  it("client catalog mirrors the published set without answers", () => {
    const published = bank.filter((q) => q.status.publication === "published").map((q) => q.id).sort();
    expect(catalog.map((c) => c.id).sort()).toEqual(published);
    const raw = JSON.stringify(catalog);
    expect(raw).not.toContain('"answer"');
    expect(raw).not.toContain('"solution"');
  });

  it("matches the configured 30/50/20 difficulty mix per subject", () => {
    for (const s of ["mste", "hge", "psad"]) {
      const qs = bank.filter((q) => q.subject === s);
      expect(qs.filter((q) => q.difficulty === "easy").length / qs.length).toBeCloseTo(0.3, 1);
      expect(qs.filter((q) => q.difficulty === "moderate").length / qs.length).toBeCloseTo(0.5, 1);
    }
  });
});
