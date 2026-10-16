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
export function plainText(text: string) {
  return text.replace(/\$([^$]+)\$/g, (_, t: string) => t.replace(/\\[a-zA-Z]+/g, " ").replace(/[{}^_]/g, "")).replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}
