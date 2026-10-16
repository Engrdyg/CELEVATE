import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FileStore } from "@/lib/server/qbank/file-store";
import { setStore } from "@/lib/server/qbank";
import { checkAnswer, revealedQuestion, reviewSession, startSession, startSchema, submitSession, submitSchema } from "@/lib/server/qbank/sessions";
import { sign, verify } from "@/lib/server/tokens";
import { loadBank, tempBank } from "./helpers";

const bank = new Map(loadBank().map((q) => [q.id, q]));
let tmp: ReturnType<typeof tempBank>;

beforeAll(() => {
  tmp = tempBank();
  setStore(new FileStore(tmp.dir));
});
afterAll(() => {
  setStore(null);
  tmp.cleanup();
});

const start = (x: object) => startSession(startSchema.parse(x));
/** Learner-side choice id for the correct answer (the test reads the key from the bank). */
const key = (id: string) => bank.get(id)!.answer;

describe("sessions", () => {
  it("mock exams return answer-free questions and refuse instant feedback", async () => {
    const s = await start({ mode: "mock", presetId: "mock-full" });
    expect(s.questions).toHaveLength(60);
    expect(s.feedback).toBe("end");
    expect(s.deadline! - s.startedAt).toBe(180 * 60_000);
    const raw = JSON.stringify(s);
    expect(raw).not.toMatch(/"answer"|"solution"|"value"|"finalAnswer"/);
    await expect(checkAnswer(s.token, s.questions[0].id, "A")).rejects.toThrow(/hidden/);
  });

  it("grades a submission server-side against the pinned versions", async () => {
    const s = await start({ mode: "subject", subjects: ["hge"], count: 10, feedback: "end" });
    const ids = s.questions.map((q) => q.id);
    const answers: Record<string, string> = {};
    ids.slice(0, 6).forEach((id) => (answers[id] = key(id)));
    answers[ids[6]] = key(ids[6]) === "A" ? "B" : "A";
    const r = await submitSession(submitSchema.parse({ token: s.token, answers, flagged: [ids[0]] }));
    expect(r.score).toMatchObject({ total: 10, correct: 6, incorrect: 1, unanswered: 3 });
    expect(r.items[0].flagged).toBe(true);
    expect(r.revealToken).toBeTruthy();
    const review = await reviewSession(r.resultToken);
    expect(review.items).toHaveLength(10);
    expect(review.items.every((i) => i.solutionAvailable)).toBe(true);
  });

  it("withholds the key when the exam hides solutions", async () => {
    const s = await start({ mode: "mock", subjects: ["psad"], count: 5, minutes: 10, revealSolutions: false });
    const r = await submitSession(submitSchema.parse({ token: s.token, answers: {} }));
    expect(r.items.every((i) => i.answer === null && i.answerLabel === null)).toBe(true);
    expect(r.revealToken).toBeNull();
    const review = await reviewSession(r.resultToken);
    expect(JSON.stringify(review)).not.toMatch(/"solution"|"finalAnswer"/);
    expect(review.items.every((i) => i.graded.answer === null)).toBe(true);
  });

  it("ignores answers for questions outside the session and rejects forged tokens", async () => {
    const s = await start({ mode: "topic", topics: ["mste-surv"], count: 3 });
    const outsider = [...bank.keys()].find((id) => !s.questions.some((q) => q.id === id))!;
    const r = await submitSession(submitSchema.parse({ token: s.token, answers: { [outsider]: "A" } }));
    expect(r.items.some((i) => i.id === outsider)).toBe(false);
    const payload = verify<Record<string, unknown>>(s.token, "session");
    const forged = `${Buffer.from(JSON.stringify({ ...payload, items: [...(payload.items as unknown[]), [outsider, 1, "ABCD"]] })).toString("base64url")}.${s.token.split(".")[1]}`;
    await expect(submitSession(submitSchema.parse({ token: forged, answers: {} }))).rejects.toThrow();
  });

  it("instant feedback grades one item and issues a reveal token scoped to it", async () => {
    const s = await start({ mode: "random", count: 2, includeIds: ["psad-q010"] });
    expect(s.questions[0].id).toBe("psad-q010");
    const c = await checkAnswer(s.token, "psad-q010", key("psad-q010"));
    expect(c.item.isCorrect).toBe(true);
    expect(c.review.solution.length).toBeGreaterThanOrEqual(2);
    await expect(revealedQuestion(c.revealToken, "psad-q010")).resolves.toMatchObject({ id: "psad-q010" });
    await expect(revealedQuestion(c.revealToken, "psad-q011")).rejects.toThrow();
  });

  it("refuses instant checks after a timed session ends", async () => {
    const s = await start({ mode: "timed", minutes: 1, count: 2 });
    const p = verify<Record<string, unknown>>(s.token, "session");
    const expired = sign({ ...p, deadline: Date.now() - 10 * 60_000, feedback: "instant" });
    await expect(checkAnswer(expired, s.questions[0].id, "A")).rejects.toThrow(/ended/);
  });

  it("marks late submissions and caps the recorded time", async () => {
    const s = await start({ mode: "mock", subjects: ["mste"], count: 3, minutes: 5 });
    const p = verify<{ startedAt: number }>(s.token, "session");
    const late = sign({ ...p, startedAt: Date.now() - 20 * 60_000, deadline: Date.now() - 10 * 60_000 });
    const r = await submitSession(submitSchema.parse({ token: late, answers: {} }));
    expect(r.late).toBe(true);
    expect(r.autoSubmitted).toBe(true);
    expect(r.durationSeconds).toBeLessThanOrEqual(12 * 60);
  });

  it("validates start requests", () => {
    expect(() => startSchema.parse({ mode: "mock", count: 1000 })).toThrow();
    expect(() => startSchema.parse({ mode: "nope" })).toThrow();
    expect(() => startSchema.parse({ mode: "random", hack: true })).toThrow();
  });
});
