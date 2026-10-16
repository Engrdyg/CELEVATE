import { plainText } from "@/components/math/rich-text";
import { lessonOutline } from "@/lib/content";
import type { ReviewQuestion } from "@/lib/qbank/engine";
import { AI_ACTIONS, type QuestionContextRef } from "./asks";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * A tutor provider streams an assistant reply. The UI depends only on this
 * interface, so a different backend can be plugged in without UI changes.
 */
export interface TutorProvider {
  kind: "live" | "demo";
  label: string;
  stream(history: ChatTurn[], signal: AbortSignal, context?: QuestionContextRef): AsyncGenerator<string>;
}

/** Streams from the server route, which calls Claude when an API key is configured. */
export const liveProvider = (model: string): TutorProvider => ({
  kind: "live",
  label: `Connected · ${model}`,
  async *stream(history, signal, context) {
    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, context: context ? { questionId: context.questionId, revealToken: context.revealToken } : undefined }),
      signal,
    });
    if (!res.ok || !res.body) {
      const msg = await res.json().catch(() => ({ error: "The tutor service is unavailable." }));
      throw new Error(msg.error ?? "The tutor service is unavailable.");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },
});

/* ------------------------------------------------------------------ */
/*  Demo provider — scripted, clearly labelled, no model involved      */
/* ------------------------------------------------------------------ */

export const SUGGESTED_QUESTIONS = [
  { id: "curve", subject: "MSTE", q: "How do I find the tangent length and curve length of a simple curve?" },
  { id: "stress", subject: "HGE", q: "Explain effective stress with a quick example." },
  { id: "whitney", subject: "PSAD", q: "Walk me through the Whitney stress block for a singly reinforced beam." },
  { id: "darcy", subject: "HGE", q: "How do I compute head loss with the Darcy–Weisbach equation?" },
];

const SCRIPTED: Record<string, string> = {
  curve: String.raw`For a simple circular curve, everything follows from the radius $R$ and the intersection (central) angle $I$.

Given (example): $R = 300\text{ m}$, $I = 36^\circ$

1. Tangent length — distance from PC (or PT) to the PI:
$$T = R\tan\frac{I}{2} = 300\tan 18^\circ = 97.48\text{ m}$$
2. Length of curve — arc from PC to PT, with $I$ in degrees:
$$L = \frac{\pi R I}{180^\circ} = \frac{\pi(300)(36)}{180} = 188.50\text{ m}$$
3. External distance — from PI to the midpoint of the curve:
$$E = R\left(\sec\frac{I}{2} - 1\right) = 15.44\text{ m}$$

**Final answer:** $T = 97.48\text{ m}$, $L = 188.50\text{ m}$.

Common mistake: stationing the PT as PI + T. The PT is at PC + L, because you travel along the arc, not the tangent.`,
  stress: String.raw`Effective stress is the part of the total stress carried by the soil skeleton. It controls strength and settlement:
$$\sigma' = \sigma - u$$

Given (example): saturated sand, $\gamma_{sat} = 19.5\text{ kN/m}^3$, water table at the ground surface, point at depth $z = 4\text{ m}$, $\gamma_w = 9.81\text{ kN/m}^3$

1. Total vertical stress:
$$\sigma = \gamma_{sat} z = 19.5(4) = 78.00\text{ kPa}$$
2. Pore water pressure (hydrostatic):
$$u = \gamma_w z = 9.81(4) = 39.24\text{ kPa}$$
3. Effective stress:
$$\sigma' = 78.00 - 39.24 = 38.76\text{ kPa}$$

**Final answer:** $\sigma' = 38.76\text{ kPa}$. Equivalently, $\sigma' = (\gamma_{sat} - \gamma_w)z$.

Common mistake: using the total unit weight below the water table without subtracting pore pressure.`,
  whitney: String.raw`In strength design, the curved concrete compression zone is replaced by an equivalent rectangle of depth $a = \beta_1 c$ with uniform stress $0.85f'_c$.

Given (example): $b = 300\text{ mm}$, $d = 500\text{ mm}$, $A_s = 1500\text{ mm}^2$, $f'_c = 28\text{ MPa}$, $f_y = 420\text{ MPa}$ (so $\beta_1 = 0.85$)

1. Equilibrium $C = T$ gives the block depth:
$$a = \frac{A_s f_y}{0.85 f'_c b} = \frac{1500(420)}{0.85(28)(300)} = 88.24\text{ mm}$$
2. Nominal moment from the internal couple:
$$M_n = A_s f_y\left(d - \frac{a}{2}\right) = 630{,}000(455.88) = 287.21\text{ kN·m}$$
3. Check the steel strain with $c = a/\beta_1 = 103.81\text{ mm}$:
$$\varepsilon_t = 0.003\frac{d - c}{c} = 0.0115 > 0.005$$
so the section is tension-controlled and $\phi = 0.90$.

**Final answer:** $\phi M_n = 0.90(287.21) = 258.49\text{ kN·m}$.

Common mistake: forgetting to divide $a$ by $\beta_1$ before computing the strain.`,
  darcy: String.raw`Darcy–Weisbach gives the friction head loss in a pipe:
$$h_L = f\frac{L}{D}\frac{v^2}{2g}$$

Given (example): $f = 0.02$, $L = 300\text{ m}$, $D = 0.30\text{ m}$, $Q = 0.15\text{ m}^3/\text{s}$

1. Flow area:
$$A = \frac{\pi}{4}D^2 = 0.07069\text{ m}^2$$
2. Mean velocity from continuity:
$$v = \frac{Q}{A} = 2.122\text{ m/s}$$
3. Velocity head:
$$\frac{v^2}{2g} = \frac{(2.122)^2}{2(9.81)} = 0.2295\text{ m}$$
4. Head loss:
$$h_L = 0.02\left(\frac{300}{0.30}\right)(0.2295) = 4.59\text{ m}$$

**Final answer:** $h_L \approx 4.59\text{ m}$.

Common mistake: using the radius instead of the diameter in $L/D$.`,
};

const STOP = new Set(["with", "from", "that", "this", "what", "your", "have", "into", "then", "than", "when", "which", "where", "given", "example", "answer", "final", "common", "mistake", "using", "compute", "explain", "quick", "step", "through", "length", "stress", "value", "equation", "formula", "find", "walk"]);

function relatedLessonTitles(text: string) {
  const words = Array.from(new Set(text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w))));
  return lessonOutline
    .filter((l) => l.status === "available")
    .map((l) => {
      const title = l.title.toLowerCase();
      const topics = l.topics.join(" ").toLowerCase();
      // Title hits weigh more than topic hits.
      const score = words.reduce((a, w) => a + (title.includes(w) ? 2 : 0) + (topics.includes(w) ? 1 : 0), 0);
      return { l, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.l.title);
}

function demoReply(question: string) {
  const match = SUGGESTED_QUESTIONS.find((s) => s.q === question.trim());
  if (match) return SCRIPTED[match.id];
  const related = relatedLessonTitles(question);
  return `This is the demo workspace — no AI model is connected, so I can't generate a new explanation for that question.\n\nWhat you can do now:\n1. Try one of the suggested questions to see how CELEVATE AI structures a step-by-step answer.\n2. ${
    related.length ? `Review these related lessons: **${related.join("**, **")}**.` : "Search the formula library or lessons with ⌘K for the topic you need."
  }\n3. Ask your administrator to configure an AI provider (ANTHROPIC_API_KEY on the server) to enable live answers.`;
}

/** Fetches the verified solution for a question the learner has already seen answered. */
export async function fetchRevealedQuestion(ctx: QuestionContextRef, signal?: AbortSignal): Promise<ReviewQuestion> {
  const res = await fetch("/api/qbank/revealed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId: ctx.questionId, revealToken: ctx.revealToken }),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "This question's solution isn't available.");
  return data.question as ReviewQuestion;
}

/**
 * Demo mode with a verified question: no model is involved, so the reply only
 * restates the authored solution, organised around the learner's request.
 */
function groundedDemoReply(raw: ReviewQuestion, ask: string) {
  // Choice letters were shuffled per attempt; drop "(Choice X)" references so nothing points at the wrong letter.
  const noLetters = (t: string) => t.replace(/\s*\((?:Choice|choice) [A-D]\)/g, "");
  const q: ReviewQuestion = {
    ...raw,
    finalAnswer: noLetters(raw.finalAnswer),
    insight: noLetters(raw.insight),
    commonErrors: raw.commonErrors.map(noLetters),
    solution: raw.solution.map((st) => ({ ...st, text: noLetters(st.text) })),
  };
  const action = AI_ACTIONS.find((a) => a.prompt === ask.trim())?.id;
  const head = `Demo mode — no AI model is connected, so this restates the verified CELEVATE solution for **${q.title}** rather than generating a new explanation.\n\n`;
  const steps = q.solution.map((s, i) => `${i + 1}. **${s.title}** — ${s.text}${s.tex ? `\n$$${s.tex}$$` : ""}`).join("\n");
  const formulas = q.formulas.map((f, i) => `${i + 1}. ${f.label}\n$$${f.tex}$$`).join("\n");
  const vars = q.variables.map((v) => `$${v.symbol}$ — ${v.meaning}${v.unit ? ` (${v.unit})` : ""}`).join("\n\n");
  switch (action) {
    case "why-wrong":
      return head + (q.commonErrors.length ? `Each distractor comes from a specific mistake:\n\n${q.commonErrors.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\n**Final answer:** ${q.finalAnswer}` : `The authored solution doesn't list distractor explanations for this item.\n\n**Final answer:** ${q.finalAnswer}`);
    case "formulas":
      return head + `**Formulas used**\n${formulas || "—"}\n\n**Variables**\n${vars || "—"}`;
    case "alternative":
      return head + `Alternative methods need a live AI model. Here is the verified method:\n\n${steps}\n\n**Final answer:** ${q.finalAnswer}`;
    case "why-correct":
      return head + `**Required:** ${q.required}\n\n${steps}\n\n**Final answer:** ${q.finalAnswer}\n\n${q.insight}`;
    default:
      return head + `**What's asked:** ${q.required}\n\n**Given:** ${q.given.join("; ")}\n\n${steps}\n\n**Final answer:** ${q.finalAnswer}\n\n**Key idea:** ${q.insight}`;
  }
}

export const demoProvider: TutorProvider = {
  kind: "demo",
  label: "Demo mode · scripted responses",
  async *stream(history, signal, context) {
    const last = history.filter((h) => h.role === "user").at(-1)?.content ?? "";
    const text = context ? groundedDemoReply(await fetchRevealedQuestion(context, signal), last) : demoReply(last);
    // Simulated streaming in small chunks.
    const tokens = text.match(/(\$\$[^$]+\$\$|\$[^$]+\$|\s+|[^\s$]+)/g) ?? [text];
    await new Promise((r) => setTimeout(r, 450));
    for (const t of tokens) {
      if (signal.aborted) return;
      yield t;
      await new Promise((r) => setTimeout(r, t.startsWith("$") ? 40 : 14));
    }
  },
};

export function relatedLessonsFor(text: string) {
  const titles = relatedLessonTitles(plainText(text));
  return lessonOutline.filter((l) => titles.includes(l.title));
}
