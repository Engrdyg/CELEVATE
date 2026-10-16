/** Quick actions that open CELEVATE AI on a verified, already-revealed question. */
export const AI_ACTIONS = [
  { id: "simpler", label: "Explain it more simply", prompt: "Explain this problem and its solution more simply, as if to a classmate." },
  { id: "why-correct", label: "Why is this answer correct?", prompt: "Why is the keyed answer correct? Walk me through the reasoning." },
  { id: "why-wrong", label: "Why are the other choices wrong?", prompt: "Why are the other choices wrong? What mistake leads to each one?" },
  { id: "alternative", label: "Show an alternative method", prompt: "Is there an alternative method to solve this problem? Show it and confirm it gives the same answer." },
  { id: "formulas", label: "Review the formulas used", prompt: "Review the formulas used in this problem: what each variable means and when the formula applies." },
] as const;

export type AiActionId = (typeof AI_ACTIONS)[number]["id"];

export interface QuestionContextRef {
  questionId: string;
  revealToken: string;
  title: string;
}

export function tutorHref(questionId: string, revealToken: string, ask: AiActionId) {
  const p = new URLSearchParams({ q: questionId, rt: revealToken, ask });
  return `/tutor?${p.toString()}`;
}
