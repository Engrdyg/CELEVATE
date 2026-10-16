"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  source?: "live" | "demo";
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: TutorMessage[];
  updatedAt: string;
}

interface TutorState {
  conversations: Conversation[];
  activeId: string | null;
  newConversation: () => string;
  select: (id: string) => void;
  append: (convId: string, m: Omit<TutorMessage, "id" | "at">) => string;
  update: (convId: string, msgId: string, patch: Partial<TutorMessage>) => void;
  remove: (convId: string) => void;
}

export const useTutor = create<TutorState>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,
      newConversation: () => {
        const id = uid("chat");
        set((s) => ({ conversations: [{ id, title: "New conversation", messages: [], updatedAt: new Date().toISOString() }, ...s.conversations], activeId: id }));
        return id;
      },
      select: (activeId) => set({ activeId }),
      append: (convId, m) => {
        const id = uid("msg");
        const at = new Date().toISOString();
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: c.messages.length === 0 && m.role === "user" ? m.content.slice(0, 60) : c.title,
                  messages: [...c.messages, { ...m, id, at }],
                  updatedAt: at,
                }
              : c,
          ),
        }));
        return id;
      },
      update: (convId, msgId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) } : c)),
        })),
      remove: (convId) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== convId);
          return { conversations, activeId: s.activeId === convId ? (conversations[0]?.id ?? null) : s.activeId };
        }),
    }),
    { name: "celevate-tutor", version: 1, skipHydration: true },
  ),
);
