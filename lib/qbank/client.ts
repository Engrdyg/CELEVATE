"use client";

import type { PublicQuestion, ReviewQuestion } from "./engine";
import type { LearnerGradedItem, ReviewItem, SessionResult, StartRequest, StartResponse } from "@/lib/server/qbank/sessions";
import type { GradedItem } from "./engine";

export type { PublicQuestion, ReviewQuestion, LearnerGradedItem, ReviewItem, SessionResult, StartRequest, StartResponse };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("You appear to be offline. Your answers are saved on this device.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status);
  return data as T;
}

export const qbankApi = {
  start: (req: Partial<StartRequest> & { mode: StartRequest["mode"] }, signal?: AbortSignal) => post<StartResponse>("/api/sessions", req, signal),
  check: (token: string, questionId: string, choice: string) =>
    post<{ item: GradedItem; review: ReviewQuestion; revealToken: string }>("/api/sessions/check", { token, questionId, choice }),
  submit: (body: { token: string; answers: Record<string, string>; flagged: string[]; times?: Record<string, number>; auto?: boolean; learnerId?: string }) =>
    post<SessionResult>("/api/sessions/submit", body),
  review: (resultToken: string) => post<{ title: string; reveal: boolean; revealToken: string | null; items: ReviewItem[] }>("/api/sessions/review", { resultToken }),
  report: (body: { questionId: string; issueType: string; description: string; learnerId?: string }) =>
    post<{ stored: boolean; id?: string; message?: string }>("/api/reports", body),
};
