"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Copy, FlaskConical, History, Info, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { adminApi, type Overview, type Staff } from "@/lib/admin/api";
import { formatRelative, pct } from "@/lib/utils";

export function AdminOverview({ onOpen, writable, storage, staff }: { onOpen: (id: string) => void; writable: boolean; storage: string; staff: Staff }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyOut, setVerifyOut] = useState<string[] | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .overview()
      .then((d) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  if (error) return <ErrorState title="Couldn't load the overview" description={error} />;
  if (!data)
    return (
      <div className="grid gap-4 sm:grid-cols-3" role="status" aria-label="Loading">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );

  const c = data.counts;
  const stats: [string, number, string][] = [
    ["Generated (all records)", c.generated, "Every stored question, any status"],
    ["Verification passed", c.verificationPassed, "Independent Python recompute or approved conceptual review"],
    ["Verified", c.byValidation.verified ?? 0, "Validation status = verified"],
    ["Published", c.published, "Visible to learners"],
    ["Awaiting human review", c.awaitingHumanReview, "No licensed-engineer (SME) approval yet"],
    ["SME approved", c.smeApproved, "Approved by a human subject-matter expert"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display-lg font-semibold">Question bank overview</h1>
          <p className="mt-1 text-[13px] text-muted">All numbers are computed live from stored records ({storage === "postgres" ? "Postgres" : "JSON file store"}).</p>
        </div>
        {writable && storage === "file" && staff.role !== "author" && (
          <Button
            variant="outline"
            loading={verifying}
            onClick={async () => {
              setVerifying(true);
              try {
                const r = await adminApi.verify();
                setVerifyOut(r.output);
                toast[r.ok ? "success" : "error"](r.ok ? "Verification run complete" : "Verification reported failures");
                setNonce((n) => n + 1);
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setVerifying(false);
              }
            }}
          >
            <Play /> Run Python verification
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map(([label, n, hint]) => (
          <Card key={label} className="p-4">
            <p className="text-[12px] text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular">{n.toLocaleString()}</p>
            <p className="mt-1 text-[11px] leading-4 text-faint">{hint}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] font-semibold">Progress toward the {data.target.toLocaleString()}-question target</p>
          <p className="font-mono text-[12px] text-muted">
            {c.published.toLocaleString()} published · {pct(c.published, data.target)}%
          </p>
        </div>
        <ProgressBar value={pct(c.published, data.target)} className="mt-3" label="Published toward target" />
        <p className="mt-2 text-[11px] text-faint">The target counts only approved, unique, published questions. Drafts and items in review don&apos;t count.</p>
      </Card>

      {verifyOut && (
        <Card className="p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold">
            <FlaskConical className="size-4 text-primary-text" /> Verification output
          </p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-subtle p-3 font-mono text-[11px] leading-5">{verifyOut.join("\n")}</pre>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Coverage by topic</CardTitle>
              <CardDescription>Published / total stored, per syllabus topic</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.coverage.map((s) => (
              <div key={s.subject}>
                <p className="flex items-center justify-between text-[13px] font-semibold">
                  <span>{s.code}</span>
                  <span className="font-mono text-[12px] font-normal text-muted">
                    {c.publishedBySubject[s.subject] ?? 0} / {c.bySubject[s.subject] ?? 0}
                  </span>
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {s.topics.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-line px-2.5 py-1.5 text-[12px]">
                      <span className="truncate">{t.title}</span>
                      <span className={t.total === 0 ? "font-mono text-danger" : "font-mono text-muted"}>
                        {t.published}/{t.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-[13px] font-semibold">Distribution</p>
            <dl className="mt-3 space-y-2 text-[13px]">
              {(["easy", "moderate", "difficult"] as const).map((d) => (
                <div key={d} className="flex justify-between">
                  <dt className="capitalize text-muted">{d}</dt>
                  <dd className="font-mono">
                    {c.byDifficulty[d] ?? 0}{" "}
                    <span className="text-faint">
                      ({pct(c.byDifficulty[d] ?? 0, c.generated)}% · target {Math.round(data.config.difficultyDistribution[d] * 100)}%)
                    </span>
                  </dd>
                </div>
              ))}
              {Object.entries(c.byType).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="capitalize text-muted">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt className="text-muted">Open error reports</dt>
                <dd className="font-mono">{data.openReports}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              {data.duplicates.length ? <AlertTriangle className="size-4 text-warning" /> : <CheckCircle2 className="size-4 text-success" />} Duplicate detection
            </p>
            {data.duplicates.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">No exact, numeric-variant or near-duplicate stems found.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {data.duplicates.slice(0, 12).map((d) => (
                  <li key={`${d.a}-${d.b}`} className="flex flex-wrap items-center gap-2 text-[12px]">
                    <Copy className="size-3.5 text-faint" />
                    <button className="font-mono text-primary-text hover:underline" onClick={() => onOpen(d.a)}>
                      {d.a}
                    </button>
                    ↔
                    <button className="font-mono text-primary-text hover:underline" onClick={() => onOpen(d.b)}>
                      {d.b}
                    </button>
                    <Badge tone={d.kind === "exact" ? "danger" : "warning"}>{d.kind}</Badge>
                    <span className="text-faint">{Math.round(d.score * 100)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              <Info className="size-4 text-info" /> Syllabus verification
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted">
              Status: <strong className="text-fg">{data.taxonomyVerification.status}</strong> (checked {data.taxonomyVerification.checkedAt}).
            </p>
            {data.taxonomyVerification.unverifiedItems.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-5 text-muted">
                {data.taxonomyVerification.unverifiedItems.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Most recent changes to questions and reports</CardDescription>
          </div>
          <History className="size-5 text-muted" aria-hidden />
        </CardHeader>
        <CardContent>
          {data.audit.length === 0 ? (
            <p className="text-[13px] text-muted">No audit entries yet.</p>
          ) : (
            <ul className="divide-y divide-line text-[12px]">
              {data.audit.map((a, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <span className="font-mono text-faint">{formatRelative(a.createdAt)}</span>
                  <Badge tone="neutral">{a.action}</Badge>
                  {a.entity === "question" ? (
                    <button className="font-mono text-primary-text hover:underline" onClick={() => onOpen(a.entityId)}>
                      {a.entityId}
                    </button>
                  ) : (
                    <span className="font-mono">{a.entityId}</span>
                  )}
                  <span className="text-muted">by {a.actor}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
