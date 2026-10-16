import type { GradedItem } from "@/lib/qbank/engine";
import type { Question, QuestionCore, ValidationStatus } from "@/lib/qbank/schema";

export type StaffRole = "admin" | "reviewer" | "author";
export interface Actor {
  name: string;
  role: StaffRole | "system";
}

export const REPORT_ISSUES = ["wrong_answer", "calculation_error", "unclear_question", "typo", "rendering", "other"] as const;
export type ReportIssue = (typeof REPORT_ISSUES)[number];
export const REPORT_STATUSES = ["open", "investigating", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface QuestionReport {
  id: string;
  questionId: string;
  reportedBy: string;
  issueType: ReportIssue;
  description: string;
  status: ReportStatus;
  reviewedBy: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptRecord {
  id: string;
  learnerId: string;
  examId: string | null;
  title: string;
  startedAt: string;
  deadlineAt: string | null;
  submittedAt: string;
  percent: number;
  correct: number;
  total: number;
  durationSeconds: number;
  autoSubmitted: boolean;
  items: (GradedItem & { order: string; position: number })[];
}

export interface AuditEntry {
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  details?: unknown;
  createdAt: string;
}

export type WorkflowAction =
  | { type: "transition"; to: ValidationStatus; note?: string }
  | { type: "publish" }
  | { type: "unpublish" }
  | { type: "archive" }
  | { type: "restore" }
  | { type: "sme"; decision: "approved" | "changes_requested"; note?: string; /** Reviewer confirms they are a licensed civil engineer who checked the item independently. */ attestLicensed?: boolean };

export class StoreError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export interface QuestionStore {
  readonly kind: "file" | "postgres";
  /** Whether content edits can be persisted by this deployment. */
  readonly writable: boolean;
  all(): Promise<Question[]>;
  published(): Promise<Question[]>;
  get(id: string): Promise<Question | null>;
  /** Exact content of a given version (for grading historical attempts). */
  getVersion(id: string, version: number): Promise<QuestionCore | null>;
  versions(id: string): Promise<{ version: number; changedBy: string; changeReason: string; changedAt: string; snapshot: QuestionCore }[]>;
  save(q: QuestionCore, actor: Actor, reason: string): Promise<Question>;
  workflow(id: string, action: WorkflowAction, actor: Actor): Promise<Question>;
  addReport(r: Omit<QuestionReport, "id" | "status" | "reviewedBy" | "resolution" | "createdAt" | "updatedAt">): Promise<QuestionReport | null>;
  reports(): Promise<QuestionReport[]>;
  updateReport(id: string, patch: { status: ReportStatus; resolution?: string }, actor: Actor): Promise<QuestionReport>;
  recordAttempt(a: AttemptRecord): Promise<boolean>;
  audit(limit?: number): Promise<AuditEntry[]>;
}
