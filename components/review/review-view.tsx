"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Bookmark, ClipboardCheck, History, NotebookPen, PlayCircle, Plus, Sigma, Target, Trash2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { Tex } from "@/components/math/tex";
import { RichText, plainText } from "@/components/math/rich-text";
import { getFormula, getQuestion, getSubject, lessonHref, lessonOutline } from "@/lib/content";
import { activeExam } from "@/lib/analytics";
import { useProgress, type BookmarkKind } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { formatRelative } from "@/lib/utils";

type Tab = "all" | BookmarkKind;

export function ReviewView() {
  const ready = useStoreReady();
  if (!ready)
    return (
      <PageContainer>
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="mt-4 h-80 rounded-xl" />
      </PageContainer>
    );
  return <Review />;
}

function Review() {
  const state = useProgress();
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const addNote = useProgress((s) => s.addNote);
  const deleteNote = useProgress((s) => s.deleteNote);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const exam = activeExam(state);
  const inProgress = Object.entries(state.lessons)
    .filter(([, v]) => v.status === "in-progress")
    .sort((a, b) => b[1].lastVisitedAt.localeCompare(a[1].lastVisitedAt))
    .map(([id, v]) => ({ meta: lessonOutline.find((l) => l.id === id), at: v.lastVisitedAt }))
    .filter((x) => x.meta)
    .slice(0, 4);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bm = state.bookmarks
      .map((b) => {
        if (b.kind === "lesson") {
          const l = lessonOutline.find((x) => x.id === b.refId);
          return l && { key: `l-${b.refId}`, kind: b.kind, refId: b.refId, title: l.title, sub: `${getSubject(l.subjectId)?.code} · Lesson`, href: lessonHref(l.id), at: b.createdAt, search: l.title };
        }
        if (b.kind === "question") {
          const qq = getQuestion(b.refId);
          return qq && { key: `q-${b.refId}`, kind: b.kind, refId: b.refId, title: plainText(qq.stem), sub: `${getSubject(qq.subjectId)?.code} · ${qq.topic}`, href: `/practice?q=${qq.id}`, at: b.createdAt, search: plainText(qq.stem) + qq.topic };
        }
        if (b.kind === "formula") {
          const f = getFormula(b.refId);
          return f && { key: `f-${b.refId}`, kind: b.kind, refId: b.refId, title: f.name, sub: `${getSubject(f.subjectId)?.code} · ${f.category}`, href: `/formulas?f=${f.id}`, at: b.createdAt, search: f.name + f.category, tex: f.tex };
        }
        return null;
      })
      .filter(Boolean) as { key: string; kind: BookmarkKind; refId: string; title: string; sub: string; href: string; at: string; search: string; tex?: string }[];
    return bm.filter((b) => (tab === "all" || b.kind === tab) && (!q || b.search.toLowerCase().includes(q)));
  }, [state.bookmarks, tab, query]);

  const notes = state.notes.filter((n) => !query || (n.title + n.body).toLowerCase().includes(query.toLowerCase()));
  const ICON = { lesson: BookOpen, question: Target, formula: Sigma, note: NotebookPen } as const;

  return (
    <PageContainer>
      <PageHeader title="My Review" description="Pick up exactly where you stopped, and keep the material you've saved in one place." />

      {/* Smart resume */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 blueprint-grid opacity-40 [mask-image:linear-gradient(90deg,transparent_40%,#000)]" />
          <CardContent className="relative">
            <p className="flex items-center gap-2 text-xs font-medium text-muted">
              <History className="size-3.5" /> Smart resume
            </p>
            {state.lastLocation ? (
              <>
                <p className="mt-3 font-display text-xl font-semibold">{state.lastLocation.title}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {state.lastLocation.subtitle} · {formatRelative(state.lastLocation.at)}
                </p>
                <Button asChild className="mt-5">
                  <Link href={state.lastLocation.href}>
                    <PlayCircle /> Resume
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-xl font-semibold">Nothing to resume yet</p>
                <p className="mt-1 text-[13px] text-muted">Open a lesson or start a practice set — CELEVATE will remember your place.</p>
                <Button asChild className="mt-5" variant="outline">
                  <Link href="/subjects">Browse subjects</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Unfinished</CardTitle>
              <CardDescription>Lessons and exams in progress</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {!exam && inProgress.length === 0 ? (
              <p className="text-[13px] text-muted">You have no unfinished lessons or exams.</p>
            ) : (
              <ul className="space-y-1">
                {exam && (
                  <li>
                    <Link href="/exams/take" className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-subtle/60">
                      <ClipboardCheck className="size-4 text-iris-text" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{exam.config.title}</span>
                      <Badge tone="iris">Exam</Badge>
                    </Link>
                  </li>
                )}
                {inProgress.map(({ meta, at }) => (
                  <li key={meta!.id}>
                    <Link href={lessonHref(meta!.id)} className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-subtle/60">
                      <BookOpen className="size-4 text-primary-text" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{meta!.title}</span>
                      <span className="shrink-0 text-xs text-faint">{formatRelative(at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Library */}
      <Card className="mt-4">
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle>Saved library</CardTitle>
            <CardDescription>
              {state.bookmarks.length} bookmarks · {state.notes.length} notes
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
            <Plus /> New note
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="lesson">Lessons</TabsTrigger>
                <TabsTrigger value="question">Questions</TabsTrigger>
                <TabsTrigger value="formula">Formulas</TabsTrigger>
                <TabsTrigger value="note">Notes</TabsTrigger>
              </TabsList>
              <SearchInput value={query} onChange={setQuery} placeholder="Search saved items" className="sm:w-64" />
            </div>
            {(["all", "lesson", "question", "formula"] as const).map((t) => (
              <TabsContent key={t} value={t} className="mt-4">
                {items.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Bookmark}
                    title={query ? "No saved items match" : "Nothing saved here yet"}
                    description="Use the bookmark icon on lessons, practice questions and formulas to collect them here."
                  />
                ) : (
                  <ul className="divide-y divide-line rounded-xl border border-line">
                    {items.map((b) => {
                      const Icon = ICON[b.kind];
                      return (
                        <li key={b.key} className="flex items-center gap-3 px-3 py-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-subtle text-muted">
                            <Icon className="size-4" />
                          </span>
                          <Link href={b.href} className="min-w-0 flex-1">
                            <span className="line-clamp-1 text-[13px] font-medium hover:text-primary-text">{b.title}</span>
                            <span className="block truncate text-xs text-muted">{b.sub}</span>
                          </Link>
                          {b.tex && <Tex tex={b.tex} className="hidden max-w-48 truncate text-sm text-muted md:block" />}
                          <Tooltip content="Remove bookmark">
                            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${b.title}`} onClick={() => (toggleBookmark(b.kind, b.refId), toast("Bookmark removed"))}>
                              <Trash2 />
                            </Button>
                          </Tooltip>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </TabsContent>
            ))}
            <TabsContent value="note" className="mt-4">
              {notes.length === 0 ? (
                <EmptyState
                  compact
                  icon={NotebookPen}
                  title="No notes yet"
                  description="Write your own notes, or save explanations from CELEVATE AI."
                  action={
                    <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
                      <Plus /> New note
                    </Button>
                  }
                />
              ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">{n.title}</p>
                          <p className="text-[11px] text-faint">
                            {n.source === "tutor" ? "Saved from CELEVATE AI" : "Your note"} · {formatRelative(n.createdAt)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" aria-label={`Delete note ${n.title}`} onClick={() => (deleteNote(n.id), toast("Note deleted"))}>
                          <Trash2 />
                        </Button>
                      </div>
                      <p className="mt-2 line-clamp-6 text-[13px] leading-6 whitespace-pre-line text-muted">
                        <RichText text={n.body} />
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
            <DialogDescription>Inline math is supported with $…$, for example $T = R\tan(I/2)$.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!noteTitle.trim()) return;
              addNote({ title: noteTitle.trim(), body: noteBody.trim(), source: "manual" });
              setNoteTitle("");
              setNoteBody("");
              setNoteOpen(false);
              setTab("note");
              toast.success("Note saved");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-body">Note</Label>
              <Textarea id="n-body" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} rows={6} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!noteTitle.trim()}>
                Save note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
