"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Archive, CheckCircle2, Eye, History, Plus, RotateCcw, Save, Send, ShieldCheck, Trash2, Upload, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionBody, SolutionPanel } from "@/components/practice/question-card";
import { adminApi, AdminError, type Staff, type VersionEntry, type WorkflowAction } from "@/lib/admin/api";
import { toPublicQuestion, toReviewQuestion } from "@/lib/qbank/engine";
import { CHOICE_KEYS, FIGURE_IDS, TRANSITIONS, questionSchema, type Question, type QuestionCore } from "@/lib/qbank/schema";
import { taxonomy } from "@/lib/qbank/taxonomy";
import { validateQuestion } from "@/lib/qbank/validate";
import type { QuestionReport } from "@/lib/server/qbank/types";
import { formatRelative } from "@/lib/utils";
import { StatusBadges, label } from "./status";

type Draft = QuestionCore;
type PreviewTab = "question" | "solution" | "history" | "reports";

function template(subject: Draft["subject"], id: string, author: string): Draft {
  const s = taxonomy.subjects.find((x) => x.id === subject)!;
  const now = new Date().toISOString();
  return {
    id,
    subject,
    topic: s.topics[0].id,
    subtopic: s.topics[0].subtopics[0].id,
    type: "computational",
    title: "",
    stem: "",
    choices: CHOICE_KEYS.map((key) => ({ key, text: "" })),
    answer: "A",
    difficulty: "moderate",
    estimatedTimeSeconds: 180,
    given: [],
    required: "",
    formulas: [{ label: "", tex: "" }],
    variables: [],
    solution: [
      { title: "", text: "" },
      { title: "", text: "" },
    ],
    finalAnswer: "",
    insight: "",
    commonErrors: [],
    relatedConcepts: [],
    relatedLessonIds: [],
    formulaIds: [],
    references: [],
    verification: { method: "python-recompute", status: "not-run" },
    status: { validation: "draft", publication: "unpublished", smeReview: "pending" },
    meta: { author, createdAt: now, updatedAt: now, version: 1, reviewedBy: null },
  };
}

function nextId(subject: string, ids: string[]) {
  const nums = ids.filter((i) => i.startsWith(`${subject}-q`)).map((i) => Number(i.split("-q")[1]));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${subject}-q${String(n).padStart(3, "0")}`;
}

const strip = (q: Question): Draft => {
  const { history: _h, ...core } = q;
  return core;
};

export function QuestionEditor({
  id,
  staff,
  writable,
  storage,
  onClose,
  onOpen,
}: {
  id: string | null;
  staff: Staff;
  writable: boolean;
  storage: string;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const [stored, setStored] = useState<Question | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [allIds, setAllIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverIssues, setServerIssues] = useState<string[]>([]);
  const [tab, setTab] = useState<PreviewTab>("question");
  const [nonce, setNonce] = useState(0);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      adminApi
        .get(id)
        .then((r) => {
          if (cancelled) return;
          setStored(r.question);
          setDraft(strip(r.question));
          setFormKey((k) => k + 1);
          setVersions(r.versions);
          setReports(r.reports);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    } else {
      adminApi
        .list()
        .then((r) => {
          if (cancelled) return;
          const ids = r.questions.map((q) => q.id);
          setAllIds(ids);
          setDraft(template("mste", nextId("mste", ids), staff.name));
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    }
    return () => {
      cancelled = true;
    };
  }, [id, staff.name, nonce]);

  const issues = useMemo(() => {
    if (!draft) return [];
    const parsed = questionSchema.safeParse({ ...draft, history: [] });
    const schemaIssues = parsed.success ? [] : parsed.error.issues.map((i) => ({ level: "error" as const, message: `${i.path.join(".") || "question"}: ${i.message}` }));
    const deeper = parsed.success ? validateQuestion(parsed.data, { taxonomy }).map((i) => ({ level: i.level, message: i.message })) : [];
    return [...schemaIssues, ...deeper];
  }, [draft]);

  if (error) return <ErrorState title="Couldn't open the question" description={error} action={<Button variant="outline" onClick={onClose}>Back to list</Button>} />;
  if (!draft)
    return (
      <div className="space-y-4" role="status" aria-label="Loading">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const subject = taxonomy.subjects.find((s) => s.id === draft.subject)!;
  const topic = subject.topics.find((t) => t.id === draft.topic) ?? subject.topics[0];
  const errors = issues.filter((i) => i.level === "error");
  const dirty = !stored || JSON.stringify(strip(stored)) !== JSON.stringify(draft);
  const canEdit = writable;

  const save = async () => {
    setSaving(true);
    setServerIssues([]);
    try {
      const r = stored ? await adminApi.update(draft, reason.trim()) : await adminApi.create(draft, reason.trim());
      toast.success(stored ? `Saved ${r.question.id} v${r.question.meta.version}` : `Created ${r.question.id} as a draft`);
      setReason("");
      if (!stored) onOpen(r.question.id);
      else setNonce((n) => n + 1);
    } catch (e) {
      if (e instanceof AdminError) setServerIssues(e.issues.length ? e.issues : [e.message]);
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button type="button" onClick={onClose} className="mb-2 inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> All questions
          </button>
          <h1 className="font-display text-display-lg font-semibold">
            {stored ? stored.id : "New question"}
            {stored && <span className="ml-2 font-mono text-base text-faint">v{stored.meta.version}</span>}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {stored ? `By ${stored.meta.author} · updated ${formatRelative(stored.meta.updatedAt)}${stored.meta.reviewedBy ? ` · technical review by ${stored.meta.reviewedBy}` : ""}${stored.meta.smeReviewer ? ` · SME: ${stored.meta.smeReviewer}` : ""}` : "Starts as an unpublished draft."}
          </p>
        </div>
        {stored && <StatusBadges status={stored.status} verification={stored.verification.status} />}
      </div>

      {stored && <WorkflowBar q={stored} staff={staff} writable={writable} dirty={dirty} onDone={() => setNonce((n) => n + 1)} />}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------- Form ---------------- */}
        <fieldset key={formKey} disabled={!canEdit} className="min-w-0 space-y-5">
          <Card className="space-y-4 p-5">
            <SectionTitle>Classification</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Question id" hint={stored ? "Ids never change." : "Next free id for the subject."}>
                <Input value={draft.id} readOnly={!!stored} onChange={(e) => set("id", e.target.value.trim())} className="font-mono" />
              </Field>
              <Field label="Subject">
                <Select
                  label="Subject"
                  value={draft.subject}
                  onChange={(v) => {
                    if (stored) return;
                    const s = v as Draft["subject"];
                    const t = taxonomy.subjects.find((x) => x.id === s)!.topics[0];
                    setDraft((d) => (d ? { ...d, subject: s, id: nextId(s, allIds), topic: t.id, subtopic: t.subtopics[0].id } : d));
                  }}
                  options={taxonomy.subjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.shortName}` }))}
                  className="w-full"
                />
              </Field>
              <Field label="Topic">
                <Select
                  label="Topic"
                  value={draft.topic}
                  onChange={(v) => {
                    const t = subject.topics.find((x) => x.id === v)!;
                    setDraft((d) => (d ? { ...d, topic: t.id, subtopic: t.subtopics[0].id } : d));
                  }}
                  options={subject.topics.map((t) => ({ value: t.id, label: t.title }))}
                  className="w-full"
                />
              </Field>
              <Field label="Subtopic">
                <Select label="Subtopic" value={draft.subtopic} onChange={(v) => set("subtopic", v)} options={topic.subtopics.map((t) => ({ value: t.id, label: t.title }))} className="w-full" />
              </Field>
              <Field label="Type" hint="Computational items need a Python check; conceptual items need SME approval.">
                <Select
                  label="Type"
                  value={draft.type}
                  onChange={(v) =>
                    setDraft((d) => (d ? { ...d, type: v as Draft["type"], verification: { ...d.verification, method: v === "computational" ? "python-recompute" : "conceptual-review" } } : d))
                  }
                  options={[
                    { value: "computational", label: "Computational" },
                    { value: "conceptual", label: "Conceptual" },
                  ]}
                  className="w-full"
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  label="Difficulty"
                  value={draft.difficulty}
                  onChange={(v) => set("difficulty", v as Draft["difficulty"])}
                  options={["easy", "moderate", "difficult"].map((d) => ({ value: d, label: d[0].toUpperCase() + d.slice(1) }))}
                  className="w-full"
                />
              </Field>
              <Field label="Estimated time (seconds)">
                <Input type="number" min={30} max={900} value={draft.estimatedTimeSeconds} onChange={(e) => set("estimatedTimeSeconds", Number(e.target.value))} />
              </Field>
              <Field label="Diagram">
                <Select
                  label="Diagram"
                  value={draft.figure ?? "none"}
                  onChange={(v) => set("figure", v === "none" ? undefined : (v as Draft["figure"]))}
                  options={[{ value: "none", label: "No diagram" }, ...FIGURE_IDS.map((f) => ({ value: f, label: f }))]}
                  className="w-full"
                />
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <SectionTitle>Problem</SectionTitle>
            <Field label="Title">
              <Input value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
            </Field>
            <Field label="Problem statement" hint="Inline math with $…$, bold with **…**.">
              <Textarea value={draft.stem} onChange={(e) => set("stem", e.target.value)} rows={5} />
            </Field>
            <div className="space-y-2">
              <Label>Choices and correct answer</Label>
              {draft.choices.map((c, i) => (
                <div key={c.key} className="flex items-start gap-2">
                  <label className="mt-2.5 flex items-center gap-1.5 text-[12px]">
                    <input type="radio" name="answer" checked={draft.answer === c.key} onChange={() => set("answer", c.key)} aria-label={`Mark ${c.key} as the correct answer`} />
                    <span className="w-4 font-mono font-semibold">{c.key}</span>
                  </label>
                  <Input
                    value={c.text}
                    onChange={(e) => set("choices", draft.choices.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                    aria-label={`Choice ${c.key} text`}
                    className="flex-1"
                  />
                  {draft.type === "computational" && (
                    <Input
                      type="number"
                      step="any"
                      value={c.value ?? ""}
                      onChange={(e) => set("choices", draft.choices.map((x, j) => (j === i ? { ...x, value: e.target.value === "" ? undefined : Number(e.target.value) } : x)))}
                      aria-label={`Choice ${c.key} numeric value`}
                      placeholder="value"
                      className="w-28 font-mono"
                    />
                  )}
                </div>
              ))}
              <FieldHint>The selected radio button is the keyed answer. Numeric values are compared with the Python check.</FieldHint>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <SectionTitle>Solution</SectionTitle>
            <LinesField label="Given values (one per line)" value={draft.given} onChange={(v) => set("given", v)} />
            <Field label="Required unknown">
              <Input value={draft.required} onChange={(e) => set("required", e.target.value)} />
            </Field>
            <RowsEditor
              label="Formulas"
              rows={draft.formulas}
              empty={{ label: "", tex: "" }}
              onChange={(v) => set("formulas", v)}
              fields={[
                { key: "label", label: "Label", className: "sm:w-48" },
                { key: "tex", label: "KaTeX (no $)", className: "flex-1 font-mono" },
              ]}
            />
            <RowsEditor
              label="Variables"
              rows={draft.variables.map((v) => ({ ...v, unit: v.unit ?? "" }))}
              empty={{ symbol: "", meaning: "", unit: "" }}
              onChange={(v) => set("variables", v.map((x) => ({ symbol: x.symbol, meaning: x.meaning, ...(x.unit ? { unit: x.unit } : {}) })))}
              fields={[
                { key: "symbol", label: "Symbol (KaTeX)", className: "sm:w-32 font-mono" },
                { key: "meaning", label: "Meaning", className: "flex-1" },
                { key: "unit", label: "Unit", className: "sm:w-24" },
              ]}
            />
            <RowsEditor
              label="Solution steps (substitution and computation)"
              rows={draft.solution.map((s) => ({ ...s, tex: s.tex ?? "" }))}
              empty={{ title: "", text: "", tex: "" }}
              onChange={(v) => set("solution", v.map((x) => ({ title: x.title, text: x.text, ...(x.tex ? { tex: x.tex } : {}) })))}
              fields={[
                { key: "title", label: "Step title", className: "sm:w-40" },
                { key: "text", label: "Explanation", className: "flex-1" },
                { key: "tex", label: "Display math", className: "flex-1 font-mono" },
              ]}
            />
            <Field label="Final answer with units">
              <Input value={draft.finalAnswer} onChange={(e) => set("finalAnswer", e.target.value)} />
            </Field>
            <Field label="Engineering insight">
              <Textarea value={draft.insight} onChange={(e) => set("insight", e.target.value)} rows={3} />
            </Field>
            <LinesField label="Common errors / distractor explanations (one per line)" value={draft.commonErrors} onChange={(v) => set("commonErrors", v)} />
          </Card>

          <Card className="space-y-4 p-5">
            <SectionTitle>References and verification</SectionTitle>
            <CsvField label="Related concepts (comma-separated)" value={draft.relatedConcepts} onChange={(v) => set("relatedConcepts", v)} />
            <CsvField label="Related lesson ids" value={draft.relatedLessonIds} onChange={(v) => set("relatedLessonIds", v)} />
            <CsvField label="Formula library ids" value={draft.formulaIds} onChange={(v) => set("formulaIds", v)} />
            <LinesField label="Verified references (one per line — never invent clause numbers)" value={draft.references} onChange={(v) => set("references", v)} />
            {draft.type === "computational" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Check function" hint="verify/<subject>.py::<function>">
                  <Input value={draft.verification.script ?? ""} onChange={(e) => set("verification", { ...draft.verification, script: e.target.value || undefined })} className="font-mono" />
                </Field>
                <Field label="Unit">
                  <Input value={draft.verification.unit ?? ""} onChange={(e) => set("verification", { ...draft.verification, unit: e.target.value || undefined })} />
                </Field>
                <Field label="Relative tolerance">
                  <Input
                    type="number"
                    step="any"
                    value={draft.verification.tolerance ?? ""}
                    onChange={(e) => set("verification", { ...draft.verification, tolerance: e.target.value === "" ? undefined : Number(e.target.value) })}
                  />
                </Field>
              </div>
            )}
            <p className="rounded-lg bg-subtle px-3 py-2 text-[12px] text-muted">
              Verification status: <strong className="text-fg">{draft.verification.status}</strong>
              {draft.verification.computedValue !== undefined && ` · computed ${draft.verification.computedValue} ${draft.verification.unit ?? ""}`}
              {draft.verification.checkedAt && ` · ${formatRelative(draft.verification.checkedAt)}`}. Set by the verification pipeline, not by editors.
            </p>
          </Card>
        </fieldset>

        {/* ---------------- Preview & context ---------------- */}
        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <Tabs value={tab} onValueChange={(v) => setTab(v as PreviewTab)}>
                <TabsList>
                  <TabsTrigger value="question">
                    <Eye /> Question
                  </TabsTrigger>
                  <TabsTrigger value="solution">Solution</TabsTrigger>
                  <TabsTrigger value="history">
                    <History /> Versions
                  </TabsTrigger>
                  <TabsTrigger value="reports">Reports{reports.length ? ` (${reports.length})` : ""}</TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="text-[11px] text-faint">Preview uses the original choice order</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
              {tab === "question" ? (
                <QuestionBody q={toPublicQuestion(draft, "ABCD")} name="admin-preview" selected={null} onSelect={() => {}} answer={draft.answer} disabled />
              ) : tab === "solution" ? (
                <SolutionPanel q={toReviewQuestion(draft, "ABCD")} selected={draft.answer} showStatus={false} />
              ) : tab === "history" ? (
                <VersionList versions={versions} current={draft} onRestore={(snap) => {
                    setDraft({ ...snap, status: draft.status, meta: draft.meta, verification: draft.verification });
                    setFormKey((k) => k + 1);
                  }} canEdit={canEdit} />
              ) : (
                <ReportList reports={reports} />
              )}
            </div>
          </Card>

          <Card className="p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              {errors.length ? <XCircle className="size-4 text-danger" /> : <CheckCircle2 className="size-4 text-success" />}
              Quality checks ({errors.length} error{errors.length === 1 ? "" : "s"}, {issues.length - errors.length} warning{issues.length - errors.length === 1 ? "" : "s"})
            </p>
            {issues.length > 0 && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[12px]">
                {issues.map((i, k) => (
                  <li key={k} className={i.level === "error" ? "text-danger" : "text-warning"}>
                    • {i.message}
                  </li>
                ))}
              </ul>
            )}
            {serverIssues.length > 0 && (
              <div role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger-soft p-3 text-[12px] text-danger">
                <p className="font-semibold">Server rejected the save</p>
                <ul className="mt-1 space-y-0.5">
                  {serverIssues.map((m, k) => (
                    <li key={k}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {canEdit && (
            <Card className="space-y-3 p-4">
              <Field label="Change reason (recorded in version history)">
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={stored ? "e.g. Fixed rounding in step 3" : "e.g. New hydrostatics item"} />
              </Field>
              {stored && dirty && (
                <p className="flex items-start gap-2 text-[12px] text-warning">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> Changing the problem, choices, key or solution creates v{stored.meta.version + 1}, resets verification and unpublishes the item until it is re-verified.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={save} loading={saving} disabled={!dirty || errors.length > 0 || reason.trim().length < 3}>
                  <Save /> {stored ? "Save new version" : "Save draft"}
                </Button>
                {stored && dirty && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDraft(strip(stored));
                      setFormKey((k) => k + 1);
                    }}
                  >
                    <RotateCcw /> Discard changes
                  </Button>
                )}
              </div>
              {storage === "file" && <FieldHint>After saving computational items, add or update the check function in data/question-bank/verify and run verification.</FieldHint>}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Workflow                                                           */
/* ------------------------------------------------------------------ */

function WorkflowBar({ q, staff, writable, dirty, onDone }: { q: Question; staff: Staff; writable: boolean; dirty: boolean; onDone: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [smeOpen, setSmeOpen] = useState<"approved" | "changes_requested" | null>(null);
  const [attest, setAttest] = useState(false);
  const [note, setNote] = useState("");
  const role = staff.role;
  const run = async (key: string, action: WorkflowAction) => {
    setBusy(key);
    try {
      await adminApi.workflow(q.id, action);
      toast.success("Workflow updated");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  if (!writable) return null;
  const transitions = TRANSITIONS[q.status.validation].filter((to) => role !== "author" || to === "technical_review" || to === "draft");
  const TRANSITION_LABEL: Record<string, string> = {
    technical_review: "Submit for technical review",
    verified: "Mark verified",
    needs_review: "Needs review",
    rejected: "Reject",
    draft: "Back to draft",
  };
  return (
    <Card className="flex flex-wrap items-center gap-2 p-3">
      <span className="mr-1 text-[12px] font-medium text-muted">Workflow</span>
      {transitions.map((to) => (
        <Button
          key={to}
          size="sm"
          variant={to === "verified" || to === "technical_review" ? "primary" : to === "rejected" ? "danger" : "outline"}
          disabled={dirty || (to === "verified" && q.verification.status !== "passed")}
          loading={busy === to}
          onClick={() => run(to, { type: "transition", to })}
          title={to === "verified" && q.verification.status !== "passed" ? "Verification must pass first" : undefined}
        >
          {to === "technical_review" ? <Send /> : to === "verified" ? <ShieldCheck /> : null}
          {to === "technical_review" && q.status.validation === "verified" ? "Back to technical review" : (TRANSITION_LABEL[to] ?? label(to))}
        </Button>
      ))}
      {role === "admin" && q.status.validation === "verified" && q.status.publication === "unpublished" && (
        <Button size="sm" variant="iris" loading={busy === "publish"} disabled={dirty} onClick={() => run("publish", { type: "publish" })}>
          <Upload /> Publish
        </Button>
      )}
      {role === "admin" && q.status.publication === "published" && (
        <Button size="sm" variant="outline" loading={busy === "unpublish"} onClick={() => run("unpublish", { type: "unpublish" })}>
          Unpublish
        </Button>
      )}
      {role !== "author" && (
        <>
          <Button size="sm" variant="outline" onClick={() => (setSmeOpen("approved"), setAttest(false), setNote(""))} disabled={dirty || q.status.smeReview === "approved"}>
            <CheckCircle2 /> SME approve
          </Button>
          <Button size="sm" variant="ghost" onClick={() => (setSmeOpen("changes_requested"), setNote(""))} disabled={dirty}>
            SME: request changes
          </Button>
        </>
      )}
      {role === "admin" &&
        (q.status.publication === "archived" ? (
          <Button size="sm" variant="ghost" loading={busy === "restore"} onClick={() => run("restore", { type: "restore" })}>
            <RotateCcw /> Restore
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="ml-auto text-danger" loading={busy === "archive"} onClick={() => run("archive", { type: "archive" })}>
            <Archive /> Archive
          </Button>
        ))}
      {dirty && <span className="text-[12px] text-warning">Save or discard edits before changing status.</span>}

      <Dialog open={!!smeOpen} onOpenChange={(o) => !o && setSmeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{smeOpen === "approved" ? "Record licensed-engineer approval" : "Request changes"}</DialogTitle>
            <DialogDescription>
              {smeOpen === "approved"
                ? "This marks the item as reviewed by a licensed civil engineer. Learners will see that label, so only approve after checking the problem, key and solution yourself."
                : "The item returns to Needs review and is unpublished until it is fixed and re-verified."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Note (optional)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            </Field>
            {smeOpen === "approved" && (
              <label className="flex items-start gap-2 text-[13px]">
                <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="mt-1" />
                <span>I am a licensed civil engineer and I independently checked this question, its answer key and its solution.</span>
              </label>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              disabled={smeOpen === "approved" && !attest}
              loading={busy === "sme"}
              onClick={async () => {
                await run("sme", { type: "sme", decision: smeOpen!, note: note || undefined, attestLicensed: smeOpen === "approved" ? attest : undefined });
                setSmeOpen(null);
              }}
            >
              {smeOpen === "approved" ? "Approve" : "Request changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Side panels                                                        */
/* ------------------------------------------------------------------ */

function VersionList({ versions, current, onRestore, canEdit }: { versions: VersionEntry[]; current: Draft; onRestore: (q: Draft) => void; canEdit: boolean }) {
  if (!versions.length) return <p className="text-[13px] text-muted">No saved versions yet.</p>;
  return (
    <ol className="space-y-3">
      {versions.map((v) => {
        const changed = (["stem", "choices", "answer", "solution", "finalAnswer", "given", "formulas"] as const).filter((k) => JSON.stringify(v.snapshot[k]) !== JSON.stringify(current[k]));
        return (
          <li key={v.version} className="rounded-lg border border-line p-3 text-[12px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                <span className="font-mono font-semibold">v{v.version}</span> · {v.changedBy} · {formatRelative(v.changedAt)}
              </p>
              {canEdit && changed.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => onRestore(v.snapshot)}>
                  <RotateCcw /> Load into editor
                </Button>
              )}
            </div>
            <p className="mt-1 text-muted">{v.changeReason}</p>
            <p className="mt-1 text-faint">{changed.length ? `Differs from the editor in: ${changed.join(", ")}` : "Same content as the editor"}</p>
          </li>
        );
      })}
    </ol>
  );
}

function ReportList({ reports }: { reports: QuestionReport[] }) {
  if (!reports.length) return <p className="text-[13px] text-muted">No learner reports for this question.</p>;
  return (
    <ul className="space-y-2">
      {reports.map((r) => (
        <li key={r.id} className="rounded-lg border border-line p-3 text-[12px]">
          <div className="flex flex-wrap gap-2">
            <Badge tone={r.status === "open" ? "warning" : r.status === "resolved" ? "success" : "neutral"}>{r.status}</Badge>
            <Badge tone="outline">{label(r.issueType)}</Badge>
            <span className="text-faint">{formatRelative(r.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-fg">{r.description}</p>
          {r.resolution && <p className="mt-1 text-muted">Resolution: {r.resolution}</p>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Form helpers                                                       */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[15px] font-semibold">{children}</h2>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="block">
        {label}
        <span className="mt-1.5 block font-normal">{children}</span>
      </Label>
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  // Uncontrolled text; the editor remounts the form (new key) whenever the record is reloaded.
  const [text, setText] = useState(value.join("\n"));
  return (
    <Field label={label}>
      <Textarea
        value={text}
        rows={Math.min(8, Math.max(3, value.length + 1))}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean),
          );
        }}
      />
    </Field>
  );
}

function CsvField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <Field label={label}>
      <Input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }}
      />
    </Field>
  );
}

function RowsEditor<T extends Record<string, string>>({
  label,
  rows,
  empty,
  onChange,
  fields,
}: {
  label: string;
  rows: T[];
  empty: T;
  onChange: (rows: T[]) => void;
  fields: { key: keyof T & string; label: string; className?: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {rows.map((r, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-line p-2 sm:flex-row sm:items-start">
          <span className="mt-2 hidden w-5 shrink-0 text-center font-mono text-[11px] text-faint sm:block">{i + 1}</span>
          {fields.map((f) =>
            f.key === "text" ? (
              <Textarea
                key={f.key}
                value={r[f.key]}
                rows={2}
                placeholder={f.label}
                aria-label={`${label} ${i + 1}: ${f.label}`}
                onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))}
                className={`min-h-10 ${f.className ?? ""}`}
              />
            ) : (
              <Input
                key={f.key}
                value={r[f.key]}
                placeholder={f.label}
                aria-label={`${label} ${i + 1}: ${f.label}`}
                onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))}
                className={f.className}
              />
            ),
          )}
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${label} ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { ...empty }])}>
        <Plus /> Add
      </Button>
    </div>
  );
}
