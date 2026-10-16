import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { bankFileSchema, questionCoreSchema, questionSchema, type BankFile, type Question, type QuestionCore } from "@/lib/qbank/schema";
import { applyWorkflow } from "./workflow";
import { prepareSave } from "./save";
import { StoreError, type Actor, type AttemptRecord, type AuditEntry, type QuestionReport, type QuestionStore, type ReportStatus, type WorkflowAction } from "./types";

export const BANK_DIR = path.join(process.cwd(), "data", "question-bank");
export const BANK_FILES: Record<string, string> = {
  mste: "mathematics-surveying-transportation.json",
  hge: "hydraulics-geotechnical.json",
  psad: "structural-analysis-design.json",
};

const TITLES: Record<string, string> = {
  mste: "Applied Mathematics, Surveying, Principles of Transportation and Highway Engineering, Construction Management and Methods",
  hge: "Hydraulics and Principles of Geotechnical Engineering",
  psad: "Principles of Structural Analysis and Design",
};

function stripHistory(q: Question): QuestionCore {
  const { history: _h, ...core } = q;
  return core;
}

function writeAtomic(file: string, data: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data, "utf8");
  fs.renameSync(tmp, file);
}

/**
 * Question store backed by the version-controlled JSON files in data/question-bank.
 * Read-only in production (serverless filesystems are immutable); writable during
 * local development or when QBANK_FILE_WRITES=1, so content changes are reviewed
 * and committed through git like code.
 */
export class FileStore implements QuestionStore {
  readonly kind = "file" as const;
  readonly writable: boolean;
  private cache: { mtimes: string; files: Map<string, BankFile> } | null = null;

  // Bank files are bundled via outputFileTracingIncludes (next.config.ts), so dynamic paths are excluded from tracing.
  constructor(private dir = BANK_DIR) {
    this.writable = process.env.QBANK_FILE_WRITES === "1" || (process.env.NODE_ENV === "development" && process.env.QBANK_FILE_WRITES !== "0");
  }

  private get reportsFile() {
    return path.join(/*turbopackIgnore: true*/ this.dir, "reports", "student-reports.json");
  }

  private get auditFile() {
    return path.join(/*turbopackIgnore: true*/ this.dir, "reports", "audit-log.jsonl");
  }

  private filePath(subject: string) {
    return path.join(/*turbopackIgnore: true*/ this.dir, BANK_FILES[subject]);
  }

  private load(): Map<string, BankFile> {
    const mtimes = Object.keys(BANK_FILES)
      .map((s) => {
        try {
          return fs.statSync(this.filePath(s)).mtimeMs;
        } catch {
          return 0;
        }
      })
      .join("|");
    if (this.cache && this.cache.mtimes === mtimes) return this.cache.files;
    const files = new Map<string, BankFile>();
    for (const subject of Object.keys(BANK_FILES)) {
      const p = this.filePath(subject);
      if (!fs.existsSync(p)) {
        files.set(subject, { subject: subject as BankFile["subject"], title: TITLES[subject], questions: [] });
        continue;
      }
      const parsed = bankFileSchema.safeParse(JSON.parse(fs.readFileSync(p, "utf8")));
      if (!parsed.success) {
        // Never serve an invalid bank silently; skip invalid records but keep valid ones.
        const raw = JSON.parse(fs.readFileSync(p, "utf8"));
        const questions = (raw.questions ?? []).flatMap((q: unknown) => {
          const r = questionSchema.safeParse(q);
          if (!r.success) console.error(`[qbank] skipping invalid question ${(q as { id?: string }).id}: ${r.error.issues[0]?.message}`);
          return r.success ? [r.data] : [];
        });
        files.set(subject, { subject: subject as BankFile["subject"], title: raw.title ?? TITLES[subject], questions });
      } else files.set(subject, parsed.data);
    }
    this.cache = { mtimes, files };
    return files;
  }

  private persist(subject: string, file: BankFile) {
    if (!this.writable) throw new StoreError("This deployment's question bank is read-only. Edit locally (development) or configure DATABASE_URL.", 409);
    file.questions.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    writeAtomic(this.filePath(subject), JSON.stringify(file, null, 2) + "\n");
    this.cache = null;
  }

  private log(actor: Actor, action: string, entity: string, entityId: string, details?: unknown) {
    if (!this.writable) return;
    const entry: AuditEntry = { actor: `${actor.name} (${actor.role})`, action, entity, entityId, details, createdAt: new Date().toISOString() };
    fs.mkdirSync(path.dirname(this.auditFile), { recursive: true });
    fs.appendFileSync(this.auditFile, JSON.stringify(entry) + "\n");
  }

  async all() {
    return Array.from(this.load().values()).flatMap((f) => f.questions);
  }

  async published() {
    return (await this.all()).filter((q) => q.status.publication === "published" && q.status.validation === "verified");
  }

  async get(id: string) {
    return (await this.all()).find((q) => q.id === id) ?? null;
  }

  async getVersion(id: string, version: number) {
    const q = await this.get(id);
    if (!q) return null;
    if (q.meta.version === version) return stripHistory(q);
    const snap = q.history.find((h) => h.version === version)?.snapshot;
    const parsed = snap ? questionCoreSchema.safeParse(snap) : null;
    return parsed?.success ? parsed.data : null;
  }

  async versions(id: string) {
    const q = await this.get(id);
    if (!q) return [];
    const past = q.history.flatMap((h) => {
      const p = questionCoreSchema.safeParse(h.snapshot);
      return p.success ? [{ version: h.version, changedBy: h.changedBy, changeReason: h.changeReason, changedAt: h.changedAt, snapshot: p.data }] : [];
    });
    return [...past, { version: q.meta.version, changedBy: q.meta.updatedBy ?? q.meta.author, changeReason: q.meta.changeReason ?? "Current version", changedAt: q.meta.updatedAt, snapshot: stripHistory(q) }].sort((a, b) => b.version - a.version);
  }

  async save(input: QuestionCore, actor: Actor, reason: string) {
    const files = this.load();
    const file = files.get(input.subject)!;
    const existing = (await this.all()).find((q) => q.id === input.id) ?? null;
    if (existing && existing.subject !== input.subject) throw new StoreError("Changing a question's subject is not supported; create a new question instead");
    const next = prepareSave(existing, input, actor, reason);
    file.questions = [...file.questions.filter((q) => q.id !== next.id), next];
    this.persist(input.subject, file);
    this.log(actor, existing ? "update" : "create", "question", next.id, { version: next.meta.version, reason });
    return next;
  }

  async workflow(id: string, action: WorkflowAction, actor: Actor) {
    const q = await this.get(id);
    if (!q) throw new StoreError("Question not found", 404);
    const next = applyWorkflow(q, action, actor);
    const file = this.load().get(q.subject)!;
    file.questions = file.questions.map((x) => (x.id === id ? next : x));
    this.persist(q.subject, file);
    this.log(actor, `workflow:${action.type}`, "question", id, action);
    return next;
  }

  private readReports(): QuestionReport[] {
    try {
      return JSON.parse(fs.readFileSync(this.reportsFile, "utf8"));
    } catch {
      return [];
    }
  }

  async addReport(r: Omit<QuestionReport, "id" | "status" | "reviewedBy" | "resolution" | "createdAt" | "updatedAt">) {
    if (!this.writable) return null;
    const now = new Date().toISOString();
    const report: QuestionReport = { ...r, id: randomUUID(), status: "open", reviewedBy: null, resolution: null, createdAt: now, updatedAt: now };
    writeAtomic(this.reportsFile, JSON.stringify([report, ...this.readReports()], null, 2) + "\n");
    return report;
  }

  async reports() {
    return this.readReports();
  }

  async updateReport(id: string, patch: { status: ReportStatus; resolution?: string }, actor: Actor) {
    if (!this.writable) throw new StoreError("Read-only deployment", 409);
    const list = this.readReports();
    const r = list.find((x) => x.id === id);
    if (!r) throw new StoreError("Report not found", 404);
    Object.assign(r, { status: patch.status, resolution: patch.resolution ?? r.resolution, reviewedBy: actor.name, updatedAt: new Date().toISOString() });
    writeAtomic(this.reportsFile, JSON.stringify(list, null, 2) + "\n");
    this.log(actor, "report:update", "report", id, patch);
    return r;
  }

  async recordAttempt(_a: AttemptRecord) {
    // Learner data is never written into the content repository; attempts stay in the learner's browser.
    return false;
  }

  async audit(limit = 100) {
    try {
      return fs
        .readFileSync(this.auditFile, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as AuditEntry)
        .reverse()
        .slice(0, limit);
    } catch {
      return [];
    }
  }
}
