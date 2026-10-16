import { Fragment } from "react";
import { Tex } from "./tex";

/**
 * Renders the tiny RichText syntax used in content: `$inline math$` and `**bold**`.
 * Server/client safe.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) {
          return <Tex key={i} tex={part.slice(1, -1)} />;
        }
        const bolds = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <Fragment key={i}>
            {bolds.map((b, j) =>
              b.startsWith("**") && b.endsWith("**") && b.length > 4 ? (
                <strong key={j} className="font-semibold text-fg">
                  {b.slice(2, -2)}
                </strong>
              ) : (
                <Fragment key={j}>{b}</Fragment>
              ),
            )}
          </Fragment>
        );
      })}
    </span>
  );
}

/** Strips rich-text syntax for plain-text contexts (search, aria labels). */
const TEX_PLAIN: [RegExp, string][] = [
  [/\^\{?\\circ\}?/g, "°"],
  [/\\circ/g, "°"],
  [/\\%/g, "%"],
  [/\\times/g, "×"],
  [/\\cdot/g, "·"],
  [/\\pi/g, "π"],
  [/\\theta/g, "θ"],
  [/\\gamma/g, "γ"],
  [/\\Delta/g, "Δ"],
  [/\\phi/g, "φ"],
  [/\\beta_?1?/g, "β1"],
  [/\\sigma/g, "σ"],
  [/\\(?:text|mathrm)\{([^}]*)\}/g, "$1"],
  [/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2"],
  [/\\sqrt\{([^}]*)\}/g, "√($1)"],
  [/\\[,;! ]/g, " "],
  [/'/g, "′"],
];

/** Strips rich-text syntax for plain-text contexts (search, previews, aria labels). */
export function plainText(text: string) {
  return text
    .replace(/\$([^$]+)\$/g, (_, t: string) => {
      let out = t;
      for (const [re, rep] of TEX_PLAIN) out = out.replace(re, rep);
      return out.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}]/g, "").replace(/\^/g, "").replace(/_/g, "");
    })
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
