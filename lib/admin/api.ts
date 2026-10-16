"use client";

import type { Question, QuestionCore } from "@/lib/qbank/schema";
import type { DuplicatePair } from "@/lib/qbank/duplicates";
import type { AuditEntry, QuestionReport } from "@/lib/server/qbank/types";
import type { ExamConfig, Taxonomy } from "@/lib/qbank/taxonomy";

export type StaffRole = "admin" | "reviewer" | "author";
export interface Staff {
  name: string;
  role: StaffRole;
}

export class AdminError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues: string[] = [],
  ) {
    super(message);
  }
}

async function call<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init?.json !== undefined ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminError(data.error ?? `Request failed (${res.status})`, res.status, data.issues ?? []);
  return data as T;
}

export interface QuestionRow {
  id: string;
  subject: Question["subject"];
  topic: string;
  subtopic: string;
  type: Question["type"];
  title: string;
  stem: string;
  difficulty: Question["difficulty"];
  status: Question["status"];
  verification: { status: string; method: string };
  version: number;
  updatedAt: string;
  author: string;
}

export interface Counts {
  generated: number;
  verificationPassed: number;
  validated: number;
  awaitingHumanReview: number;
  smeApproved: number;
  published: number;
  bySubject: Record<string, number>;
  publishedBySubject: Record<string, number>;
  byDifficulty: Record<string, number>;
  byValidation: Record<string, number>;
  byType: Record<string, number>;
}

export interface Overview {
  storage: "file" | "postgres";
  writable: boolean;
  counts: Counts;
  target: number;
  duplicates: DuplicatePair[];
  openReports: number;
  coverage: { subject: string; code: string; topics: { id: string; title: string; total: number; published: number }[] }[];
  audit: AuditEntry[];
  taxonomyVerification: Taxonomy["verification"];
  config: ExamConfig;
}

export interface VersionEntry {
  version: number;
  changedBy: string;
  changeReason: string;
  changedAt: string;
  snapshot: QuestionCore;
}

export interface Issue {
  level: "error" | "warning";
  message: string;
}

export type WorkflowAction =
  | { type: "transition"; to: Question["status"]["validation"]; note?: string }
  | { type: "publish" }
  | { type: "unpublish" }
  | { type: "archive" }
  | { type: "restore" }
  | { type: "sme"; decision: "approved" | "changes_requested"; note?: string; /** Reviewer confirms they are a licensed civil engineer who checked the item independently. */ attestLicensed?: boolean };

export const adminApi = {
  session: () => call<{ configured: boolean; staff: Staff | null; storage: string; writable: boolean }>("/api/admin/session"),
  login: (token: string) => call<{ staff: Staff }>("/api/admin/session", { method: "POST", json: { token } }),
  logout: () => call<{ ok: true }>("/api/admin/session", { method: "DELETE" }),
  overview: () => call<Overview>("/api/admin/overview"),
  list: () => call<{ storage: string; writable: boolean; questions: QuestionRow[] }>("/api/admin/questions"),
  get: (id: string) =>
    call<{ question: Question; versions: VersionEntry[]; reports: QuestionReport[]; issues: Issue[]; writable: boolean }>(`/api/admin/questions/${encodeURIComponent(id)}`),
  create: (question: QuestionCore, reason: string) => call<{ question: Question }>("/api/admin/questions", { method: "POST", json: { question, reason } }),
  update: (question: QuestionCore, reason: string) => call<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(question.id)}`, { method: "PUT", json: { question, reason } }),
  workflow: (id: string, action: WorkflowAction) => call<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(id)}`, { method: "POST", json: action }),
  importBank: (body: { format: "json" | "csv"; content: string; commit: boolean; reason?: string }) =>
    call<{ total: number; valid: number; errors: { row: number; id?: string; messages: string[] }[]; warnings: DuplicatePair[]; imported: number; committed: boolean }>("/api/admin/import", {
      method: "POST",
      json: body,
    }),
  reports: () => call<{ reports: QuestionReport[]; writable: boolean; storage: string }>("/api/admin/reports"),
  updateReport: (id: string, status: QuestionReport["status"], resolution?: string) =>
    call<{ report: QuestionReport }>("/api/admin/reports", { method: "PATCH", json: { id, status, resolution } }),
  verify: (subject?: string) => call<{ ok: boolean; output: string[] }>("/api/admin/verify", { method: "POST", json: { subject } }),
};
