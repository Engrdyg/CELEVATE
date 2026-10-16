import { questionCoreSchema, questionSchema, type Question, type QuestionCore } from "@/lib/qbank/schema";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { applyWorkflow } from "./workflow";
import { prepareSave } from "./save";
import { StoreError, type Actor, type AttemptRecord, type AuditEntry, type QuestionReport, type QuestionStore, type ReportStatus, type WorkflowAction } from "./types";

/** Minimal SQL executor implemented by `pg` (production) and PGlite (tests). */
export interface Sql {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
  transaction<T>(fn: (tx: Sql) => Promise<T>): Promise<T>;
}

interface QuestionRow {
  id: string;
  subject_id: QuestionCore["subject"];
  topic_id: string;
  subtopic_id: string;
  question_type: QuestionCore["type"];
  title: string;
  question_text: string;
  difficulty: QuestionCore["difficulty"];
  estimated_time_seconds: number;
  explanation: string;
  details: Record<string, unknown>;
  verification: QuestionCore["verification"];
  validation_status: QuestionCore["status"]["validation"];
  publication_status: QuestionCore["status"]["publication"];
  sme_review_status: QuestionCore["status"]["smeReview"];
  current_version: number;
  created_by: string;
  reviewed_by: string | null;
  sme_reviewed_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const iso = (d: string | Date) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());

function toCore(row: QuestionRow, choices: { choice_label: string; choice_text: string; choice_value: number | null; is_correct: boolean }[], steps: { step_title: string; explanation: string; equation_latex: string | null }[]): QuestionCore {
  const d = row.details as Record<string, never>;
  const correct = choices.find((c) => c.is_correct);
  const core = {
    id: row.id,
    subject: row.subject_id,
    topic: row.topic_id,
    subtopic: row.subtopic_id,
    type: row.question_type,
    title: row.title,
    stem: row.question_text,
    ...(d.figure ? { figure: d.figure } : {}),
    choices: choices.map((c) => ({ key: c.choice_label, text: c.choice_text, ...(c.choice_value !== null && c.choice_value !== undefined ? { value: Number(c.choice_value) } : {}) })),
    answer: correct?.choice_label,
    difficulty: row.difficulty,
    estimatedTimeSeconds: row.estimated_time_seconds,
    given: d.given ?? [],
    required: d.required,
    formulas: d.formulas ?? [],
    variables: d.variables ?? [],
    solution: steps.map((s) => ({ title: s.step_title, text: s.explanation, ...(s.equation_latex ? { tex: s.equation_latex } : {}) })),
    finalAnswer: d.finalAnswer,
    insight: row.explanation,
    commonErrors: d.commonErrors ?? [],
    relatedConcepts: d.relatedConcepts ?? [],
    relatedLessonIds: d.relatedLessonIds ?? [],
    formulaIds: d.formulaIds ?? [],
    references: d.references ?? [],
    verification: row.verification,
    status: { validation: row.validation_status, publication: row.publication_status, smeReview: row.sme_review_status },
    meta: {
      author: row.created_by,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
      version: row.current_version,
      reviewedBy: row.reviewed_by,
      smeReviewer: row.sme_reviewed_by,
      ...(d.changeReason ? { changeReason: d.changeReason } : {}),
    },
  };
  return questionCoreSchema.parse(core);
}

export class PostgresStore implements QuestionStore {
  readonly kind = "postgres" as const;
  readonly writable = true;
  constructor(private sql: Sql) {}

  /** Upserts subjects and topics from data/question-bank/taxonomy.json. */
  async syncTaxonomy() {
    await this.sql.transaction(async (tx) => {
      for (const s of taxonomy.subjects) {
        await tx.query(
          `insert into subjects (id, code, name, official_title, weight, display_order) values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set code = excluded.code, name = excluded.name, official_title = excluded.official_title, weight = excluded.weight, display_order = excluded.display_order`,
          [s.id, s.code, s.name, s.officialTitle, s.weight, s.displayOrder],
        );
        let ti = 0;
        for (const t of s.topics) {
          await tx.query(
            `insert into topics (id, subject_id, parent_topic_id, title, display_order) values ($1,$2,null,$3,$4)
             on conflict (id) do update set title = excluded.title, display_order = excluded.display_order`,
            [t.id, s.id, t.title, ti++],
          );
          let si = 0;
          for (const st of t.subtopics) {
            await tx.query(
              `insert into topics (id, subject_id, parent_topic_id, title, display_order) values ($1,$2,$3,$4,$5)
               on conflict (id) do update set title = excluded.title, parent_topic_id = excluded.parent_topic_id, display_order = excluded.display_order`,
              [st.id, s.id, t.id, st.title, si++],
            );
          }
        }
      }
    });
  }

  private async hydrate(rows: QuestionRow[], tx: Sql = this.sql, withHistory = true): Promise<Question[]> {
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const choices = (await tx.query<{ question_id: string; choice_label: string; choice_text: string; choice_value: number | null; is_correct: boolean }>(
      `select question_id, choice_label, choice_text, choice_value, is_correct from question_choices where question_id = any($1) order by question_id, display_order`,
      [ids],
    )).rows;
    const steps = (await tx.query<{ question_id: string; step_title: string; explanation: string; equation_latex: string | null }>(
      `select question_id, step_title, explanation, equation_latex from question_solutions where question_id = any($1) order by question_id, step_number`,
      [ids],
    )).rows;
    const versions = withHistory
      ? (await tx.query<{ question_id: string; version_number: number; content_snapshot: unknown; changed_by: string; change_reason: string; created_at: string | Date }>(
          `select question_id, version_number, content_snapshot, changed_by, change_reason, created_at from question_versions where question_id = any($1) order by question_id, version_number`,
          [ids],
        )).rows
      : [];
    return rows.map((r) => {
      const core = toCore(r, choices.filter((c) => c.question_id === r.id), steps.filter((s) => s.question_id === r.id));
      const history = versions
        .filter((v) => v.question_id === r.id && v.version_number < r.current_version)
        .map((v) => ({ version: v.version_number, snapshot: v.content_snapshot, changedBy: v.changed_by, changeReason: v.change_reason, changedAt: iso(v.created_at) }));
      return questionSchema.parse({ ...core, history });
    });
  }

  async all() {
    const rows = (await this.sql.query<QuestionRow>(`select * from questions order by id`)).rows;
    return this.hydrate(rows, this.sql, false);
  }

  async published() {
    const rows = (await this.sql.query<QuestionRow>(`select * from questions where publication_status = 'published' and validation_status = 'verified' order by id`)).rows;
    return this.hydrate(rows, this.sql, false);
  }

  async get(id: string) {
    const rows = (await this.sql.query<QuestionRow>(`select * from questions where id = $1`, [id])).rows;
    return (await this.hydrate(rows))[0] ?? null;
  }

  async getVersion(id: string, version: number) {
    const r = (await this.sql.query<{ content_snapshot: unknown }>(`select content_snapshot from question_versions where question_id = $1 and version_number = $2`, [id, version])).rows[0];
    if (!r) return null;
    const p = questionCoreSchema.safeParse(r.content_snapshot);
    return p.success ? p.data : null;
  }

  async versions(id: string) {
    const rows = (await this.sql.query<{ version_number: number; content_snapshot: unknown; changed_by: string; change_reason: string; created_at: string | Date }>(
      `select version_number, content_snapshot, changed_by, change_reason, created_at from question_versions where question_id = $1 order by version_number desc`,
      [id],
    )).rows;
    return rows.flatMap((r) => {
      const p = questionCoreSchema.safeParse(r.content_snapshot);
      return p.success ? [{ version: r.version_number, changedBy: r.changed_by, changeReason: r.change_reason, changedAt: iso(r.created_at), snapshot: p.data }] : [];
    });
  }

  /** Writes a full question (row, choices, solution steps, version snapshot) inside a transaction. */
  private async write(tx: Sql, q: Question, actor: Actor, reason: string, isNew: boolean) {
    const { history: _h, ...core } = q;
    const details = {
      figure: q.figure ?? null,
      given: q.given,
      required: q.required,
      formulas: q.formulas,
      variables: q.variables,
      finalAnswer: q.finalAnswer,
      commonErrors: q.commonErrors,
      relatedConcepts: q.relatedConcepts,
      relatedLessonIds: q.relatedLessonIds,
      formulaIds: q.formulaIds,
      references: q.references,
      changeReason: q.meta.changeReason ?? null,
    };
    const params = [
      q.id, q.subject, q.topic, q.subtopic, q.type, q.title, q.stem, q.difficulty, q.estimatedTimeSeconds, q.insight,
      q.formulas[0]?.tex ?? null, q.references.length ? q.references.join("\n") : null, JSON.stringify(details), JSON.stringify(q.verification),
      q.status.validation, q.status.publication, q.status.smeReview, q.meta.version, q.meta.author, q.meta.reviewedBy, q.meta.smeReviewer ?? null,
      q.meta.createdAt, q.meta.updatedAt,
    ];
    await tx.query(
      `insert into questions (id, subject_id, topic_id, subtopic_id, question_type, title, question_text, difficulty, estimated_time_seconds, explanation,
         formula_latex, reference_text, details, verification, validation_status, publication_status, sme_review_status, current_version, created_by, reviewed_by, sme_reviewed_by, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15,$16,$17,$18,$19,$20,$21,$22,$23)
       on conflict (id) do update set subject_id = excluded.subject_id, topic_id = excluded.topic_id, subtopic_id = excluded.subtopic_id, question_type = excluded.question_type,
         title = excluded.title, question_text = excluded.question_text, difficulty = excluded.difficulty, estimated_time_seconds = excluded.estimated_time_seconds,
         explanation = excluded.explanation, formula_latex = excluded.formula_latex, reference_text = excluded.reference_text, details = excluded.details,
         verification = excluded.verification, validation_status = excluded.validation_status, publication_status = excluded.publication_status,
         sme_review_status = excluded.sme_review_status, current_version = excluded.current_version, reviewed_by = excluded.reviewed_by,
         sme_reviewed_by = excluded.sme_reviewed_by, updated_at = excluded.updated_at`,
      params,
    );
    await tx.query(`delete from question_choices where question_id = $1`, [q.id]);
    let order = 1;
    for (const c of q.choices) {
      await tx.query(
        `insert into question_choices (question_id, choice_label, choice_text, choice_value, is_correct, display_order) values ($1,$2,$3,$4,$5,$6)`,
        [q.id, c.key, c.text, c.value ?? null, c.key === q.answer, order++],
      );
    }
    await tx.query(`delete from question_solutions where question_id = $1`, [q.id]);
    let step = 1;
    for (const s of q.solution) {
      await tx.query(`insert into question_solutions (question_id, step_number, step_title, explanation, equation_latex) values ($1,$2,$3,$4,$5)`, [q.id, step++, s.title, s.text, s.tex ?? null]);
    }
    await tx.query(
      `insert into question_versions (question_id, version_number, content_snapshot, changed_by, change_reason) values ($1,$2,$3::jsonb,$4,$5)
       on conflict (question_id, version_number) do update set content_snapshot = excluded.content_snapshot`,
      [q.id, q.meta.version, JSON.stringify(core), actor.name, reason],
    );
    await tx.query(`insert into audit_log (actor, action, entity, entity_id, details) values ($1,$2,'question',$3,$4::jsonb)`, [
      `${actor.name} (${actor.role})`,
      isNew ? "create" : "update",
      q.id,
      JSON.stringify({ version: q.meta.version, reason }),
    ]);
  }

  async save(input: QuestionCore, actor: Actor, reason: string) {
    return this.sql.transaction(async (tx) => {
      const existing = (await this.hydrate((await tx.query<QuestionRow>(`select * from questions where id = $1 for update`, [input.id])).rows, tx))[0] ?? null;
      if (existing && existing.subject !== input.subject) throw new StoreError("Changing a question's subject is not supported");
      const next = prepareSave(existing, input, actor, reason);
      await this.write(tx, next, actor, reason, !existing);
      return next;
    });
  }

  /** Bulk import of already-validated records (keeps their status and metadata). */
  async importQuestions(questions: Question[], actor: Actor, reason: string) {
    let n = 0;
    await this.sql.transaction(async (tx) => {
      for (const q of questions) {
        for (const h of q.history) {
          await tx.query(
            `insert into questions (id, subject_id, topic_id, subtopic_id, question_type, title, question_text, difficulty, estimated_time_seconds, explanation, details, verification, created_by)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'{}'::jsonb,'{"method":"python-recompute","status":"not-run"}'::jsonb,$11) on conflict (id) do nothing`,
            [q.id, q.subject, q.topic, q.subtopic, q.type, q.title, q.stem, q.difficulty, q.estimatedTimeSeconds, q.insight, q.meta.author],
          );
          await tx.query(
            `insert into question_versions (question_id, version_number, content_snapshot, changed_by, change_reason, created_at) values ($1,$2,$3::jsonb,$4,$5,$6)
             on conflict (question_id, version_number) do nothing`,
            [q.id, h.version, JSON.stringify(h.snapshot), h.changedBy, h.changeReason, h.changedAt],
          );
        }
        await this.write(tx, q, actor, reason, true);
        n++;
      }
    });
    return n;
  }

  async workflow(id: string, action: WorkflowAction, actor: Actor) {
    return this.sql.transaction(async (tx) => {
      const q = (await this.hydrate((await tx.query<QuestionRow>(`select * from questions where id = $1 for update`, [id])).rows, tx))[0];
      if (!q) throw new StoreError("Question not found", 404);
      const next = applyWorkflow(q, action, actor);
      await tx.query(
        `update questions set validation_status = $2, publication_status = $3, sme_review_status = $4, reviewed_by = $5, sme_reviewed_by = $6, updated_at = $7 where id = $1`,
        [id, next.status.validation, next.status.publication, next.status.smeReview, next.meta.reviewedBy, next.meta.smeReviewer ?? null, next.meta.updatedAt],
      );
      await tx.query(`insert into audit_log (actor, action, entity, entity_id, details) values ($1,$2,'question',$3,$4::jsonb)`, [
        `${actor.name} (${actor.role})`,
        `workflow:${action.type}`,
        id,
        JSON.stringify(action),
      ]);
      return next;
    });
  }

  async addReport(r: Omit<QuestionReport, "id" | "status" | "reviewedBy" | "resolution" | "createdAt" | "updatedAt">) {
    const row = (await this.sql.query<Record<string, string>>(
      `insert into question_reports (question_id, reported_by, issue_type, description) values ($1,$2,$3,$4) returning *`,
      [r.questionId, r.reportedBy, r.issueType, r.description],
    )).rows[0];
    return mapReport(row);
  }

  async reports() {
    return (await this.sql.query<Record<string, string>>(`select * from question_reports order by created_at desc limit 500`)).rows.map(mapReport);
  }

  async updateReport(id: string, patch: { status: ReportStatus; resolution?: string }, actor: Actor) {
    const row = (await this.sql.query<Record<string, string>>(
      `update question_reports set status = $2, resolution = coalesce($3, resolution), reviewed_by = $4, updated_at = now() where id = $1 returning *`,
      [id, patch.status, patch.resolution ?? null, actor.name],
    )).rows[0];
    if (!row) throw new StoreError("Report not found", 404);
    return mapReport(row);
  }

  async recordAttempt(a: AttemptRecord) {
    await this.sql.transaction(async (tx) => {
      const inserted = (await tx.query(
        `insert into exam_attempts (id, exam_id, learner_id, title, started_at, deadline_at, submitted_at, score, correct_count, question_count, duration_seconds, auto_submitted, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'submitted') on conflict (id) do nothing returning id`,
        [a.id, null, a.learnerId, a.title, a.startedAt, a.deadlineAt, a.submittedAt, a.percent, a.correct, a.total, a.durationSeconds, a.autoSubmitted],
      )).rows;
      if (!inserted.length) return; // idempotent: a duplicate submission does not overwrite the first result
      for (const it of a.items) {
        await tx.query(
          `insert into exam_attempt_questions (attempt_id, question_id, question_version, question_version_id, question_order, choice_order, answer_snapshot, selected_choice_id, is_correct, answered_at, is_flagged, time_spent_seconds)
           values ($1,$2,$3,(select id from question_versions where question_id = $2 and version_number = $3),$4,$5,$6,
                   (select id from question_choices where question_id = $2 and choice_label = $6),$7,$8,$9,$10)`,
          [a.id, it.id, it.version, it.position, it.order, it.selected, it.isCorrect, it.selected ? a.submittedAt : null, it.flagged, it.seconds ?? null],
        );
      }
    });
    return true;
  }

  async audit(limit = 100): Promise<AuditEntry[]> {
    const rows = (await this.sql.query<{ actor: string; action: string; entity: string; entity_id: string; details: unknown; created_at: string | Date }>(
      `select actor, action, entity, entity_id, details, created_at from audit_log order by id desc limit $1`,
      [limit],
    )).rows;
    return rows.map((r) => ({ actor: r.actor, action: r.action, entity: r.entity, entityId: r.entity_id, details: r.details, createdAt: iso(r.created_at) }));
  }
}

function mapReport(row: Record<string, string>): QuestionReport {
  return {
    id: row.id,
    questionId: row.question_id,
    reportedBy: row.reported_by,
    issueType: row.issue_type as QuestionReport["issueType"],
    description: row.description,
    status: row.status as ReportStatus,
    reviewedBy: row.reviewed_by ?? null,
    resolution: row.resolution ?? null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}
