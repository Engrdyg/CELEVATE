import { describe, expect, it } from "vitest";
import { apportion, choiceOrder, gradeItem, labelMap, mulberry32, relabel, scoreItems, selectQuestions, shuffle, toPublicQuestion, toReviewQuestion } from "@/lib/qbank/engine";
import { examConfig } from "@/lib/qbank/taxonomy";
import { loadBank } from "./helpers";

const bank = loadBank().filter((q) => q.status.publication === "published");

describe("randomisation", () => {
  it("mulberry32 and shuffle are deterministic for a seed and preserve elements", () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(42));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(42));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("choiceOrder is a permutation of ABCD", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) expect(choiceOrder(rng).split("").sort().join("")).toBe("ABCD");
    expect(choiceOrder(rng, false)).toBe("ABCD");
  });

  it("apportion respects totals and capacity", () => {
    const r = apportion(10, { a: 0.35, b: 0.3, c: 0.35 }, { a: 100, b: 2, c: 100 });
    expect(Object.values(r).reduce((x, y) => x + y, 0)).toBe(10);
    expect(r.b).toBeLessThanOrEqual(2);
  });
});

describe("selectQuestions", () => {
  it("never returns duplicates and honours the count", () => {
    for (let seed = 1; seed < 30; seed++) {
      const chosen = selectQuestions(bank, { count: 60 }, mulberry32(seed));
      expect(chosen).toHaveLength(60);
      expect(new Set(chosen.map((q) => q.id)).size).toBe(60);
    }
  });

  it("follows subject weights and the difficulty distribution for a full mock", () => {
    const chosen = selectQuestions(bank, { count: 60, subjectWeights: examConfig.subjectWeights, difficultyDistribution: examConfig.difficultyDistribution }, mulberry32(3));
    const by = (k: string) => chosen.filter((q) => q.subject === k).length;
    expect(by("mste")).toBe(21);
    expect(by("hge")).toBe(18);
    expect(by("psad")).toBe(21);
    const diff = (d: string) => chosen.filter((q) => q.difficulty === d).length;
    expect(Math.abs(diff("easy") - 18)).toBeLessThanOrEqual(2);
    expect(Math.abs(diff("moderate") - 30)).toBeLessThanOrEqual(2);
    expect(Math.abs(diff("difficult") - 12)).toBeLessThanOrEqual(2);
  });

  it("filters by topic and difficulty", () => {
    const chosen = selectQuestions(bank, { count: 50, topics: ["hge-statics"], difficulties: ["easy", "moderate"] }, mulberry32(9));
    expect(chosen.length).toBeGreaterThan(0);
    expect(chosen.every((q) => q.topic === "hge-statics" && q.difficulty !== "difficult")).toBe(true);
  });

  it("puts included ids first and avoids recent questions while others remain", () => {
    const pool = bank.filter((q) => q.subject === "psad");
    const recent = pool.slice(0, 30).map((q) => q.id);
    const chosen = selectQuestions(pool, { count: 10, includeIds: ["psad-q050"], recentIds: recent }, mulberry32(5));
    expect(chosen[0].id).toBe("psad-q050");
    expect(chosen.slice(1).some((q) => recent.includes(q.id))).toBe(false);
  });

  it("weights weak topics more heavily", () => {
    let hits = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const chosen = selectQuestions(bank, { count: 10, topicWeights: { "psad-steel": 10 } }, mulberry32(seed));
      hits += chosen.filter((q) => q.topic === "psad-steel").length;
    }
    // 8 of 150 questions are steel; unweighted we'd expect ~0.5 per set.
    expect(hits / 40).toBeGreaterThan(1.5);
  });
});

describe("answer-safe payloads and grading", () => {
  const q = bank.find((x) => x.id === "hge-q004")!;

  it("public question exposes no key, values, solution or verification", () => {
    const pub = toPublicQuestion(q, "CADB");
    const raw = JSON.stringify(pub);
    for (const leak of ['"answer"', '"value"', '"solution"', '"finalAnswer"', '"verification"', '"commonErrors"']) expect(raw).not.toContain(leak);
    expect(pub.choices.map((c) => c.label)).toEqual(["A", "B", "C", "D"]);
    expect(pub.choices.map((c) => c.id)).toEqual(["C", "A", "D", "B"]);
  });

  it("relabels 'Choice X' references to the letters the learner saw", () => {
    const order = "DCBA";
    const map = labelMap(order);
    expect(map.C).toBe("B");
    expect(relabel("Answer is (Choice C).", order)).toBe("Answer is (Choice B).");
    const review = toReviewQuestion(q, order);
    expect(review.answerLabel).toBe(map[q.answer]);
    expect(review.finalAnswer).toContain(`Choice ${map[q.answer]}`);
  });

  it("grades by stable choice id and scores breakdowns", () => {
    const right = gradeItem(q, "BCDA", q.answer);
    const wrong = gradeItem(q, "BCDA", q.answer === "A" ? "B" : "A");
    const blank = gradeItem(q, "BCDA", null);
    expect(right.isCorrect).toBe(true);
    expect(wrong.isCorrect).toBe(false);
    expect(blank.selected).toBeNull();
    const s = scoreItems([right, wrong, blank]);
    expect(s).toMatchObject({ total: 3, correct: 1, incorrect: 1, unanswered: 1, rawScore: "1/3", percent: 33.3 });
    expect(s.byTopic[0]).toMatchObject({ key: "hge-statics", subject: "hge", total: 3 });
  });
});
