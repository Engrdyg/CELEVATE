"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Bookmark, BookmarkCheck, ChevronDown, Copy, SearchX } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/states";
import { Tooltip } from "@/components/ui/tooltip";
import { Tex } from "@/components/math/tex";
import { RichText, plainText } from "@/components/math/rich-text";
import { allFormulas, lessonHref, lessonOutline, subjects, type Formula, type SubjectId } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { cn } from "@/lib/utils";

export function FormulaLibrary() {
  const params = useSearchParams();
  const highlight = params.get("f");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SubjectId | "all">(() => (highlight ? (allFormulas.find((f) => f.id === highlight)?.subjectId ?? "all") : "all"));
  const [savedOnly, setSavedOnly] = useState(false);
  const bookmarks = useProgress((s) => s.bookmarks);
  const saved = new Set(bookmarks.filter((b) => b.kind === "formula").map((b) => b.refId));

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allFormulas.filter(
      (f) =>
        (subject === "all" || f.subjectId === subject) &&
        (!savedOnly || saved.has(f.id)) &&
        (!q || [f.name, f.category, plainText(f.description), ...f.variables.map((v) => v.meaning)].join(" ").toLowerCase().includes(q)),
    );
    const map = new Map<string, Formula[]>();
    for (const f of list) {
      const key = `${f.subjectId}::${f.category}`;
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return Array.from(map.entries()).map(([k, items]) => ({ subjectId: k.split("::")[0] as SubjectId, category: k.split("::")[1], items }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, subject, savedOnly, bookmarks]);

  const count = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <PageContainer>
      <PageHeader
        title="Formula Library"
        description={`${allFormulas.length} categorized engineering formulas with variables and units explained. Save the ones you want on hand.`}
      />
      <div className="sticky top-14 z-10 -mx-4 mb-6 flex flex-col gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-16 lg:-mx-8 lg:flex-row lg:items-center lg:px-8">
        <SearchInput value={query} onChange={setQuery} placeholder="Search formulas, variables, topics…" className="lg:w-96" />
        <Segmented
          size="sm"
          label="Subject"
          value={subject}
          onChange={setSubject}
          className="self-start"
          options={[{ value: "all", label: "All" }, ...subjects.map((s) => ({ value: s.id, label: s.code }))]}
        />
        <label className="flex items-center gap-2 text-[13px] text-muted lg:ml-auto">
          <Switch checked={savedOnly} onCheckedChange={setSavedOnly} /> Saved only
        </label>
      </div>
      <p className="mb-4 text-xs text-muted" aria-live="polite">
        {count} {count === 1 ? "formula" : "formulas"}
      </p>
      {count === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title={savedOnly ? "No saved formulas yet" : "No formulas found"}
            description={savedOnly ? "Use the bookmark icon on any formula to build your personal reference sheet." : "Try another keyword such as “curve”, “pressure” or “moment”."}
          />
        </Card>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={`${g.subjectId}-${g.category}`} aria-labelledby={`cat-${g.subjectId}-${g.category}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[10px] font-semibold tracking-wider" style={{ color: SUBJECT_COLOR[g.subjectId] }}>
                  {subjects.find((s) => s.id === g.subjectId)?.code}
                </span>
                <h2 id={`cat-${g.subjectId}-${g.category}`} className="font-display text-base font-semibold">
                  {g.category}
                </h2>
                <span className="h-px flex-1 bg-line" aria-hidden />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {g.items.map((f) => (
                  <FormulaCard key={f.id} f={f} saved={saved.has(f.id)} highlighted={highlight === f.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function FormulaCard({ f, saved, highlighted }: { f: Formula; saved: boolean; highlighted: boolean }) {
  const toggle = useProgress((s) => s.toggleBookmark);
  const [open, setOpen] = useState(highlighted);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: "center" });
  }, [highlighted]);
  const lessons = f.relatedLessonIds.map((id) => lessonOutline.find((l) => l.id === id)).filter((l) => l && l.status === "available");

  return (
    <Card ref={ref} className={cn("flex flex-col transition-shadow", highlighted && "ring-2 ring-primary/60")}>
      <div className="flex items-start justify-between gap-2 p-4 pb-0">
        <h3 className="text-[14px] font-semibold">{f.name}</h3>
        <div className="-mt-1 -mr-1 flex">
          <Tooltip content="Copy LaTeX">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy LaTeX for ${f.name}`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(f.tex);
                  toast.success("LaTeX copied");
                } catch {
                  toast.error("Couldn't access the clipboard");
                }
              }}
            >
              <Copy />
            </Button>
          </Tooltip>
          <Tooltip content={saved ? "Remove from saved" : "Save formula"}>
            <Button variant="ghost" size="icon-sm" aria-pressed={saved} aria-label={saved ? `Remove ${f.name} from saved` : `Save ${f.name}`} onClick={() => toggle("formula", f.id)}>
              {saved ? <BookmarkCheck className="text-primary-text" /> : <Bookmark />}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="mx-4 mt-3 rounded-lg border border-line bg-canvas/50 px-3 py-4 text-fg">
        <Tex tex={f.tex} display />
      </div>
      <p className="px-4 pt-3 text-[13px] leading-6 text-muted">
        <RichText text={f.description} />
      </p>
      <div className="mt-auto px-4 pt-2 pb-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-1 text-xs font-medium text-primary-text hover:underline"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} /> {open ? "Hide" : "Show"} variables
        </button>
        {open && (
          <div className="mt-3 space-y-3">
            <table className="w-full text-left text-xs">
              <thead className="text-faint">
                <tr>
                  <th scope="col" className="pb-1.5 font-medium">Symbol</th>
                  <th scope="col" className="pb-1.5 font-medium">Meaning</th>
                  <th scope="col" className="pb-1.5 font-medium">Unit</th>
                </tr>
              </thead>
              <tbody>
                {f.variables.map((v, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-1.5 pr-3">
                      <Tex tex={v.symbol} />
                    </td>
                    <td className="py-1.5 pr-3 text-fg">{v.meaning}</td>
                    <td className="py-1.5 font-mono text-[11px] text-muted">{v.unit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {f.notes && (
              <p className="rounded-lg bg-subtle px-3 py-2 text-xs leading-5 text-muted">
                <RichText text={f.notes} />
              </p>
            )}
            {lessons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lessons.map((l) => (
                  <Link key={l!.id} href={lessonHref(l!.id)} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:border-line-strong hover:text-fg">
                    <BookOpen className="size-3" /> {l!.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
