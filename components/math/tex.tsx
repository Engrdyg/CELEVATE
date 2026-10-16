import katex from "katex";
import { cn } from "@/lib/utils";

const cache = new Map<string, string>();

function render(tex: string, display: boolean) {
  const key = (display ? "D:" : "I:") + tex;
  let html = cache.get(key);
  if (html === undefined) {
    try {
      html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore", output: "htmlAndMathml" });
    } catch {
      html = `<code>${tex.replace(/</g, "&lt;")}</code>`;
    }
    if (cache.size > 2000) cache.clear();
    cache.set(key, html);
  }
  return html;
}

/** Renders KaTeX. Works in both server and client components (no hooks). */
export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  if (display) {
    return <div className={cn("math-block", className)} dangerouslySetInnerHTML={{ __html: render(tex, true) }} />;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: render(tex, false) }} />;
}
