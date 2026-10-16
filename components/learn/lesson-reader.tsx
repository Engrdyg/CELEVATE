"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Lock,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  Target,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { Tex } from "@/components/math/tex";
import { RichText, plainText } from "@/components/math/rich-text";
import { QuestionMeta } from "@/components/practice/question-card";
import { adjacentLessons, getChapter, getFormula, getLesson, getQuestion, getSubject } from "@/lib/content";
import { usePrefs } from "@/lib/store/prefs";
import { useProgress } from "@/lib/store/progress";
import { useUI } from "@/lib/store/ui";
import { useStoreReady } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function LessonReader({ lessonId, children }: { lessonId: string; children: React.ReactNode }) {
  const lesson = getLesson(lessonId)!;
  const subject = getSubject(lesson.subjectId)!;
  const chapter = getChapter(lesson.chapterId)!;
  const { prev, next } = adjacentLessons(lessonId);

  const ready = useStoreReady();
  const status = useProgress((s) => s.lessons[lessonId]?.status);
  const bookmarked = useProgress((s) => s.bookmarks.some((b) => b.kind === "lesson" && b.refId === lessonId));
  const visit = useProgress((s) => s.visitLesson);
  const setCompleted = useProgress((s) => s.setLessonCompleted);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);
  const scale = usePrefs((s) => s.readerScale);
  const setScale = usePrefs((s) => s.setReaderScale);
  const focus = useUI((s) => s.focusMode);
  const setFocus = useUI((s) => s.setFocusMode);

  const articleRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: articleRef, offset: ["start 80px", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    if (!ready) return;
    visit(lessonId, { href: `/subjects/${subject.id}/${lessonId}`, title: lesson.title, subtitle: `${subject.code} · Chapter ${chapter.number}` });
  }, [ready, lessonId, visit, subject.id, subject.code, lesson.title, chapter.number]);

  // Leave focus mode whenever this route is hidden or unmounted.
  useLayoutEffect(() => () => useUI.getState().setFocusMode(false), []);
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocus(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, setFocus]);

  const completed = status === "completed";
  const toggleComplete = () => {
    setCompleted(lessonId, !completed);
    if (!completed) toast.success("Lesson completed", { description: next ? `Up next: ${next.title}` : "You've finished the available lessons in this subject." });
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className={cn("sticky z-20 border-b border-line bg-canvas/85 backdrop-blur-xl", focus ? "top-0" : "top-14 lg:top-16")}>
        <div className="flex h-12 items-center gap-2 px-3 sm:px-6 lg:px-8">
          {!focus && (
            <Dialog>
              <Tooltip content="Lessons">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Open lesson navigation">
                    <PanelLeft />
                  </Button>
                </DialogTrigger>
              </Tooltip>
              <SheetContent side="left" title={subject.code} description={subject.name}>
                <ChapterNav subjectId={subject.id} currentId={lessonId} />
              </SheetContent>
            </Dialog>
          )}
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 text-[13px] text-muted">
            <Link href={`/subjects/${subject.id}`} className="shrink-0 font-medium hover:text-fg">
              {subject.code}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-faint" aria-hidden />
            <span className="hidden truncate sm:inline">{chapter.title}</span>
            <ChevronRight className="hidden size-3.5 shrink-0 text-faint sm:block" aria-hidden />
            <span className="truncate text-fg" aria-current="page">
              {lesson.title}
            </span>
          </nav>
          <div className="flex shrink-0 items-center gap-0.5">
            <div className="hidden items-center rounded-lg border border-line sm:flex" role="group" aria-label="Text size">
              <Tooltip content="Smaller text">
                <button type="button" onClick={() => setScale(scale - 0.05)} disabled={scale <= 0.9} className="grid h-8 w-8 place-items-center text-muted hover:text-fg disabled:opacity-40" aria-label="Decrease text size">
                  <Type className="size-3" />
                </button>
              </Tooltip>
              <span className="w-10 text-center font-mono text-[11px] text-muted tabular" aria-live="polite">
                {Math.round(scale * 100)}%
              </span>
              <Tooltip content="Larger text">
                <button type="button" onClick={() => setScale(scale + 0.05)} disabled={scale >= 1.3} className="grid h-8 w-8 place-items-center text-muted hover:text-fg disabled:opacity-40" aria-label="Increase text size">
                  <Type className="size-4" />
                </button>
              </Tooltip>
            </div>
            <Tooltip content={focus ? "Exit focus mode (Esc)" : "Focus mode"}>
              <Button variant="ghost" size="icon-sm" onClick={() => setFocus(!focus)} aria-pressed={focus} aria-label={focus ? "Exit focus mode" : "Enter focus mode"}>
                {focus ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </Tooltip>
            <Tooltip content={bookmarked ? "Remove bookmark" : "Bookmark lesson"}>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-pressed={bookmarked}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
                onClick={() => {
                  const added = toggleBookmark("lesson", lessonId);
                  toast(added ? "Lesson bookmarked" : "Bookmark removed");
                }}
              >
                {bookmarked ? <BookmarkCheck className="text-primary-text" /> : <Bookmark />}
              </Button>
            </Tooltip>
            <Dialog>
              <Tooltip content="Contents & formulas">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={focus ? "" : "2xl:hidden"} aria-label="Open contents and formula reference">
                    <PanelRight />
                  </Button>
                </DialogTrigger>
              </Tooltip>
              <SheetContent side="right" title="Lesson reference" description="Contents and key formulas">
                <div className="p-5 pt-1">
                  <ReferencePanel lessonId={lessonId} articleRef={articleRef} />
                </div>
              </SheetContent>
            </Dialog>
          </div>
        </div>
        <motion.div aria-hidden className="h-0.5 origin-left bg-gradient-to-r from-primary to-iris" style={{ scaleX: progress }} />
      </div>

      <div className={cn("mx-auto flex w-full gap-8 px-4 sm:px-6 lg:px-8", focus ? "max-w-3xl" : "max-w-[96rem]")}>
        {/* Left: chapter navigation */}
        {!focus && (
          <aside className="sticky top-32 hidden max-h-[calc(100dvh-9rem)] w-64 shrink-0 overflow-y-auto py-8 xl:block" aria-label="Lessons in this subject">
            <ChapterNav subjectId={subject.id} currentId={lessonId} />
          </aside>
        )}

        {/* Center: content */}
        <article ref={articleRef} className="min-w-0 flex-1 py-8 sm:py-10" aria-labelledby="lesson-title">
          <div className="reader mx-auto max-w-prose" style={{ ["--reader-scale" as string]: scale }}>
            <header className="mb-10 border-b border-line pb-8 font-sans">
              <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-primary-text uppercase">
                {subject.code} · Chapter {chapter.number} · {chapter.title}
              </p>
              <h1 id="lesson-title" className="mt-3 font-display text-display-lg font-semibold">
                {lesson.title}
              </h1>
              <p className="mt-3 text-[1.02em] leading-relaxed text-muted">{lesson.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-muted">
                  <Clock className="size-3.5" /> {lesson.minutes} min read
                </span>
                <span className="text-faint">·</span>
                {lesson.topics.slice(0, 4).map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
                {completed && (
                  <Badge tone="success">
                    <CheckCircle2 /> Completed
                  </Badge>
                )}
              </div>
            </header>

            {children}

            {/* Completion */}
            <footer className="mt-14 space-y-6 border-t border-line pt-8 font-sans text-base">
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-card p-5 shadow-elev-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-[15px] font-semibold">{completed ? "Lesson completed" : "Finished reading?"}</p>
                  <p className="text-[13px] text-muted">{completed ? "Nice work. Reinforce it with a few practice items." : "Mark it complete to update your progress."}</p>
                </div>
                <Button onClick={toggleComplete} variant={completed ? "outline" : "primary"}>
                  {completed ? <Circle /> : <CheckCircle2 />}
                  {completed ? "Mark as not complete" : "Mark lesson complete"}
                </Button>
              </div>

              {lesson.questionIds.length > 0 && (
                <div>
                  <h2 className="font-display text-[15px] font-semibold">Practice exercises</h2>
                  <ul className="mt-3 grid gap-2">
                    {lesson.questionIds.map((id) => {
                      const q = getQuestion(id);
                      if (!q) return null;
                      return (
                        <li key={id}>
                          <Link href={`/practice?q=${id}`} className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-line-strong">
                            <Target className="size-4 shrink-0 text-primary-text" aria-hidden />
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-1 text-[13px] text-fg">{plainText(q.stem)}</span>
                              <QuestionMeta q={q} className="mt-1.5" />
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-faint group-hover:text-fg" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <nav aria-label="Lesson pagination" className="grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link href={`/subjects/${prev.subjectId}/${prev.id}`} className="group rounded-xl border border-line p-4 transition-colors hover:border-line-strong">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <ArrowLeft className="size-3.5" /> Previous lesson
                    </span>
                    <span className="mt-1 block text-[13px] font-medium">{prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={`/subjects/${next.subjectId}/${next.id}`} className="group rounded-xl border border-line p-4 text-right transition-colors hover:border-line-strong">
                    <span className="flex items-center justify-end gap-1 text-xs text-muted">
                      Next lesson <ArrowRight className="size-3.5" />
                    </span>
                    <span className="mt-1 block text-[13px] font-medium">{next.title}</span>
                  </Link>
                )}
              </nav>
            </footer>
          </div>
        </article>

        {/* Right: reference */}
        {!focus && (
          <aside className="sticky top-32 hidden max-h-[calc(100dvh-9rem)] w-72 shrink-0 overflow-y-auto py-8 2xl:block" aria-label="Lesson reference">
            <ReferencePanel lessonId={lessonId} articleRef={articleRef} />
          </aside>
        )}
      </div>
    </div>
  );
}

function ChapterNav({ subjectId, currentId }: { subjectId: string; currentId: string }) {
  const subject = getSubject(subjectId)!;
  const lessons = useProgress((s) => s.lessons);
  return (
    <nav className="space-y-5 p-4 xl:p-0">
      {subject.chapters.map((ch) => (
        <div key={ch.id}>
          <p className="mb-1.5 px-2 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
            {String(ch.number).padStart(2, "0")} · {ch.title}
          </p>
          <ul className="space-y-0.5">
            {ch.lessons.map((l) => {
              const active = l.id === currentId;
              const st = lessons[l.id]?.status;
              const prep = l.status === "in-preparation";
              const icon = prep ? (
                <Lock className="size-3.5 text-faint" />
              ) : st === "completed" ? (
                <CheckCircle2 className="size-3.5 text-success" />
              ) : (
                <Circle className={cn("size-3.5", active ? "text-primary" : "text-faint")} />
              );
              return (
                <li key={l.id}>
                  {prep ? (
                    <span className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] text-faint" title="In preparation">
                      <span className="mt-0.5">{icon}</span>
                      {l.title}
                    </span>
                  ) : (
                    <Link
                      href={`/subjects/${subjectId}/${l.id}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
                        active ? "bg-primary-soft font-medium text-fg" : "text-muted hover:bg-subtle hover:text-fg",
                      )}
                    >
                      <span className="mt-0.5">{icon}</span>
                      {l.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ReferencePanel({ lessonId, articleRef }: { lessonId: string; articleRef: React.RefObject<HTMLElement | null> }) {
  const lesson = getLesson(lessonId)!;
  const headings = lesson.blocks.filter((b): b is Extract<typeof b, { type: "heading" }> => b.type === "heading");
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-toc]"));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [articleRef]);

  const jump = (id: string) => {
    const el = articleRef.current?.querySelector<HTMLElement>(`[id="${id}"]`);
    el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="space-y-8">
      <nav aria-label="On this page">
        <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">On this page</p>
        <ul className="space-y-0.5 border-l border-line">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => jump(h.id)}
                className={cn(
                  "-ml-px block border-l-2 py-1 pl-3 text-left text-[13px] transition-colors",
                  active === h.id ? "border-primary font-medium text-fg" : "border-transparent text-muted hover:text-fg",
                )}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {lesson.formulaIds.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">Key formulas</p>
          <ul className="space-y-2">
            {lesson.formulaIds.map((id) => {
              const f = getFormula(id);
              if (!f) return null;
              return (
                <li key={id} className="rounded-xl border border-line bg-card p-3">
                  <p className="text-xs font-medium text-muted">{f.name}</p>
                  <Tex tex={f.tex} display className="mt-1 text-[0.95em] text-fg" />
                  <p className="mt-1 text-[11px] leading-4 text-faint">
                    <RichText text={f.description} />
                  </p>
                </li>
              );
            })}
          </ul>
          <Link href="/formulas" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-text hover:underline">
            Open formula library <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
