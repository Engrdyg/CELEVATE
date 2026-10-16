"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionBody, SolutionPanel } from "@/components/practice/question-card";
import { getQuestion, type ChoiceId } from "@/lib/content";
import { useProgress } from "@/lib/store/progress";

/** Practice-mode self-check embedded in a lesson. Attempts count toward analytics. */
export function InlineCheck({ questionId }: { questionId: string }) {
  const q = getQuestion(questionId);
  const record = useProgress((s) => s.recordAttempt);
  const [selected, setSelected] = useState<ChoiceId | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  if (!q) return null;
  return (
    <section className="my-8 rounded-2xl border border-line bg-card p-4 font-sans text-base shadow-elev-1 sm:p-5" aria-label="Check your understanding">
      <p className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-primary-text">
        <HelpCircle className="size-4" aria-hidden /> Check your understanding
      </p>
      <QuestionBody q={q} name={`check-${q.id}`} selected={selected} onSelect={setSelected} revealed={submitted} />
      <div className="mt-4 flex flex-wrap gap-2">
        {!submitted ? (
          <Button
            size="sm"
            disabled={!selected}
            onClick={() => {
              setSubmitted(true);
              record({
                questionId: q.id,
                subjectId: q.subjectId,
                topic: q.topic,
                selected,
                correct: selected === q.answer,
                seconds: Math.round((Date.now() - startedAt.current) / 1000),
                mode: "practice",
              });
            }}
          >
            Check answer
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => (setSubmitted(false), setSelected(null))}>
            <RotateCcw /> Try again
          </Button>
        )}
      </div>
      {submitted && (
        <div className="mt-5 border-t border-line pt-5">
          <SolutionPanel q={q} selected={selected} />
        </div>
      )}
    </section>
  );
}
