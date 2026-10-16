import { describe, expect, it } from "vitest";
import { applyWorkflow } from "@/lib/server/qbank/workflow";
import { prepareSave } from "@/lib/server/qbank/save";
import type { Actor } from "@/lib/server/qbank/types";
import type { Question } from "@/lib/qbank/schema";
import { loadBank } from "./helpers";

const admin: Actor = { name: "Ana Admin", role: "admin" };
const reviewer: Actor = { name: "Rey Reviewer", role: "reviewer" };
const author: Actor = { name: "Aya Author", role: "author" };
const system: Actor = { name: "pipeline", role: "system" };
const base = loadBank().find((q) => q.id === "mste-q001")!;
const core = (q: Question) => {
  const { history: _h, ...c } = q;
  return c;
};

function draft(): Question {
  return prepareSave(null, { ...core(base), id: "mste-q900" }, author, "new item");
}

describe("publishing workflow", () => {
  it("new questions start as unpublished drafts with verification not run", () => {
    const q = draft();
    expect(q.status).toEqual({ validation: "draft", publication: "unpublished", smeReview: "pending" });
    expect(q.verification.status).toBe("not-run");
    expect(q.meta).toMatchObject({ version: 1, author: "Aya Author", updatedBy: "Aya Author" });
  });

  it("enforces Draft → Technical Review → Verified → Published", () => {
    let q = draft();
    expect(() => applyWorkflow(q, { type: "transition", to: "verified" }, admin)).toThrow(/Cannot move/);
    q = applyWorkflow(q, { type: "transition", to: "technical_review" }, author);
    expect(() => applyWorkflow(q, { type: "transition", to: "verified" }, reviewer)).toThrow(/Verification has not passed/);
    q = { ...q, verification: { ...q.verification, status: "passed" } };
    q = applyWorkflow(q, { type: "transition", to: "verified" }, reviewer);
    expect(q.meta.reviewedBy).toBe("Rey Reviewer");
    expect(() => applyWorkflow(q, { type: "publish" }, reviewer)).toThrow(/cannot perform/);
    expect(() => applyWorkflow(q, { type: "publish" }, author)).toThrow(/cannot perform/);
    q = applyWorkflow(q, { type: "publish" }, admin);
    expect(q.status.publication).toBe("published");
    q = applyWorkflow(q, { type: "transition", to: "needs_review" }, reviewer);
    expect(q.status.publication).toBe("unpublished");
  });

  it("authors cannot verify, reject or approve", () => {
    const q = applyWorkflow(draft(), { type: "transition", to: "technical_review" }, author);
    expect(() => applyWorkflow(q, { type: "transition", to: "rejected" }, author)).toThrow();
    expect(() => applyWorkflow(q, { type: "sme", decision: "approved", attestLicensed: true }, author)).toThrow();
  });

  it("SME approval needs a human attestation and is never recorded by automation", () => {
    const q = draft();
    expect(() => applyWorkflow(q, { type: "sme", decision: "approved" }, reviewer)).toThrow(/licensed civil engineer/);
    expect(() => applyWorkflow(q, { type: "sme", decision: "approved", attestLicensed: true }, system)).toThrow(/licensed civil engineer/);
    const ok = applyWorkflow(q, { type: "sme", decision: "approved", attestLicensed: true }, reviewer);
    expect(ok.status.smeReview).toBe("approved");
    expect(ok.meta.smeReviewer).toBe("Rey Reviewer");
  });

  it("requested changes send the item back to review and unpublish it", () => {
    const q = applyWorkflow(base, { type: "sme", decision: "changes_requested" }, reviewer);
    expect(q.status).toMatchObject({ validation: "needs_review", publication: "unpublished", smeReview: "changes_requested" });
  });

  it("content edits create a new version, keep history and reset verification", () => {
    const edited = prepareSave(base, { ...core(base), stem: `${base.stem} Express the answer to two decimals.` }, admin, "clarify rounding");
    expect(edited.meta.version).toBe(base.meta.version + 1);
    expect(edited.status).toMatchObject({ validation: "draft", publication: "unpublished", smeReview: "pending" });
    expect(edited.verification.status).toBe("not-run");
    const last = edited.history.at(-1)!;
    expect(last.version).toBe(base.meta.version);
    expect((last.snapshot as Question).stem).toBe(base.stem);
    expect(last.changedBy).toBe(base.meta.updatedBy ?? base.meta.author);
    expect(edited.meta).toMatchObject({ updatedBy: "Ana Admin", changeReason: "clarify rounding" });
  });

  it("metadata-only edits keep publication", () => {
    const edited = prepareSave(base, { ...core(base), title: "Renamed title for clarity" }, admin, "title");
    expect(edited.status).toEqual(base.status);
    expect(edited.meta.version).toBe(base.meta.version + 1);
  });

  it("a change reason is mandatory", () => {
    expect(() => prepareSave(base, core(base), admin, "  ")).toThrow(/reason/);
  });
});
