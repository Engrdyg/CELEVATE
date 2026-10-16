import { TRANSITIONS, questionSchema, type Question } from "@/lib/qbank/schema";
import { examConfig } from "@/lib/qbank/taxonomy";
import { StoreError, type Actor, type WorkflowAction } from "./types";

/** Which roles may perform which workflow actions. */
export function canPerform(actor: Actor, action: WorkflowAction): boolean {
  if (actor.role === "system" || actor.role === "admin") return true;
  if (actor.role === "reviewer") return action.type === "transition" || action.type === "sme";
  // Authors may only move their drafts into technical review (or back to draft).
  return action.type === "transition" && (action.to === "technical_review" || action.to === "draft");
}

/** Applies a workflow action to a question, enforcing the publishing rules. Returns the new question. */
export function applyWorkflow(q: Question, action: WorkflowAction, actor: Actor, now = new Date().toISOString()): Question {
  if (!canPerform(actor, action)) throw new StoreError(`${actor.role} cannot perform ${action.type}`, 403);
  const next: Question = structuredClone(q);
  next.meta.updatedAt = now;
  switch (action.type) {
    case "transition": {
      if (!TRANSITIONS[q.status.validation].includes(action.to)) throw new StoreError(`Cannot move from ${q.status.validation} to ${action.to}`);
      if (action.to === "verified") {
        if (q.verification.status !== "passed") throw new StoreError("Verification has not passed; run the verification pipeline first");
        if (q.verification.method === "conceptual-review" && q.status.smeReview !== "approved")
          throw new StoreError("Conceptual questions need human SME approval before they can be marked verified");
        next.meta.reviewedBy = actor.name;
      }
      next.status.validation = action.to;
      // Leaving "verified" withdraws publication.
      if (action.to !== "verified" && next.status.publication === "published") next.status.publication = "unpublished";
      break;
    }
    case "publish": {
      if (q.status.publication === "archived") throw new StoreError("Restore the question before publishing");
      if (q.status.validation !== "verified") throw new StoreError("Only verified questions can be published");
      if (examConfig.requireSmeApprovalToPublish && q.status.smeReview !== "approved") throw new StoreError("SME approval is required before publishing");
      next.status.publication = "published";
      break;
    }
    case "unpublish":
      next.status.publication = "unpublished";
      break;
    case "archive":
      next.status.publication = "archived";
      break;
    case "restore":
      if (q.status.publication !== "archived") throw new StoreError("Question is not archived");
      next.status.publication = "unpublished";
      break;
    case "sme":
      // A human licensed-engineer approval can never be recorded by automation or without an explicit attestation.
      if (action.decision === "approved" && (actor.role === "system" || !action.attestLicensed))
        throw new StoreError("SME approval must be made by a human reviewer who attests to being a licensed civil engineer", 403);
      next.status.smeReview = action.decision;
      next.meta.smeReviewer = actor.name;
      if (action.decision === "changes_requested") {
        next.status.publication = q.status.publication === "archived" ? "archived" : "unpublished";
        next.status.validation = "needs_review";
      }
      break;
  }
  const parsed = questionSchema.safeParse(next);
  if (!parsed.success) throw new StoreError(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return parsed.data;
}
