"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { adminApi, type Staff } from "@/lib/admin/api";
import type { QuestionReport } from "@/lib/server/qbank/types";
import { formatRelative } from "@/lib/utils";
import { label } from "./status";

type Filter = "active" | "resolved" | "all";

export function ReportsPanel({ staff, onOpen }: { staff: Staff; onOpen: (id: string) => void }) {
  const [reports, setReports] = useState<QuestionReport[] | null>(null);
  const [writable, setWritable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("active");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (staff.role === "author") return;
    adminApi
      .reports()
      .then((r) => {
        setReports(r.reports);
        setWritable(r.writable);
      })
      .catch((e: Error) => setError(e.message));
  }, [staff.role, nonce]);

  const shown = useMemo(
    () => (reports ?? []).filter((r) => (filter === "all" ? true : filter === "active" ? r.status === "open" || r.status === "investigating" : r.status === "resolved" || r.status === "dismissed")),
    [reports, filter],
  );

  if (staff.role === "author") return <ErrorState title="Reviewers and administrators triage reports" />;
  if (error) return <ErrorState title="Couldn't load reports" description={error} />;

  const update = async (r: QuestionReport, status: QuestionReport["status"]) => {
    try {
      await adminApi.updateReport(r.id, status, notes[r.id]?.trim() || undefined);
      toast.success(`Report marked ${status}`);
      setNonce((n) => n + 1);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display-lg font-semibold">Learner error reports</h1>
          <p className="mt-1 text-[13px] text-muted">Reports never change a question automatically. Fix the item in the editor; it then goes back through verification.</p>
        </div>
        <Segmented
          size="sm"
          label="Report filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Open" },
            { value: "resolved", label: "Closed" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      {!reports ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState icon={Flag} title="No reports here" description={filter === "active" ? "Nothing waiting for review." : "No closed reports yet."} />
        </Card>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <li key={r.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <button type="button" className="font-mono font-semibold text-primary-text hover:underline" onClick={() => onOpen(r.questionId)}>
                    {r.questionId}
                  </button>
                  <Badge tone={r.status === "open" ? "warning" : r.status === "investigating" ? "info" : r.status === "resolved" ? "success" : "neutral"}>{r.status}</Badge>
                  <Badge tone="outline">{label(r.issueType)}</Badge>
                  <span className="text-faint">
                    {formatRelative(r.createdAt)} · {r.reportedBy}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[13px]">{r.description}</p>
                {r.resolution && (
                  <p className="mt-2 text-[12px] text-muted">
                    Resolution ({r.reviewedBy}): {r.resolution}
                  </p>
                )}
                {writable && (r.status === "open" || r.status === "investigating") && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Input value={notes[r.id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} placeholder="Resolution note" className="h-9 max-w-sm flex-1" aria-label="Resolution note" />
                    {r.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => update(r, "investigating")}>
                        Investigating
                      </Button>
                    )}
                    <Button size="sm" onClick={() => update(r, "resolved")}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => update(r, "dismissed")}>
                      Dismiss
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
