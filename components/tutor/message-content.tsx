import { RichText } from "@/components/math/rich-text";
import { Tex } from "@/components/math/tex";

type Part = { kind: "p"; text: string } | { kind: "math"; tex: string } | { kind: "step"; n: number; text: string; math: string[] };

/** Parses the tutor's light format: paragraphs, numbered steps and $$display$$ math. */
export function parseTutor(content: string): Part[] {
  // Protect unfinished display math while streaming.
  const pieces = content.split(/(\$\$[\s\S]+?\$\$)/g);
  const lines: { type: "text" | "math"; value: string }[] = [];
  for (const piece of pieces) {
    if (piece.startsWith("$$") && piece.endsWith("$$") && piece.length > 4) lines.push({ type: "math", value: piece.slice(2, -2).trim() });
    else
      piece
        .split("\n")
        .map((l) => l.trimEnd())
        .forEach((l) => lines.push({ type: "text", value: l }));
  }
  const parts: Part[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) parts.push({ kind: "p", text: para.join(" ").replace(/\$\$/g, "") });
    para = [];
  };
  for (const l of lines) {
    if (l.type === "math") {
      flush();
      const last = parts.at(-1);
      if (last?.kind === "step") last.math.push(l.value);
      else parts.push({ kind: "math", tex: l.value });
      continue;
    }
    const step = l.value.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (step) {
      flush();
      parts.push({ kind: "step", n: Number(step[1]), text: step[2], math: [] });
    } else if (!l.value.trim()) {
      flush();
    } else {
      const last = parts.at(-1);
      if (!para.length && last?.kind === "step" && last.math.length === 0 && /^\s{2,}|^-/.test(l.value)) last.text += " " + l.value.trim();
      else para.push(l.value.trim());
    }
  }
  flush();
  return parts;
}

export function TutorMessageContent({ content }: { content: string }) {
  const parts = parseTutor(content);
  return (
    <div className="space-y-3 text-[14px] leading-7 text-fg">
      {parts.map((p, i) =>
        p.kind === "p" ? (
          <p key={i}>
            <RichText text={p.text} />
          </p>
        ) : p.kind === "math" ? (
          <Tex key={i} tex={p.tex} display className="rounded-lg border border-line bg-canvas/60 px-3 py-2" />
        ) : (
          <div key={i} className="rounded-xl border border-line bg-surface p-3.5">
            <div className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[11px] font-semibold text-primary-text">{p.n}</span>
              <div className="min-w-0 flex-1">
                <RichText text={p.text} />
                {p.math.map((m, j) => (
                  <Tex key={j} tex={m} display className="mt-2" />
                ))}
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
