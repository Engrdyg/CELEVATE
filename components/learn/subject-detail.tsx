"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft, CircleDashed, Clock, Lock, PlayCircle, Target } from "lucide-react";
import { PageContainer } from "@/components/shell/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/states";
import { SubjectArt } from "./subject-art";
import { getLesson, getSubject, type SubjectId } from "@/lib/content";
import { getCatalogEntry } from "@/lib/qbank/catalog";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { accuracy, lessonCompletion } from "@/lib/analytics";
import { SUBJECT_COLOR } from "@/lib/subject-style";
import { cn } from "@/lib/utils";

type Filter = "all" | "todo" | "completed" | "in-preparation";

export function SubjectDetail({ subjectId }: { subjectId: SubjectId }) {
  const subject = getSubject(subjectId)!;
  const state = useProgress();
  const ready = useStoreReady();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const lc = lessonCompletion(state, subjectId);
  const attempts = state.attempts.filter((a) => a.subjectId === subjectId);
  const acc = accuracy(attempts);
  const lessonStatus = (id: string) => state.lessons[id]?.status;

  const next = subject.chapters
    .flatMap((c) => c.lessons)
    .find((l) => l.status === "available" && lessonStatus(l.id) !== "completed");

  const chapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subject.chapters
      .map((ch) => ({
        ...ch,
        lessons: ch.lessons.filter((l) => {
          const matches = !q || [l.title, l.summary, ...l.topics].join(" ").toLowerCase().includes(q) || ch.title.toLowerCase().includes(q);
          const st = state.lessons[l.id]?.status;
          const pass =
            filter === "all" ||
            (filter === "completed" && st === "completed") ||
            (filter === "todo" && l.status === "available" && st !== "completed") ||
            (filter === "in-preparation" && l.status === "in-preparation");
          return matches && pass;
        }),
      }))
      .filter((ch) => ch.lessons.length > 0);
  }, [subject, query, filter, state.lessons]);

  return (
    <PageContainer>
      <Link href="/subjects" className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-fg">
        <ChevronLeft className="size-4" /> All subjects
      </Link>

      {/* Overview */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1">
        <div aria-hidden className="absolute inset-0 blueprint-grid opacity-50 [mask-image:linear-gradient(90deg,transparent_40%,#000)]" />
        <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <span className="font-mono text-[11px] font-semibold tracking-[0.16em]" style={{ color: SUBJECT_COLOR[subjectId] }}>
              {subject.code} · {Math.round(subject.weight * 100)}% WEIGHT*
            </span>
            <h1 className="mt-2 font-display text-display-lg font-semibold">{subject.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subject.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {next && (
                <Button asChild>
                  <Link href={`/subjects/${subjectId}/${next.id}`}>
                    <PlayCircle /> {lc.done ? "Continue" : "Start"}: {next.title}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={`/practice?subject=${subjectId}`}>
                  <Target /> Practice {subject.code}
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-5 md:flex-col md:items-end">
            <SubjectArt id={subjectId} className="hidden h-24 w-60 md:block" />
            <div className="flex items-center gap-4">
              <ProgressRing value={ready ? lc.percent : 0} size={64} stroke={6} color={SUBJECT_COLOR[subjectId]} label={`${lc.percent}% of lessons complete`}>
                <span className="font-mono text-xs font-semibold">{lc.percent}%</span>
              </ProgressRing>
              <dl className="space-y-0.5 text-xs">
                <div className="flex gap-2">
                  <dt className="text-muted">Lessons</dt>
                  <dd className="font-mono">
                    {lc.done}/{lc.total}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">Attempts</dt>
                  <dd className="font-mono">{attempts.length}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">Accuracy</dt>
                  <dd className="font-mono">{acc == null ? "—" : `${acc}%`}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search chapters, lessons and topics" className="sm:w-80" />
        <Segmented
          size="sm"
          label="Filter lessons"
          value={filter}
          onChange={setFilter}
          className="self-start overflow-x-auto"
          options={[
            { value: "all", label: "All" },
            { value: "todo", label: "To do" },
            { value: "completed", label: "Completed" },
            { value: "in-preparation", label: "In preparation" },
          ]}
        />
      </div>

      {/* Chapters */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Card className="px-2 sm:px-3">
          {chapters.length === 0 ? (
            <EmptyState compact icon={CircleDashed} title="No lessons match" description="Try a different search term or filter." action={<Button size="sm" variant="outline" onClick={() => (setQuery(""), setFilter("all"))}>Reset filters</Button>} />
          ) : (
            <Accordion type="multiple" defaultValue={subject.chapters.map((c) => c.id)} key={`${filter}-${query ? 1 : 0}`}>
              {chapters.map((ch) => {
                const chapterQs = new Set(ch.lessons.flatMap((l) => getLesson(l.id)?.questionIds ?? []).filter((id) => getCatalogEntry(id))).size;
                const done = ch.lessons.filter((l) => lessonStatus(l.id) === "completed").length;
                return (
                  <AccordionItem key={ch.id} value={ch.id} className="px-2 sm:px-3">
                    <AccordionTrigger>
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-subtle font-mono text-xs text-muted">{String(ch.number).padStart(2, "0")}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-[15px] font-semibold">{ch.title}</span>
                          <span className="block text-xs font-normal text-muted">
                            {done}/{ch.lessons.filter((l) => l.status === "available").length} complete · {chapterQs} practice items
                          </span>
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <p className="mb-3 text-[13px] leading-6 text-muted">{ch.summary}</p>
                      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                        {ch.lessons.map((l) => {
                          const st = lessonStatus(l.id);
                          const prep = l.status === "in-preparation";
                          const inner = (
                            <>
                              <span
                                className={cn(
                                  "grid size-7 shrink-0 place-items-center rounded-full",
                                  st === "completed" && "bg-success-soft text-success",
                                  st === "in-progress" && "bg-primary-soft text-primary-text",
                                  !st && !prep && "bg-subtle text-muted",
                                  prep && "bg-subtle text-faint",
                                )}
                              >
                                {prep ? <Lock className="size-3.5" /> : st === "completed" ? <CheckCircle2 className="size-4" /> : st === "in-progress" ? <PlayCircle className="size-4" /> : <CircleDashed className="size-4" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={cn("block truncate text-[13px] font-medium", prep ? "text-muted" : "text-fg")}>{l.title}</span>
                                <span className="block truncate text-xs text-muted">{l.summary}</span>
                              </span>
                              <span className="hidden shrink-0 items-center gap-1 text-xs text-faint sm:flex">
                                <Clock className="size-3.5" /> {l.minutes} min
                              </span>
                              {prep ? (
                                <Badge tone="outline">In preparation</Badge>
                              ) : st === "completed" ? (
                                <Badge tone="success">Done</Badge>
                              ) : st === "in-progress" ? (
                                <Badge tone="primary">In progress</Badge>
                              ) : (
                                <ArrowRight className="size-4 shrink-0 text-faint" />
                              )}
                            </>
                          );
                          return (
                            <li key={l.id}>
                              {prep ? (
                                <div className="flex items-center gap-3 bg-subtle/30 px-3 py-3" aria-disabled="true">
                                  {inner}
                                </div>
                              ) : (
                                <Link href={`/subjects/${subjectId}/${l.id}`} className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-subtle/60">
                                  {inner}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {chapterQs > 0 && (
                        <Button asChild variant="link" size="sm" className="mt-3">
                          <Link href={`/practice?subject=${subjectId}&chapter=${ch.id}`}>
                            Practice this chapter ({chapterQs}) <ArrowRight />
                          </Link>
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:sticky lg:top-24">
          {next && (
            <Card className="p-5">
              <p className="text-xs font-medium text-muted">Recommended next lesson</p>
              <p className="mt-2 font-display text-[15px] font-semibold">{next.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{next.summary}</p>
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href={`/subjects/${subjectId}/${next.id}`}>
                  Open lesson <ArrowRight />
                </Link>
              </Button>
            </Card>
          )}
          <Card className="p-5">
            <p className="text-xs font-medium text-muted">Topics covered</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {Array.from(new Set(subject.chapters.flatMap((c) => c.lessons.flatMap((l) => l.topics))))
                .slice(0, 18)
                .map((t) => (
                  <li key={t}>
                    <button type="button" onClick={() => setQuery(t)} className="rounded-md border border-line bg-subtle/60 px-2 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg">
                      {t}
                    </button>
                  </li>
                ))}
            </ul>
          </Card>
          <p className="px-1 text-[11px] leading-4 text-faint">* Commonly cited subject weight; configurable to match the applicable PRC syllabus.</p>
        </div>
      </div>
    </PageContainer>
  );
}
