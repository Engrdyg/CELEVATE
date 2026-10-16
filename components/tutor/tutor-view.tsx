"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { ArrowUp, BookOpen, Bot, Check, Copy, History, Info, MessageSquarePlus, NotebookPen, Sparkles, Square, Trash2, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { TutorMessageContent } from "./message-content";
import { SUGGESTED_QUESTIONS, demoProvider, liveProvider, relatedLessonsFor, type TutorProvider } from "@/lib/tutor/providers";
import { useTutor, type TutorMessage } from "@/lib/store/tutor";
import { useProgress } from "@/lib/store/progress";
import { useStoreReady } from "@/hooks/use-hydrated";
import { lessonHref } from "@/lib/content";
import { ease } from "@/lib/motion";
import { cn, formatRelative } from "@/lib/utils";

export function TutorView() {
  const ready = useStoreReady();
  const [provider, setProvider] = useState<TutorProvider | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tutor")
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((d: { available: boolean; model?: string }) => !cancelled && setProvider(d.available && d.model ? liveProvider(d.model) : demoProvider))
      .catch(() => !cancelled && setProvider(demoProvider));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !provider)
    return (
      <div className="flex h-[calc(100dvh-8rem)] gap-4 p-4 sm:p-6 lg:h-[calc(100dvh-4rem)] lg:p-8">
        <Skeleton className="hidden w-72 rounded-2xl lg:block" />
        <Skeleton className="flex-1 rounded-2xl" />
      </div>
    );
  return <Workspace provider={provider} />;
}

function ConversationList({ onPick }: { onPick?: () => void }) {
  const { conversations, activeId, select, newConversation, remove } = useTutor();
  return (
    <div className="flex h-full flex-col">
      <Button
        variant="outline"
        className="mb-3 w-full justify-start"
        onClick={() => {
          newConversation();
          onPick?.();
        }}
      >
        <MessageSquarePlus /> New conversation
      </Button>
      <p className="mb-2 px-1 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">History</p>
      {conversations.length === 0 ? (
        <p className="px-1 text-xs text-muted">Your conversations are saved in this browser.</p>
      ) : (
        <ul className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
          {conversations.map((c) => (
            <li key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => {
                  select(c.id);
                  onPick?.();
                }}
                aria-current={c.id === activeId ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg px-2.5 py-2 pr-9 text-left transition-colors",
                  c.id === activeId ? "bg-primary-soft text-fg" : "text-muted hover:bg-subtle hover:text-fg",
                )}
              >
                <span className="block truncate text-[13px] font-medium">{c.title}</span>
                <span className="block text-[11px] text-faint">{formatRelative(c.updatedAt)}</span>
              </button>
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Delete conversation ${c.title}`}
                className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface hover:text-danger focus-visible:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Workspace({ provider }: { provider: TutorProvider }) {
  const reduce = useReducedMotion();
  const { conversations, activeId, newConversation, append, update } = useTutor();
  const addNote = useProgress((s) => s.addNote);
  const active = conversations.find((c) => c.id === activeId) ?? null;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [active?.messages, reduce]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const convId = active?.id ?? newConversation();
    append(convId, { role: "user", content: q });
    setInput("");
    const history = [...(useTutor.getState().conversations.find((c) => c.id === convId)?.messages ?? [])]
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    const msgId = append(convId, { role: "assistant", content: "", source: provider.kind });
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let acc = "";
    try {
      for await (const chunk of provider.stream(history, ctrl.signal)) {
        acc += chunk;
        update(convId, msgId, { content: acc });
      }
    } catch (err) {
      if (!ctrl.signal.aborted) update(convId, msgId, { content: acc + (acc ? "\n\n" : "") + `⚠ ${err instanceof Error ? err.message : "Something went wrong."}`, error: true });
    } finally {
      if (ctrl.signal.aborted && !acc) update(convId, msgId, { content: "(Stopped.)" });
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const messages = active?.messages ?? [];

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] gap-4 p-3 sm:p-6 lg:h-[calc(100dvh-4rem)] lg:p-6">
      <aside className="hidden w-72 shrink-0 rounded-2xl border border-line bg-card p-3 shadow-elev-1 lg:block" aria-label="Conversation history">
        <ConversationList />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-elev-1" aria-label="CELEVATE AI conversation">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Conversation history">
                <History />
              </Button>
            </DialogTrigger>
            <SheetContent side="left" title="Conversations">
              <div className="h-full p-4 pt-1">
                <ConversationList onPick={() => setHistoryOpen(false)} />
              </div>
            </SheetContent>
          </Dialog>
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-iris text-white">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold">CELEVATE AI</p>
            <p className="truncate text-[11px] text-muted">Engineering study assistant</p>
          </div>
          <Badge tone={provider.kind === "live" ? "success" : "warning"}>
            <span className={cn("size-1.5 rounded-full", provider.kind === "live" ? "bg-success" : "bg-warning")} aria-hidden />
            {provider.label}
          </Badge>
        </header>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={busy}>
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-4 py-10">
              <div className="relative mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-line bg-subtle">
                <div aria-hidden className="absolute -inset-10 -z-0 blueprint-grid-fine mask-fade-edges" />
                <Bot className="relative size-6 text-primary-text" />
              </div>
              <h1 className="text-center font-display text-display-lg font-semibold">Ask an engineering question.</h1>
              <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted">
                Get structured, step-by-step explanations with rendered formulas.{" "}
                {provider.kind === "demo" && "No AI model is connected, so the suggestions below play scripted demonstration answers."}
              </p>
              <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => send(s.q)}
                      className="h-full w-full rounded-xl border border-line bg-surface p-3.5 text-left transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-line-strong"
                    >
                      <span className="font-mono text-[10px] font-semibold tracking-wider text-primary-text">{s.subject}</span>
                      <span className="mt-1 block text-[13px] leading-5 text-fg">{s.q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: ease.outQuart }}
                  >
                    {m.role === "user" ? (
                      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary-strong px-4 py-2.5 text-[14px] leading-6 whitespace-pre-wrap text-primary-fg">{m.content}</div>
                    ) : (
                      <AssistantMessage
                        m={m}
                        question={messages[i - 1]?.content ?? ""}
                        streaming={busy && i === messages.length - 1}
                        onFollowUp={() => {
                          setInput("Can you explain the step about ");
                          inputRef.current?.focus();
                        }}
                        onSave={() => {
                          const prev = messages[i - 1];
                          addNote({ title: (prev?.content ?? "CELEVATE AI explanation").slice(0, 70), body: m.content, source: "tutor" });
                          toast.success("Saved to notes", { description: "Find it in My Review → Notes." });
                        }}
                      />
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
              <div ref={endRef} />
            </ol>
          )}
        </div>

        {/* Composer */}
        <form
          className="border-t border-line bg-surface/60 p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-line-strong bg-surface p-2 shadow-elev-1 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-soft)]">
            <label htmlFor="tutor-input" className="sr-only">
              Ask CELEVATE AI
            </label>
            <textarea
              id="tutor-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={provider.kind === "demo" ? "Ask a question (demo mode)…" : "Ask about a formula, concept or problem…"}
              className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-6 text-fg outline-none placeholder:text-faint"
            />
            {busy ? (
              <Button type="button" size="icon-sm" variant="secondary" aria-label="Stop generating" onClick={() => abortRef.current?.abort()}>
                <Square className="fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon-sm" aria-label="Send" disabled={!input.trim()}>
                <ArrowUp />
              </Button>
            )}
          </div>
          <p className="mx-auto mt-2 flex max-w-3xl items-center justify-center gap-1.5 text-center text-[11px] text-faint">
            <Info className="size-3" aria-hidden /> AI-generated explanations can contain errors. Verify against CELEVATE lessons and official references.
          </p>
        </form>
      </section>
    </div>
  );
}

function AssistantMessage({ m, question, streaming, onFollowUp, onSave }: { m: TutorMessage; question: string; streaming: boolean; onFollowUp: () => void; onSave: () => void }) {
  const [copied, setCopied] = useState(false);
  const related = !streaming && m.content && !m.error ? relatedLessonsFor(`${question} ${m.content}`).slice(0, 3) : [];
  return (
    <div className="max-w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Bot className="size-3.5" aria-hidden /> CELEVATE AI
        </span>
        {m.source === "demo" ? <Badge tone="warning">Demo response — scripted</Badge> : <Badge tone="iris">AI-generated · not verified content</Badge>}
      </div>
      {m.content ? (
        <div className={cn(m.error && "text-danger")}>
          <TutorMessageContent content={m.content} />
          {streaming && <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-[caret_1s_steps(1)_infinite] rounded-sm bg-primary" />}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 py-2" role="status" aria-label="CELEVATE AI is thinking">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 animate-pulse-soft rounded-full bg-primary" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      )}
      {!streaming && m.content && !m.error && (
        <>
          {related.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-faint">Related lessons:</span>
              {related.map((l) => (
                <Link key={l.id} href={lessonHref(l.id)} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-fg hover:border-line-strong">
                  <BookOpen className="size-3 text-primary-text" /> {l.title}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            <Tooltip content="Copy solution">
              <Button
                size="xs"
                variant="ghost"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(m.content);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  } catch {
                    toast.error("Couldn't access the clipboard");
                  }
                }}
              >
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </Tooltip>
            <Button size="xs" variant="ghost" onClick={onSave}>
              <NotebookPen /> Save to notes
            </Button>
            <Button size="xs" variant="ghost" onClick={onFollowUp}>
              <CornerDownRight /> Ask follow-up
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
