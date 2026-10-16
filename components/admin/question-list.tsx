"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { adminApi, type QuestionRow, type Staff } from "@/lib/admin/api";
import { taxonomy, topicTitle } from "@/lib/qbank/taxonomy";
import { VALIDATION_STATUSES } from "@/lib/qbank/schema";
import { cn, formatRelative } from "@/lib/utils";
import { StatusBadges } from "./status";

const PAGE = 50;

export function QuestionList({ onOpen, staff, writable }: { onOpen: (id: string) => void; staff: Staff; writable: boolean }) {
  const [rows, setRows] = useState<QuestionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [validation, setValidation] = useState("all");
  const [publication, setPublication] = useState("all");
  const [sme, setSme] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    adminApi
      .list()
      .then((r) => setRows(r.questions))
      .catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (subject === "all" || r.subject === subject) &&
        (topic === "all" || r.topic === topic) &&
        (difficulty === "all" || r.difficulty === difficulty) &&
        (validation === "all" || r.status.validation === validation) &&
        (publication === "all" || r.status.publication === publication) &&
        (sme === "all" || r.status.smeReview === sme) &&
        (!needle || `${r.id} ${r.title} ${r.stem} ${r.author}`.toLowerCase().includes(needle)),
    );
  }, [rows, q, subject, topic, difficulty, validation, publication, sme]);

  const topics = taxonomy.subjects.filter((s) => subject === "all" || s.id === subject).flatMap((s) => s.topics);
  const shown = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(0);
  };

  if (error) return <ErrorState title="Couldn't load questions" description={error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-display-lg font-semibold">Questions</h1>
          <p className="mt-1 text-[13px] text-muted">{rows ? `${filtered.length} of ${rows.length} records` : "Loading…"}</p>
        </div>
        {writable && (
          <Button onClick={() => onOpen("new")}>
            <Plus /> New question
          </Button>
        )}
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput value={q} onChange={reset(setQ)} placeholder="Search id, title, stem, author…" label="Search questions" className="sm:col-span-2" />
        <Select
          label="Subject"
          value={subject}
          onChange={(v) => {
            reset(setSubject)(v);
            setTopic("all");
          }}
          options={[{ value: "all", label: "All subjects" }, ...taxonomy.subjects.map((s) => ({ value: s.id, label: s.code }))]}
        />
        <Select label="Topic" value={topic} onChange={reset(setTopic)} options={[{ value: "all", label: "All topics" }, ...topics.map((t) => ({ value: t.id, label: t.title }))]} />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={reset(setDifficulty)}
          options={[{ value: "all", label: "Any difficulty" }, ...["easy", "moderate", "difficult"].map((d) => ({ value: d, label: d[0].toUpperCase() + d.slice(1) }))]}
        />
        <Select
          label="Validation status"
          value={validation}
          onChange={reset(setValidation)}
          options={[{ value: "all", label: "Any validation" }, ...VALIDATION_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))]}
        />
        <Select
          label="Publication"
          value={publication}
          onChange={reset(setPublication)}
          options={[
            { value: "all", label: "Any publication" },
            { value: "published", label: "Published" },
            { value: "unpublished", label: "Unpublished" },
            { value: "archived", label: "Archived" },
          ]}
        />
        <Select
          label="SME review"
          value={sme}
          onChange={reset(setSme)}
          options={[
            { value: "all", label: "Any SME status" },
            { value: "pending", label: "SME pending" },
            { value: "approved", label: "SME approved" },
            { value: "changes_requested", label: "Changes requested" },
          ]}
        />
      </Card>

      {!rows ? (
        <div className="space-y-2" role="status" aria-label="Loading">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No questions match" description="Adjust the search or filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-[13px]">
              <thead className="border-b border-line bg-subtle/50 text-[11px] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">ID</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Question</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Difficulty</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((r) => (
                  <tr key={r.id} className="cursor-pointer transition-colors hover:bg-subtle/40" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3 align-top font-mono text-[12px]">
                      <button type="button" className="text-primary-text hover:underline" onClick={() => onOpen(r.id)}>
                        {r.id}
                      </button>
                    </td>
                    <td className="max-w-md px-4 py-3 align-top">
                      <p className="font-medium">{r.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {topicTitle(r.topic)} · {r.type}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge tone={r.difficulty === "easy" ? "success" : r.difficulty === "moderate" ? "warning" : "danger"} className="capitalize">
                        {r.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadges status={r.status} verification={r.verification.status} />
                    </td>
                    <td className="px-4 py-3 align-top text-[12px] text-muted">
                      v{r.version}
                      <span className="block text-[11px] text-faint">{formatRelative(r.updatedAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[12px] text-muted">
              <span>
                Page {page + 1} of {pages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      <p className={cn("text-[11px] text-faint", staff.role === "author" ? "" : "hidden")}>Authors can create and edit drafts and submit them for technical review. Reviewers verify; admins publish.</p>
    </div>
  );
}
