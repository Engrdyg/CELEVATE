import { AlertTriangle, BookMarked, GraduationCap, Lightbulb } from "lucide-react";
import { RichText } from "@/components/math/rich-text";
import { Tex } from "@/components/math/tex";
import { EngineeringFigure } from "@/components/figures/figures";
import type { Lesson, LessonBlock } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { InlineCheck } from "./inline-check";

const CALLOUT = {
  concept: { Icon: BookMarked, cls: "border-iris/30 bg-iris-soft", icon: "text-iris-text", label: "Concept" },
  tip: { Icon: Lightbulb, cls: "border-primary/30 bg-primary-soft", icon: "text-primary-text", label: "Tip" },
  warning: { Icon: AlertTriangle, cls: "border-warning/30 bg-warning-soft", icon: "text-warning", label: "Watch out" },
  exam: { Icon: GraduationCap, cls: "border-info/30 bg-info-soft", icon: "text-info", label: "Exam focus" },
} as const;

function Block({ block, figNo }: { block: LessonBlock; figNo: number }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 id={block.id} data-toc className="mt-12 mb-4 scroll-mt-28 font-display text-[1.45em] leading-tight font-semibold tracking-tight first:mt-0">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="my-[1em] text-fg/90">
          <RichText text={block.text} />
        </p>
      );
    case "math":
      return (
        <figure className="my-6 rounded-xl border border-line bg-surface/70 px-4 py-4 shadow-elev-1">
          <Tex tex={block.tex} display className="text-[1.05em] text-fg" />
          {block.label && <figcaption className="mt-2 text-center font-mono text-[11px] text-faint">{block.label}</figcaption>}
        </figure>
      );
    case "callout": {
      const c = CALLOUT[block.tone];
      return (
        <aside className={cn("my-6 rounded-xl border p-4 sm:p-5", c.cls)} aria-label={c.label}>
          <p className={cn("flex items-center gap-2 text-[0.85em] font-semibold", c.icon)}>
            <c.Icon className="size-4" aria-hidden /> {block.title}
          </p>
          <p className="mt-1.5 text-[0.95em] leading-relaxed text-fg">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    }
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className={cn("my-4 space-y-2 pl-6", block.ordered ? "list-decimal marker:font-mono marker:text-[0.8em] marker:text-muted" : "list-disc marker:text-primary")}>
          {block.items.map((it, i) => (
            <li key={i} className="pl-1.5 text-fg/90">
              <RichText text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <figure className="my-6">
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[28rem] border-collapse text-left text-[0.88em]">
              {block.caption && <caption className="sr-only">{block.caption}</caption>}
              <thead className="bg-subtle">
                <tr>
                  {block.head.map((h, i) => (
                    <th key={i} scope="col" className="px-3.5 py-2.5 font-semibold text-fg">
                      <RichText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr key={i} className="border-t border-line even:bg-subtle/30">
                    {r.map((c, j) => (
                      <td key={j} className="px-3.5 py-2.5 align-top text-fg/90">
                        <RichText text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption className="mt-2 text-center text-xs text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "example":
      return (
        <section className="my-8 overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1" aria-label={`Worked example: ${block.title}`}>
          <header className="flex items-center gap-2 border-b border-line bg-subtle/60 px-4 py-3 sm:px-5">
            <span className="rounded-md bg-primary-strong px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary-fg uppercase">Worked example</span>
            <span className="truncate text-[0.88em] font-semibold">{block.title}</span>
          </header>
          <div className="p-4 sm:p-5">
            <p className="text-fg">
              <RichText text={block.problem} />
            </p>
            {block.given && block.given.length > 0 && (
              <div className="mt-4 rounded-lg border border-dashed border-line-strong p-3">
                <p className="mb-1.5 font-mono text-[10px] tracking-wider text-faint uppercase">Given</p>
                <ul className="grid gap-x-6 gap-y-1 text-[0.92em] sm:grid-cols-2">
                  {block.given.map((g, i) => (
                    <li key={i}>
                      <RichText text={g} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ol className="mt-5 space-y-4">
              {block.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] font-semibold text-primary-text">{i + 1}</span>
                  <div className="min-w-0 flex-1 text-[0.95em]">
                    <RichText text={s.text} />
                    {s.tex && <Tex tex={s.tex} display className="mt-2 rounded-lg bg-canvas/60 px-3 py-2" />}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-success/30 bg-success-soft px-3.5 py-2.5 text-[0.95em]">
              <span className="font-semibold text-success">Answer:</span>
              <span className="text-fg">
                <RichText text={block.answer} />
              </span>
            </div>
          </div>
        </section>
      );
    case "figure":
      return (
        <figure className="my-8">
          <EngineeringFigure id={block.figure} className="rounded-2xl border border-line bg-surface/70 p-4 sm:p-6" />
          <figcaption className="mx-auto mt-3 max-w-lg text-center text-[0.8em] leading-5 text-muted">
            <span className="font-mono text-faint">Fig. {figNo} — </span>
            <RichText text={block.caption} />
          </figcaption>
        </figure>
      );
    case "check":
      return <InlineCheck questionId={block.questionId} />;
  }
}

/** Server-renderable lesson content (KaTeX is typeset on the server). */
export function LessonBody({ lesson }: { lesson: Lesson }) {
  let fig = 0;
  return (
    <div>
      {lesson.blocks.map((b, i) => (
        <Block key={i} block={b} figNo={b.type === "figure" ? ++fig : fig} />
      ))}
    </div>
  );
}
