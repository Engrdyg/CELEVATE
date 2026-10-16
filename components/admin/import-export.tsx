"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, FileUp, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldHint, Input, Label, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { adminApi, type Staff } from "@/lib/admin/api";
import { CSV_COLUMNS } from "@/lib/qbank/csv";

type ImportResult = Awaited<ReturnType<typeof adminApi.importBank>>;

export function ImportExport({ staff, writable }: { staff: Staff; writable: boolean }) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("Bulk import");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState<"check" | "commit" | null>(null);
  const canImport = writable && staff.role === "admin";
  const canExport = staff.role !== "author";

  const run = async (commit: boolean) => {
    setBusy(commit ? "commit" : "check");
    try {
      const r = await adminApi.importBank({ format, content, commit, reason });
      setResult(r);
      if (commit && r.committed) toast.success(`Imported ${r.imported} question${r.imported === 1 ? "" : "s"} as drafts`);
      else if (!commit) toast(r.errors.length ? `${r.errors.length} problem${r.errors.length === 1 ? "" : "s"} found` : `${r.valid} record${r.valid === 1 ? "" : "s"} ready to import`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-display-lg font-semibold">Import / export</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Import questions</CardTitle>
              <CardDescription>Every record is validated before anything is written. Imports always enter as unpublished drafts.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canImport && <p className="rounded-lg bg-subtle px-3 py-2 text-[12px] text-muted">{writable ? "Only administrators can import." : "Imports need a writable store."}</p>}
            <Segmented
              size="sm"
              label="Import format"
              value={format}
              onChange={(v) => {
                setFormat(v);
                setResult(null);
              }}
              options={[
                { value: "json", label: "JSON" },
                { value: "csv", label: "CSV" },
              ]}
            />
            <div className="space-y-1.5">
              <Label htmlFor="import-file">File</Label>
              <Input
                id="import-file"
                type="file"
                accept={format === "json" ? ".json,application/json" : ".csv,text/csv"}
                disabled={!canImport}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 5_000_000) return toast.error("File is larger than 5 MB");
                  setContent(await f.text());
                  setResult(null);
                }}
                className="py-1.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import-content">…or paste content</Label>
              <Textarea id="import-content" value={content} onChange={(e) => (setContent(e.target.value), setResult(null))} rows={8} className="font-mono text-[12px]" disabled={!canImport} />
              <FieldHint>
                {format === "json"
                  ? "An array of questions, or { \"questions\": [...] } as produced by Export JSON. Status and authoring metadata are reset on import."
                  : `Columns: ${CSV_COLUMNS.join(", ")}. Nested fields (choices, solution, formulas…) are JSON cells.`}
              </FieldHint>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import-reason">Change reason</Label>
              <Input id="import-reason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={!canImport} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => run(false)} loading={busy === "check"} disabled={!canImport || !content.trim()}>
                Validate
              </Button>
              <Button onClick={() => run(true)} loading={busy === "commit"} disabled={!canImport || !result || result.errors.length > 0 || result.valid === 0 || result.committed || reason.trim().length < 3}>
                <FileUp /> Import {result?.valid ?? 0} as drafts
              </Button>
            </div>

            {result && (
              <div className="rounded-xl border border-line p-4 text-[13px]">
                <p className="flex items-center gap-2 font-semibold">
                  {result.errors.length ? <XCircle className="size-4 text-danger" /> : <CheckCircle2 className="size-4 text-success" />}
                  {result.total} record{result.total === 1 ? "" : "s"} · {result.valid} valid · {result.errors.length} with errors
                  {result.committed && <Badge tone="success">{result.imported} imported</Badge>}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto text-[12px]">
                    {result.errors.map((e, i) => (
                      <li key={i}>
                        <span className="font-mono text-danger">{e.row ? `Row ${e.row}` : "File"}{e.id ? ` (${e.id})` : ""}:</span> {e.messages.join("; ")}
                      </li>
                    ))}
                  </ul>
                )}
                {result.warnings.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[12px] text-warning">
                    {result.warnings.map((w) => (
                      <li key={`${w.a}-${w.b}`}>
                        Possible duplicate: {w.a} ↔ {w.b} ({w.kind}, {Math.round(w.score * 100)}%)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Export</CardTitle>
              <CardDescription>Full records including answer keys, solutions, status and version history.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {!canExport && <p className="text-[12px] text-muted">Exports are available to reviewers and administrators.</p>}
            {(
              [
                ["all", "json", "All questions · JSON"],
                ["all", "csv", "All questions · CSV"],
                ["published", "json", "Published only · JSON"],
                ["published", "csv", "Published only · CSV"],
              ] as const
            ).map(([scope, fmt, text]) => (
              <Button key={`${scope}-${fmt}`} asChild variant="outline" className="w-full justify-start" disabled={!canExport}>
                <a href={canExport ? `/api/admin/export?scope=${scope}&format=${fmt}` : undefined} download aria-disabled={!canExport}>
                  <Download /> {text}
                </a>
              </Button>
            ))}
            <FieldHint>Exports contain the answer key. Keep them out of public channels.</FieldHint>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
