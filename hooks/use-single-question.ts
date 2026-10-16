"use client";

import { useCallback, useEffect, useState } from "react";
import { qbankApi, type PublicQuestion, type ReviewQuestion } from "@/lib/qbank/client";
import type { GradedItem } from "@/lib/qbank/engine";
import type { ChoiceKey } from "@/lib/qbank/schema";

export interface SingleCheck {
  item: GradedItem;
  review: ReviewQuestion;
  revealToken: string;
}

/**
 * Loads one published question through the answer-free session API and
 * grades it server-side (instant feedback). Nothing is fetched until `enabled`.
 */
export function useSingleQuestion(questionId: string | undefined, enabled = true) {
  const [state, setState] = useState<{ id?: string; token?: string; q?: PublicQuestion; error?: string }>({});
  const [check, setCheck] = useState<SingleCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [nonce, setNonce] = useState(0);
  const key = `${questionId}:${nonce}`;

  useEffect(() => {
    if (!questionId || !enabled) return;
    const id = `${questionId}:${nonce}`;
    const ctrl = new AbortController();
    qbankApi
      .start({ mode: "random", count: 1, includeIds: [questionId], feedback: "instant", title: "Quick check" }, ctrl.signal)
      .then((r) => {
        const q = r.questions.find((x) => x.id === questionId);
        setState(q ? { id, token: r.token, q } : { id, error: "This question isn't published yet." });
      })
      .catch((e: Error) => e.name !== "AbortError" && setState({ id, error: e.message }));
    return () => ctrl.abort();
  }, [questionId, enabled, nonce]);

  const submit = useCallback(
    async (choice: ChoiceKey) => {
      if (!state.token || !state.q) return null;
      setChecking(true);
      try {
        const r = await qbankApi.check(state.token, state.q.id, choice);
        setCheck(r);
        return r;
      } finally {
        setChecking(false);
      }
    },
    [state.token, state.q],
  );

  /** Fresh attempt: the server re-shuffles choices, so a new session is needed. */
  const reset = useCallback(() => {
    setCheck(null);
    setNonce((n) => n + 1);
  }, []);

  const current = state.id === key ? state : {};
  return { q: current.q, error: current.error, loading: !!questionId && enabled && !current.q && !current.error, check, checking, submit, reset };
}
