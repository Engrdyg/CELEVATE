"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionBody, SolutionPanel } from "@/components/practice/question-card";
import { getCatalogEntry } from "@/lib/qbank/catalog";
import type { ChoiceKey } from "@/lib/qbank/schema";
import { useProgress } from "@/lib/store/progress";
import { useInView } from "@/hooks/use-in-view";
import { useSingleQuestion } from "@/hooks/use-single-question";

/** Practice-mode self-check embedded in a lesson. Graded on the server; attempts count toward analytics. */
export function InlineCheck({ questionId }: { questionId: string }) {
  const entry = getCatalogEntry(questionId);
  const record = useProgress((s) => s.recordAttempt);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);
  const { q, error, loading, check, checking, submit, reset } = useSingleQuestion(entry?.id, visible);
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const startedAt = useRef(0);
  useEffect(() => {
    if (q) startedAt.current = Date.now();
  }, [q]);
  if (!entry) return null;
  return (
    <section ref={ref} className="my-8 rounded-2xl border border-line bg-card p-4 font-sans text-base shadow-elev-1 sm:p-5" aria-label="Check your understanding">
      <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-primary-text">
        <HelpCircle className="size-4" aria-hidden /> Check your understanding
      </p>
      {error ? (
        <p className="text-[13px] text-muted">This exercise couldn&apos;t be loaded ({error}).</p>
      ) : loading || !q ? (
        <div role="status" aria-label="Loading question" className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          <QuestionBody q={q} name={`check-${q.id}`} selected={check?.item.selected ?? selected} onSelect={setSelected} answer={check?.item.answer} />
          <div className="mt-4 flex flex-wrap gap-2">
            {!check ? (
              <Button
                size="sm"
                disabled={!selected}
                loading={checking}
                onClick={async () => {
                  if (!selected) return;
                  try {
                    const r = await submit(selected);
                    if (r)
                      record({
                        questionId: q.id,
                        subjectId: q.subject,
                        topic: q.topic,
                        subtopic: q.subtopic,
                        difficulty: q.difficulty,
                        selected,
                        correct: r.item.isCorrect,
                        seconds: Math.round((Date.now() - startedAt.current) / 1000),
                        mode: "practice",
                      });
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
              >
                Check answer
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => (reset(), setSelected(null))}>
                <RotateCcw /> Try again
              </Button>
            )}
          </div>
          {check && (
            <div className="mt-5 border-t border-line pt-5">
              <SolutionPanel q={check.review} selected={check.item.selected} revealToken={check.revealToken} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
