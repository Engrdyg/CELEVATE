import { questionSchema, type Question, type QuestionCore } from "@/lib/qbank/schema";
import { StoreError, type Actor } from "./types";

/** Content fields whose change requires re-verification and a new version. */
const CONTENT_KEYS: (keyof QuestionCore)[] = [
  "stem",
  "choices",
  "answer",
  "given",
  "required",
  "formulas",
  "variables",
  "solution",
  "finalAnswer",
  "figure",
  "type",
];

export function contentChanged(a: QuestionCore, b: QuestionCore) {
  return CONTENT_KEYS.some((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null));
}

function core(q: Question): QuestionCore {
  const { history: _h, ...c } = q;
  return c;
}

/**
 * Builds the next stored record for a create/update:
 *  - new questions start as drafts, unpublished, verification not run;
 *  - edits snapshot the previous version into `history` and bump `meta.version`;
 *  - any change to the problem, choices, key or solution resets verification and
 *    withdraws publication so the item goes back through review.
 */
export function prepareSave(existing: Question | null, input: QuestionCore, actor: Actor, reason: string, now = new Date().toISOString()): Question {
  if (!reason.trim()) throw new StoreError("A change reason is required");
  let next: Question;
  if (!existing) {
    next = {
      ...input,
      verification: { ...input.verification, status: "not-run", computedValue: undefined, checkedAt: undefined },
      status: { validation: "draft", publication: "unpublished", smeReview: "pending" },
      meta: { ...input.meta, author: actor.name, createdAt: now, updatedAt: now, version: 1, reviewedBy: null, smeReviewer: null, updatedBy: actor.name, changeReason: reason },
      history: [],
    };
  } else {
    const changed = contentChanged(core(existing), input);
    next = {
      ...input,
      // Status and verification are controlled by the workflow, never by the editor payload.
      status: changed ? { validation: existing.status.validation === "rejected" ? "rejected" : "draft", publication: existing.status.publication === "archived" ? "archived" : "unpublished", smeReview: "pending" } : existing.status,
      verification: changed ? { ...existing.verification, status: "not-run", computedValue: undefined, checkedAt: undefined, notes: "Content changed; re-run verification." } : existing.verification,
      meta: {
        ...existing.meta,
        updatedAt: now,
        version: existing.meta.version + 1,
        updatedBy: actor.name,
        changeReason: reason,
        reviewedBy: changed ? null : existing.meta.reviewedBy,
      },
      // Each history entry describes the version it snapshots (who saved it and why).
      history: [
        ...existing.history,
        {
          version: existing.meta.version,
          snapshot: core(existing),
          changedBy: existing.meta.updatedBy ?? existing.meta.author,
          changeReason: existing.meta.changeReason ?? "Initial version",
          changedAt: existing.meta.updatedAt,
        },
      ],
    };
  }
  const parsed = questionSchema.safeParse(next);
  if (!parsed.success) throw new StoreError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return parsed.data;
}
