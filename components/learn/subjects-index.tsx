"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileQuestion, Layers } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SubjectArt } from "./subject-art";
import { subjects, lessonOutline } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { subjectMastery, lessonCompletion } from "@/lib/analytics";
import { MASTERY_LABEL, MASTERY_TONE, SUBJECT_COLOR } from "@/lib/subject-style";
import { CELE_RULES } from "@/config/cele";

export function SubjectsIndex() {
  const state = useProgress();
  const ready = useStoreReady();
  const mastery = ready ? subjectMastery(state) : [];

  return (
    <PageContainer>
      <PageHeader
        title="Subjects"
        description="The three CELE subject areas, organized into chapters and lessons. Pick up any subject in any order."
      />
      <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {subjects.map((s) => {
          const lc = lessonCompletion(state, s.id);
          const m = mastery.find((x) => x.subjectId === s.id);
          const next =
            lessonOutline.find((l) => l.subjectId === s.id && l.status === "available" && state.lessons[l.id]?.status !== "completed") ??
            lessonOutline.find((l) => l.subjectId === s.id && l.status === "available");
          const started = lc.done > 0 || Object.keys(state.lessons).some((id) => lessonOutline.find((l) => l.id === id)?.subjectId === s.id);
          return (
            <StaggerItem key={s.id}>
              <Card className="group flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-elev-2">
                <div className="relative border-b border-line bg-canvas/40 px-4 pt-4">
                  <div aria-hidden className="absolute inset-0 blueprint-grid-fine opacity-70" />
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider" style={{ color: SUBJECT_COLOR[s.id] }}>
                      {s.code}
                    </span>
                    {m && <Badge tone={MASTERY_TONE[m.status]}>{MASTERY_LABEL[m.status]}</Badge>}
                  </div>
                  <SubjectArt id={s.id} className="relative h-28 w-full" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg leading-snug font-semibold">
                    <Link href={`/subjects/${s.id}`} className="after:absolute after:inset-0 after:content-['']">
                      {s.name}
                    </Link>
                  </h2>
                  <p className="mt-1.5 flex-1 text-[13px] leading-6 text-muted">{s.description}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      [Layers, s.chapters.length, "Chapters"],
                      [BookOpen, s.availableLessonCount, "Lessons"],
                      [FileQuestion, s.questionCount, "Questions"],
                    ].map(([Icon, v, l]) => {
                      const I = Icon as typeof Layers;
                      return (
                        <div key={l as string} className="rounded-lg border border-line bg-subtle/50 py-2">
                          <dt className="sr-only">{l as string}</dt>
                          <dd className="flex items-center justify-center gap-1 font-display text-base font-semibold tabular">
                            <I className="size-3.5 text-faint" aria-hidden /> {v as number}
                          </dd>
                          <dd className="text-[11px] text-muted" aria-hidden>
                            {l as string}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Completion</span>
                      <span className="font-mono">{lc.percent}%</span>
                    </div>
                    <ProgressBar value={lc.percent} label={`${s.code} completion`} />
                  </div>
                  {next && (
                    <Button asChild variant={started ? "primary" : "outline"} className="relative z-10 mt-5 w-full">
                      <Link href={`/subjects/${s.id}/${next.id}`}>
                        {started ? "Continue review" : "Start review"} <ArrowRight />
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-6 text-xs text-faint">
        Subject labels follow the configurable CELE syllabus map. {CELE_RULES.note}
      </p>
    </PageContainer>
  );
}
